const mongoose = require('mongoose');
const config = require('./config/env');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  const uri = config.mongoUri;

  if (!uri) {
    console.error('❌ MongoDB Connection Error: No MONGO_URI provided in environment.');
    console.warn('⚠️ Server will operate in resilient mode without active MongoDB connection.');
    return;
  }

  try {
    const conn = await mongoose.connect(uri);
    isConnected = true;
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB runtime error:', err.message);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected.');
      isConnected = false;
    });
  } catch (error) {
    console.error(`❌ MongoDB Connection Failed: ${error.message}`);
    console.warn('⚠️ Tip: Ensure MongoDB is running locally or supply a valid MONGO_URI (e.g. MongoDB Atlas) in backend/.env.');
    console.warn('⚠️ ChargeNav will continue running so recommendation and station services remain functional.');
  }
};

module.exports = connectDB;
