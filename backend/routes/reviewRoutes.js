const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { handleUpload } = require('../middleware/upload');

// Public / Optional Auth routes (guests can browse, read reviews and view galleries)
router.get('/station/:stationId', optionalAuth, reviewController.getStationReviews);
router.get('/station/:stationId/media', reviewController.getStationMedia);
router.get('/station/:stationId/user-status', optionalAuth, reviewController.getUserStationStatus);

// Protected routes (authenticated users can submit, vote, record visits, edit/delete)
router.post('/station/:stationId', requireAuth, handleUpload, reviewController.submitReview);
router.post('/station/:stationId/record-visit', requireAuth, reviewController.recordStationVisit);
router.put('/:id', requireAuth, handleUpload, reviewController.updateReview);
router.delete('/:id', requireAuth, reviewController.deleteReview);
router.post('/:id/helpful', requireAuth, reviewController.toggleHelpfulVote);
router.post('/:id/report', requireAuth, reviewController.reportReview);

module.exports = router;

