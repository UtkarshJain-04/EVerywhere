const express = require('express');
const {
  getStationRecommendations,
  planRoute,
} = require('../controllers/recommendationController');

const router = express.Router();

// Direct coordinate-based Python engine recommendations
router.post('/', getStationRecommendations);

// Origin -> Destination route planner with corridor recommendations
router.post('/route', planRoute);

module.exports = router;
