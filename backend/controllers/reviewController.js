const Review = require('../models/Review');
const ChargingVisit = require('../models/ChargingVisit');
const Station = require('../models/Station');
const fs = require('fs');
const path = require('path');

/**
 * Helper to recalculate and cache average rating and review count on Station document
 */
async function updateStationReviewStats(stationId) {
  try {
    const stats = await Review.aggregate([
      { $match: { stationId, isReported: false } },
      {
        $group: {
          _id: '$stationId',
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);

    const averageRating = stats.length > 0 ? Number(stats[0].avgRating.toFixed(1)) : 0;
    const reviewCount = stats.length > 0 ? stats[0].count : 0;

    await Station.findOneAndUpdate(
      { uid: stationId },
      { averageRating, reviewCount }
    );

    return { averageRating, reviewCount };
  } catch (err) {
    console.warn(`Failed to update station stats for ${stationId}:`, err.message);
    return { averageRating: 0, reviewCount: 0 };
  }
}

/**
 * GET /api/reviews/station/:stationId
 * Retrieves paginated, sorted reviews for a station along with aggregated summary stats
 */
async function getStationReviews(req, res) {
  try {
    const { stationId } = req.params;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const sort = req.query.sort || 'recent'; // 'recent' | 'highest' | 'lowest' | 'helpful'
    const filterVerified = req.query.verified === 'true';

    const currentUserId = req.user?._id ? req.user._id.toString() : null;

    const query = { stationId, isReported: false };
    if (filterVerified) {
      query.isVerifiedVisit = true;
    }

    // Determine sort ordering
    let sortCriteria = { createdAt: -1 };
    if (sort === 'highest') {
      sortCriteria = { rating: -1, createdAt: -1 };
    } else if (sort === 'lowest') {
      sortCriteria = { rating: 1, createdAt: -1 };
    } else if (sort === 'helpful') {
      sortCriteria = { helpfulCount: -1, createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    const [reviews, totalCount, allStationReviews] = await Promise.all([
      Review.find(query).sort(sortCriteria).skip(skip).limit(limit).lean(),
      Review.countDocuments(query),
      Review.find({ stationId, isReported: false }).select('rating isVerifiedVisit media evFeedback').lean(),
    ]);

    // Compute aggregated summary stats
    const totalReviews = allStationReviews.length;
    let sumRating = 0;
    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let verifiedVisitsCount = 0;
    let totalMediaCount = 0;

    const evSummary = {
      speedFast: 0,
      chargersWorking: 0,
      safeAndLit: 0,
    };

    allStationReviews.forEach((r) => {
      sumRating += r.rating;
      if (ratingDistribution[r.rating] !== undefined) {
        ratingDistribution[r.rating] += 1;
      }
      if (r.isVerifiedVisit) {
        verifiedVisitsCount += 1;
      }
      if (Array.isArray(r.media)) {
        totalMediaCount += r.media.length;
      }
      if (r.evFeedback) {
        if (r.evFeedback.chargingSpeed && r.evFeedback.chargingSpeed.toLowerCase().includes('fast')) {
          evSummary.speedFast += 1;
        }
        if (r.evFeedback.stationCondition && r.evFeedback.stationCondition.toLowerCase().includes('working')) {
          evSummary.chargersWorking += 1;
        }
        if (r.evFeedback.cleanlinessSafety && r.evFeedback.cleanlinessSafety.toLowerCase().includes('safe')) {
          evSummary.safeAndLit += 1;
        }
      }
    });

    const averageRating = totalReviews > 0 ? Number((sumRating / totalReviews).toFixed(1)) : 0;

    // Enrich reviews with user-specific flags (hasVotedHelpful, isOwner)
    const enrichedReviews = reviews.map((r) => ({
      ...r,
      hasVotedHelpful: currentUserId
        ? (r.helpfulVotes || []).some((v) => v.toString() === currentUserId)
        : false,
      isOwner: currentUserId ? r.user.toString() === currentUserId : false,
    }));

    return res.status(200).json({
      success: true,
      stationId,
      stationStats: {
        averageRating,
        totalReviews,
        ratingDistribution,
        verifiedVisitsCount,
        mediaCount: totalMediaCount,
        recommendationPercentage: totalReviews > 0
          ? Math.round(((ratingDistribution[5] + ratingDistribution[4]) / totalReviews) * 100)
          : 0,
        evSummary,
      },
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: page * limit < totalCount,
      },
      reviews: enrichedReviews,
    });
  } catch (err) {
    console.error('Error fetching station reviews:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve charging station reviews.',
      error: err.message,
    });
  }
}

/**
 * GET /api/reviews/station/:stationId/media
 * Retrieves all photos and videos uploaded by community users for this station
 */
async function getStationMedia(req, res) {
  try {
    const { stationId } = req.params;

    const reviews = await Review.find({
      stationId,
      isReported: false,
      'media.0': { $exists: true },
    })
      .select('userName rating isVerifiedVisit media createdAt')
      .sort({ createdAt: -1 })
      .lean();

    const allMedia = [];
    reviews.forEach((review) => {
      (review.media || []).forEach((item) => {
        allMedia.push({
          id: item._id,
          type: item.type,
          url: item.url,
          thumbnailUrl: item.thumbnailUrl || item.url,
          originalName: item.originalName,
          uploaderName: review.userName,
          userRating: review.rating,
          isVerifiedVisit: review.isVerifiedVisit,
          uploadedAt: item.uploadedAt || review.createdAt,
          reviewId: review._id,
        });
      });
    });

    return res.status(200).json({
      success: true,
      stationId,
      totalMedia: allMedia.length,
      media: allMedia,
    });
  } catch (err) {
    console.error('Error fetching station media gallery:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to load media gallery for this station.',
      error: err.message,
    });
  }
}

/**
 * POST /api/reviews/station/:stationId
 * Creates or updates a community review with star ratings, EV experience feedback, and photos/videos
 */
async function submitReview(req, res) {
  try {
    const { stationId } = req.params;
    const userId = req.user._id;
    const userName = req.user.name || 'EV Driver';
    const userEmail = req.user.email || '';

    const rating = Number(req.body.rating);
    const reviewText = (req.body.reviewText || '').trim();

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid rating between 1 and 5 stars.',
      });
    }

    if (!reviewText || reviewText.length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Please write at least a brief comment (min 5 characters) about your experience.',
      });
    }

    // Parse EV-specific feedback fields if provided
    let evFeedback = {};
    if (req.body.evFeedback) {
      if (typeof req.body.evFeedback === 'string') {
        try {
          evFeedback = JSON.parse(req.body.evFeedback);
        } catch {
          evFeedback = {};
        }
      } else {
        evFeedback = req.body.evFeedback;
      }
    }

    // Process uploaded media files
    const mediaItems = [];
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach((file) => {
        const isVideo = file.mimetype.startsWith('video/');
        const relativeUrl = `/uploads/reviews/${file.filename}`;
        mediaItems.push({
          type: isVideo ? 'video' : 'image',
          url: relativeUrl,
          thumbnailUrl: relativeUrl,
          originalName: file.originalname,
          mimeType: file.mimetype,
          sizeBytes: file.size,
          uploadedAt: new Date(),
        });
      });
    }

    // Reliable Verification Check: Check if user has a completed charging journey for this station
    const verifiedVisit = await ChargingVisit.findOne({
      user: userId,
      stationId,
    });
    const isVerifiedVisit = Boolean(verifiedVisit);

    // Check if user already reviewed this station
    let review = await Review.findOne({ stationId, user: userId });

    if (review) {
      // Update existing review
      review.rating = rating;
      review.reviewText = reviewText;
      review.evFeedback = {
        ...review.evFeedback,
        ...evFeedback,
      };
      // Append newly uploaded media items
      if (mediaItems.length > 0) {
        review.media = [...review.media, ...mediaItems];
      }
      if (isVerifiedVisit) {
        review.isVerifiedVisit = true;
      }
      await review.save();
    } else {
      // Create new review
      review = new Review({
        stationId,
        user: userId,
        userName,
        userEmail,
        rating,
        reviewText,
        evFeedback,
        media: mediaItems,
        isVerifiedVisit,
      });
      await review.save();
    }

    // Recalculate station stats and cache in Station model
    const updatedStats = await updateStationReviewStats(stationId);

    return res.status(201).json({
      success: true,
      message: isVerifiedVisit
        ? 'Review submitted with Verified Visit badge!'
        : 'Review submitted successfully! Thank you for sharing with the EV community.',
      review,
      stationStats: updatedStats,
      isVerifiedVisit,
    });
  } catch (err) {
    console.error('Error submitting station review:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit review.',
      error: err.message,
    });
  }
}

