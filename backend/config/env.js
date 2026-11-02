const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/chargenav',
  jwtSecret: process.env.JWT_SECRET || 'chargenav_default_fallback_jwt_secret_dev_only',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  pythonPath: process.env.PYTHON_PATH || 'python',
  excelDatasetPath: process.env.EXCEL_DATASET_PATH || path.resolve(__dirname, '..', '..', 'recom_model', 'charging_stations.xlsx'),
};

function validateEnv() {
  const warnings = [];

  if (!process.env.MONGO_URI) {
    warnings.push('MONGO_URI is not explicitly defined in .env; falling back to default "mongodb://127.0.0.1:27017/chargenav".');
  }

  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your_jwt_secret_key_here') {
    warnings.push('JWT_SECRET is using a default development key. Set a strong secret in production.');
  }

  if (warnings.length > 0) {
    console.warn('\n⚠️ [ChargeNav Config Warnings]:');
    warnings.forEach((w) => console.warn(`   - ${w}`));
    console.warn('');
  }
}

validateEnv();

module.exports = config;
