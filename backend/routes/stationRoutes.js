const express = require('express');
const {
  listStations,
  getStation,
  triggerSeed,
} = require('../controllers/stationController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', listStations);
router.post('/seed', requireAuth, triggerSeed);
router.get('/:id', getStation);

module.exports = router;