/**
 * PUT /api/reviews/:id
 * Updates an existing review owned by the authenticated user
 */
async function updateReview(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id.toString();

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.',
      });
    }

    if (review.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to edit this review.',
      });
    }

    if (req.body.rating) {
      const r = Number(req.body.rating);
      if (r >= 1 && r <= 5) review.rating = r;
    }

    if (req.body.reviewText) {
      review.reviewText = req.body.reviewText.trim();
    }

    if (req.body.evFeedback) {
      let fb = req.body.evFeedback;
      if (typeof fb === 'string') {
        try {
          fb = JSON.parse(fb);
        } catch {}
      }
      review.evFeedback = { ...review.evFeedback, ...fb };
    }

    // Remove specific media IDs if requested
    if (req.body.removeMediaIds) {
      const removeIds = Array.isArray(req.body.removeMediaIds)
        ? req.body.removeMediaIds.map(String)
        : [String(req.body.removeMediaIds)];

      review.media = review.media.filter((m) => !removeIds.includes(String(m._id)));
    }

    // Append newly uploaded files
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach((file) => {
        const isVideo = file.mimetype.startsWith('video/');
        const relativeUrl = `/uploads/reviews/${file.filename}`;
        review.media.push({
          type: isVideo ? 'video' : 'image',
          url: relativeUrl,
          thumbnailUrl: relativeUrl,
          originalName: file.originalname,
          mimeType: file.mimetype,
          sizeBytes: file.size,
          uploadedAt: new Date(),
        });
      });
    }

    await review.save();
    await updateStationReviewStats(review.stationId);

    return res.status(200).json({
      success: true,
      message: 'Review updated successfully.',
      review,
    });
  } catch (err) {
    console.error('Error updating review:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update review.',
      error: err.message,
    });
  }
}

