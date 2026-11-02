const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    vendor_name: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    city: {
      type: String,
      default: 'New Delhi',
      index: true,
    },
    country: {
      type: String,
      default: 'India',
    },
    latitude: {
      type: Number,
      required: true,
      index: true,
    },
    longitude: {
      type: Number,
      required: true,
      index: true,
    },
    capacity: {
      type: Number, // kW
      default: 0,
      index: true,
    },
    cost_per_unit: {
      type: String,
      default: '',
    },
    available: {
      type: Number,
      default: 0,
      index: true,
    },
    total: {
      type: Number,
      default: 0,
    },
    power_type: {
      type: String,
      default: 'AC',
      index: true,
    },
    charger_type: {
      type: String,
      default: '',
    },
    vehicle_type: {
      type: String,
      default: "['4W']",
    },
    open: {
      type: String,
      default: '00:00:00',
    },
    close: {
      type: String,
      default: '23:59:59',
    },
    logo_url: {
      type: String,
      default: '',
    },
    staff: {
      type: String,
      default: '',
    },
    payment_modes: {
      type: String,
      default: '',
    },
    contact_numbers: {
      type: String,
      default: '',
    },
    zone: {
      type: String,
      default: '',
    },
    postal_code: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for geographical proximity queries
stationSchema.index({ latitude: 1, longitude: 1 });

const Station = mongoose.model('Station', stationSchema);

module.exports = Station;
