const mongoose = require('mongoose');

let connectPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }
  if (connectPromise) {
    return connectPromise;
  }

  connectPromise = (async () => {
    try {
      let uri = process.env.MONGODB_URI;

      if (!uri || uri.includes('<db_password>')) {
        console.log('⚠️ MONGODB_URI placeholder detected. Initializing MongoMemoryServer for fallback...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        uri = mongod.getUri();
        console.log('✅ In-Memory MongoDB running at:', uri);
      }

      const conn = await mongoose.connect(uri);
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

      const User = require('../models/User');
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('🌱 Database is empty. Triggering automatic initial seed data...');
        const seedData = require('../seed/seedData');
        await seedData();
      }
      return conn;
    } catch (error) {
      console.error(`❌ MongoDB connection error: ${error.message}`);
      connectPromise = null;
      throw error;
    }
  })();

  return connectPromise;
};

module.exports = connectDB;
