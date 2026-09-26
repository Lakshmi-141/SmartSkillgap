require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./utils/logger');

const seedPlatformDataIfEmpty = require('./utils/seedPlatformData');

const PORT = process.env.PORT || 5000;

// Connect Database & Seed Initial Platform Data
connectDB().then(() => {
  seedPlatformDataIfEmpty();
});

const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
});

module.exports = server;
