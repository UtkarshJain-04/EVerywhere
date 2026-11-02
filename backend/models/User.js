const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    vehicleModel: {
      type: String,
      default: '',
    },
    batteryCapacity: {
      type: Number,
      default: 50,
    },
    preferredMinSpeed: {
      type: Number,
      default: 0,
    },
    vehicle: {
      brand: { type: String, default: '', trim: true },
      model: { type: String, default: '', trim: true },
      batteryCapacity: { type: Number, default: 50 }, // kWh
      rangeKm: { type: Number, default: 300 }, // km
      vehicleType: { type: String, default: 'Electric Car', trim: true }, // 'Electric Car' | 'Electric Scooter'
      maxChargingSpeed: { type: Number, default: 50 }, // kW (max charging capacity)
      connectorType: { type: String, default: 'CCS2', trim: true }, // CCS2, Type 2, CHAdeMO, etc.
      updatedAt: { type: Date, default: Date.now },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Exclude password from serialized JSON
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
