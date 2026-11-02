const { getPythonRecommendations } = require('../services/pythonRecommendationService');
const { planEVRoute } = require('../services/routingService');

// @desc    Get ranked station recommendations based on user location & preferences via Python engine
// @route   POST /api/recommendations
// @access  Public
const getStationRecommendations = async (req, res, next) => {
  try {
    const { latitude, longitude, battery, min_charging_speed, minSpeed, power_type, vehicle_type } = req.body;

    if (latitude === undefined || longitude === undefined || latitude === null || longitude === null) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid latitude and longitude coordinates.',
      });
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return res.status(400).json({
        success: false,
        message: 'Coordinates must be valid numbers: latitude between -90 and 90, longitude between -180 and 180.',
      });
    }

    const query = {
      latitude: lat,
      longitude: lon,
      battery: battery !== undefined ? parseFloat(battery) : 50,
      min_charging_speed: min_charging_speed !== undefined ? parseFloat(min_charging_speed) : (minSpeed !== undefined ? parseFloat(minSpeed) : 0),
      power_type,
      vehicle_type,
    };

    const result = await getPythonRecommendations(query);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error || 'Failed to generate recommendations.',
        total: 0,
        results: [],
      });
    }

    return res.status(200).json({
      success: true,
      total: result.total,
      results: result.results,
      user_query: result.user_query,
      message: result.message || undefined,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Plan an EV journey from starting location to destination with corridor recommendations
// @route   POST /api/recommendations/route
// @access  Public (Optional auth for personalized vehicle specs)
const planRoute = async (req, res, next) => {
  try {
    const {
      from,
      to,
      battery,
      minSpeed,
      min_charging_speed,
      powerType,
      vehicleType,
      corridorKm,
      vehicle,
    } = req.body;

    if (!from || !to || !from.trim() || !to.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both a starting location and a destination.',
      });
    }

    // Resolve vehicle: prefer vehicle sent explicitly in body, or fallback to authenticated user's vehicle
    const activeVehicle =
      vehicle && vehicle.model
        ? vehicle
        : (req.user && req.user.vehicle && req.user.vehicle.model ? req.user.vehicle : null);

    const result = await planEVRoute({
      from: from.trim(),
      to: to.trim(),
      battery: battery !== undefined ? Number(battery) : 50,
      minSpeed: minSpeed !== undefined ? Number(minSpeed) : (min_charging_speed !== undefined ? Number(min_charging_speed) : 0),
      powerType,
      vehicleType,
      corridorKm: corridorKm !== undefined ? Number(corridorKm) : 3,
      vehicle: activeVehicle,
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStationRecommendations,
  planRoute,
};
