const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/env');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      name: user.name,
    },
    config.jwtSecret,
    {
      expiresIn: config.jwtExpiresIn,
    }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res, next) => {
  try {
    const { name, fullName, email, password, confirmPassword } = req.body;
    const userName = (name || fullName || '').trim();

    if (!userName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your full name.',
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address format.',
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match. Please re-enter your password.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.',
      });
    }

    // Create user in MongoDB
    const user = await User.create({
      name: userName,
      email: normalizedEmail,
      password,
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to ChargeNav.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        vehicle: user.vehicle,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both your email address and password.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please check your credentials.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please check your credentials.',
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        vehicle: user.vehicle,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently logged in user profile
// @route   GET /api/auth/me
// @access  Private (requires JWT)
const getMe = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated.',
      });
    }

    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear token on client
// @route   POST /api/auth/logout
// @access  Public
const logout = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

// @desc    Update or save user's vehicle profile
// @route   PUT /api/auth/vehicle
// @access  Private (requires JWT)
const updateVehicle = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.',
      });
    }

    const {
      brand,
      model,
      batteryCapacity,
      rangeKm,
      vehicleType,
      maxChargingSpeed,
      connectorType,
    } = req.body;

    if (!model || !String(model).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your vehicle model name.',
      });
    }

    const cap = parseFloat(batteryCapacity);
    if (isNaN(cap) || cap <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid battery capacity in kWh (greater than 0).',
      });
    }

    const range = parseFloat(rangeKm);
    if (isNaN(range) || range <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid driving range in km (greater than 0).',
      });
    }

    const maxSpeed = parseFloat(maxChargingSpeed);
    if (isNaN(maxSpeed) || maxSpeed <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid maximum charging capacity in kW (greater than 0).',
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
    }

    user.vehicle = {
      brand: (brand || '').trim(),
      model: (model || '').trim(),
      batteryCapacity: cap,
      rangeKm: range,
      vehicleType: (vehicleType || 'Electric Car').trim(),
      maxChargingSpeed: maxSpeed,
      connectorType: (connectorType || 'CCS2').trim(),
      updatedAt: new Date(),
    };

    // Synchronize top-level fields for backwards compatibility
    user.vehicleModel = user.vehicle.model;
    user.batteryCapacity = cap;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Vehicle details saved successfully.',
      vehicle: user.vehicle,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        vehicle: user.vehicle,
        vehicleModel: user.vehicleModel,
        batteryCapacity: user.batteryCapacity,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove user's vehicle profile
// @route   DELETE /api/auth/vehicle
// @access  Private (requires JWT)
const deleteVehicle = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.',
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
    }

    user.vehicle = {
      brand: '',
      model: '',
      batteryCapacity: 50,
      rangeKm: 300,
      vehicleType: 'Electric Car',
      maxChargingSpeed: 50,
      connectorType: 'CCS2',
      updatedAt: new Date(),
    };
    user.vehicleModel = '';
    user.batteryCapacity = 50;

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Vehicle details removed successfully.',
      vehicle: user.vehicle,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        vehicle: user.vehicle,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  getMe,
  logout,
  updateVehicle,
  deleteVehicle,
};
