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

      if (!uri || uri.includes('<db_password>') || uri.includes('YOUR_MONGODB_URI')) {
        console.log('⚠️ MONGODB_URI placeholder detected. Initializing MongoMemoryServer fallback...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        uri = mongod.getUri();
        console.log('✅ In-Memory MongoDB running at:', uri);
      }

      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 7000
      });
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

      try {
        console.log('🔄 Primary MongoDB connection failed. Initializing MongoMemoryServer fallback...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        const fallbackUri = mongod.getUri();
        const conn = await mongoose.connect(fallbackUri);
        console.log(`✅ Fallback In-Memory MongoDB Connected: ${conn.connection.host}`);

        const User = require('../models/User');
        const userCount = await User.countDocuments();
        if (userCount === 0) {
          console.log('🌱 Database is empty. Triggering automatic initial seed data...');
          const seedData = require('../seed/seedData');
          await seedData();
        }
        return conn;
      } catch (fallbackErr) {
        console.error(`❌ Fallback MongoDB connection error: ${fallbackErr.message}`);
        throw error;
      }
    }
  })();

  return connectPromise;
};

module.exports = connectDB;
