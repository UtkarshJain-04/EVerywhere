const express = require('express');
const {
  getStationRecommendations,
  planRoute,
  planRouteWithStop,
} = require('../controllers/recommendationController');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Direct coordinate-based Python engine recommendations
router.post('/', optionalAuth, getStationRecommendations);

// Origin -> Destination route planner with corridor recommendations
router.post('/route', optionalAuth, planRoute);

// Origin -> Charging Station -> Destination multi-segment route planner
router.post('/route/with-stop', optionalAuth, planRouteWithStop);

module.exports = router;