/**
 * DELETE /api/reviews/:id
 * Deletes a review owned by the authenticated user
 */
async function deleteReview(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id.toString();

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.',
      });
    }

    if (review.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this review.',
      });
    }

    const stationId = review.stationId;

    // Optionally delete media files from disk
    if (Array.isArray(review.media)) {
      review.media.forEach((item) => {
        try {
          const filePath = path.join(__dirname, '..', item.url);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (e) {
          console.warn('Could not remove file on review delete:', e.message);
        }
      });
    }

    await Review.findByIdAndDelete(id);
    await updateStationReviewStats(stationId);

    return res.status(200).json({
      success: true,
      message: 'Review deleted successfully.',
    });
  } catch (err) {
    console.error('Error deleting review:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete review.',
      error: err.message,
    });
  }
}

/**
 * POST /api/reviews/:id/helpful
 * Toggles a helpful vote for a review (one vote per user)
 */
async function toggleHelpfulVote(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.',
      });
    }

    // Prevent voting on own review
    if (review.user.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot vote for your own review.',
      });
    }

    const hasVoted = (review.helpfulVotes || []).some(
      (v) => v.toString() === userId.toString()
    );

    if (hasVoted) {
      // Remove vote
      review.helpfulVotes = review.helpfulVotes.filter(
        (v) => v.toString() !== userId.toString()
      );
    } else {
      // Add vote
      review.helpfulVotes.push(userId);
    }

    review.helpfulCount = review.helpfulVotes.length;
    await review.save();

    return res.status(200).json({
      success: true,
      helpfulCount: review.helpfulCount,
      hasVoted: !hasVoted,
    });
  } catch (err) {
    console.error('Error toggling helpful vote:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to register helpful vote.',
      error: err.message,
    });
  }
}

/**
 * POST /api/reviews/:id/report
 * Flags a review for moderation
 */
async function reportReview(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.',
      });
    }

    const alreadyReported = (review.reportedBy || []).some(
      (u) => u.toString() === userId.toString()
    );

    if (!alreadyReported) {
      review.reportedBy.push(userId);
      // Auto-hide review if 3 or more users report it
      if (review.reportedBy.length >= 3) {
        review.isReported = true;
      }
      await review.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Thank you for your report. Our community team will review this content.',
    });
  } catch (err) {
    console.error('Error reporting review:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to report review.',
      error: err.message,
    });
  }
}

/**
 * POST /api/reviews/station/:stationId/record-visit
 * Records a verified charging session/visit for this user and station
 */
async function recordStationVisit(req, res) {
  try {
    const { stationId } = req.params;
    const userId = req.user._id;

    const station = await Station.findOne({ uid: stationId });

    let visit = await ChargingVisit.findOne({ user: userId, stationId });
    if (!visit) {
      visit = new ChargingVisit({
        user: userId,
        stationId,
        stationName: station?.name || req.body.stationName || 'Charging Station',
        verifiedVia: req.body.verifiedVia || 'chargenav_journey',
        journeyDetails: {
          origin: req.body.origin || '',
          destination: req.body.destination || '',
          batteryDepartingPercent: req.body.batteryDepartingPercent || 80,
        },
      });
      await visit.save();
    }

    // Automatically elevate any existing review by this user to Verified Visit!
    await Review.updateMany(
      { user: userId, stationId },
      { $set: { isVerifiedVisit: true } }
    );

    return res.status(200).json({
      success: true,
      message: 'Charging visit recorded. You are now eligible for the Verified Visit badge!',
      isVerifiedVisit: true,
    });
  } catch (err) {
    console.error('Error recording station visit:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to record visit.',
      error: err.message,
    });
  }
}

/**
 * GET /api/reviews/station/:stationId/user-status
 * Checks if the authenticated user has visited or already reviewed this station
 */
async function getUserStationStatus(req, res) {
  try {
    const { stationId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(200).json({
        success: true,
        isAuthenticated: false,
        hasVisited: false,
        hasReviewed: false,
        userReview: null,
      });
    }

    const [visit, existingReview] = await Promise.all([
      ChargingVisit.findOne({ user: userId, stationId }).lean(),
      Review.findOne({ user: userId, stationId }).lean(),
    ]);

    return res.status(200).json({
      success: true,
      isAuthenticated: true,
      hasVisited: Boolean(visit),
      hasReviewed: Boolean(existingReview),
      userReview: existingReview,
    });
  } catch (err) {
    console.error('Error checking user station status:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to check status.',
      error: err.message,
    });
  }
}

module.exports = {
  getStationReviews,
  getStationMedia,
  submitReview,
  updateReview,
  deleteReview,
  toggleHelpfulVote,
  reportReview,
  recordStationVisit,
  getUserStationStatus,
  updateStationReviewStats,
};
