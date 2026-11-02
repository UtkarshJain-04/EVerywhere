const mongoose = require('mongoose');

const mediaItemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['image', 'video'],
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
      default: '',
    },
    originalName: {
      type: String,
      default: '',
    },
    mimeType: {
      type: String,
      default: '',
    },
    sizeBytes: {
      type: Number,
      default: 0,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const reviewSchema = new mongoose.Schema(
  {
    stationId: {
      type: String,
      required: [true, 'Station ID is required'],
      index: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    userEmail: {
      type: String,
      default: '',
    },
    userAvatar: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required (1-5 stars)'],
      min: [1, 'Minimum rating is 1 star'],
      max: [5, 'Maximum rating is 5 stars'],
      index: true,
    },
    reviewText: {
      type: String,
      required: [true, 'Please provide your review thoughts'],
      trim: true,
      maxlength: [2000, 'Review cannot exceed 2000 characters'],
    },
    evFeedback: {
      chargingSpeed: {
        type: String,
        default: '',
        trim: true,
      },
      stationCondition: {
        type: String,
        default: '',
        trim: true,
      },
      connectorAvailability: {
        type: String,
        default: '',
        trim: true,
      },
      waitTime: {
        type: String,
        default: '',
        trim: true,
      },
      cleanlinessSafety: {
        type: String,
        default: '',
        trim: true,
      },
      pricingExperience: {
        type: String,
        default: '',
        trim: true,
      },
    },
    media: [mediaItemSchema],
    helpfulVotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    helpfulCount: {
      type: Number,
      default: 0,
      index: true,
    },
    isVerifiedVisit: {
      type: Boolean,
      default: false,
      index: true,
    },
    reportedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isReported: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to quickly fetch reviews for a station sorted by rating or date
reviewSchema.index({ stationId: 1, createdAt: -1 });
reviewSchema.index({ stationId: 1, rating: -1 });
reviewSchema.index({ stationId: 1, helpfulCount: -1 });

// Ensure a user has at most one active review per station (prevents duplicate spam)
reviewSchema.index({ stationId: 1, user: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;

