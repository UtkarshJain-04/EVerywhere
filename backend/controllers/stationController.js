const {
  getStations,
  getStationById,
  seedStations,
} = require('../services/stationDataService');

// @desc    Get all charging stations with optional filtering
// @route   GET /api/stations
// @access  Public
const listStations = async (req, res, next) => {
  try {
    const stations = await getStations(req.query);
    return res.status(200).json({
      success: true,
      count: stations.length,
      data: stations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single charging station by uid or id
// @route   GET /api/stations/:id
// @access  Public
const getStation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const station = await getStationById(id);

    if (!station) {
      return res.status(404).json({
        success: false,
        message: `Charging station with identifier "${id}" not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      data: station,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Seed / sync station records from Excel into MongoDB
// @route   POST /api/stations/seed
// @access  Private / Admin
const triggerSeed = async (req, res, next) => {
  try {
    const result = await seedStations();
    return res.status(200).json({
      success: true,
      message: 'Charging stations database synchronized with dataset.',
      details: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listStations,
  getStation,
  triggerSeed,
};
