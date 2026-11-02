const mongoose = require('mongoose');

const chargingVisitSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    stationId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    stationName: {
      type: String,
      default: '',
    },
    verifiedVia: {
      type: String,
      enum: ['chargenav_journey', 'qr_checkin', 'session_completed'],
      default: 'chargenav_journey',
    },
    journeyDetails: {
      origin: { type: String, default: '' },
      destination: { type: String, default: '' },
      batteryDepartingPercent: { type: Number, default: 80 },
    },
    visitedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast lookup of user visit at a specific station
chargingVisitSchema.index({ user: 1, stationId: 1 });

const ChargingVisit = mongoose.model('ChargingVisit', chargingVisitSchema);

module.exports = ChargingVisit;

