const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'reviews');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage engine configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique sanitized filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const sanitizedOriginal = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const ext = path.extname(sanitizedOriginal).toLowerCase();
    cb(null, `review-${uniqueSuffix}${ext}`);
  },
});

// Allowed MIME types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

// File filter function
const fileFilter = (req, file, cb) => {
  const isImage = ALLOWED_IMAGE_TYPES.includes(file.mimetype);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.mimetype);

  if (isImage || isVideo) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Unsupported file type "${file.mimetype}". Please upload JPG, PNG, WEBP images or MP4, WEBM videos.`
      ),
      false
    );
  }
};

// Configure multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 45 * 1024 * 1024, // 45MB max per file (generous for short EV charger videos)
    files: 6, // Max 6 files total per review
  },
});

// Middleware for review uploads: up to 5 images and 1 video (or up to 6 media files total)
const reviewMediaUpload = upload.array('media', 6);

// Wrapper to handle Multer errors gracefully
const handleUpload = (req, res, next) => {
  reviewMediaUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size too large. Images must be under 10MB and videos under 45MB.',
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          message: 'Too many files uploaded. Maximum 6 media files per review.',
        });
      }
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`,
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
    next();
  });
};

module.exports = {
  handleUpload,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
};

