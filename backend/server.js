const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config/env');
const connectDB = require('./db');
const { seedStations } = require('./services/stationDataService');
const { seedInitialReviews } = require('./services/seedReviewsService');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const stationRoutes = require('./routes/stationRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const app = express();

// Initialize MongoDB connection & seed dataset on startup
connectDB().then(() => {
  seedStations()
    .then(() => seedInitialReviews())
    .catch((err) =>
      console.warn('Initial station sync skipped or failed:', err.message)
    );
});

// Configure CORS
const allowedOrigins = [
  config.frontendOrigin,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin) || config.nodeEnv === 'development') {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked request from origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Body Parsing Middleware
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    platform: 'ChargeNav API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

app.get('/', (req, res) => {
  res.send('⚡ ChargeNav API is running smoothly.');
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/reviews', reviewRoutes);

// Error Handling Middleware
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`🚀 ChargeNav Server running in ${config.nodeEnv} mode on port ${PORT}`);
  console.log(`🔌 API Health available at http://localhost:${PORT}/api/health`);
});

// Process-level error protection to keep server resilient
process.on('unhandledRejection', (reason) => {
  console.error('⚠️ Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('⚠️ Uncaught Exception:', err);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server.');
  server.close(() => {
    console.log('HTTP server closed.');
  });
});

module.exports = app;
