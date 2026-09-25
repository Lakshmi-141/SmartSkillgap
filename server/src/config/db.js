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
      const isPlaceholder = !uri || uri.includes('<db_password>') || uri.includes('YOUR_MONGODB_URI');
      const isVercel = !!(process.env.VERCEL || process.env.VERCEL_ENV);
      const isProd = process.env.NODE_ENV === 'production';

      if (isPlaceholder) {
        if (isVercel || isProd) {
          throw new Error('MONGODB_URI environment variable is missing or contains placeholder (<db_password>) in production.');
        }
        console.log('⚠️ MONGODB_URI placeholder detected in local development. Initializing MongoMemoryServer fallback...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        uri = mongod.getUri();
        console.log('✅ In-Memory MongoDB running at:', uri);
      }

      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000
      });
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      console.error(`❌ MongoDB connection error: ${error.message}`);
      connectPromise = null;

      if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
        try {
          console.log('🔄 Primary MongoDB connection failed in local dev. Initializing MongoMemoryServer fallback...');
          const { MongoMemoryServer } = require('mongodb-memory-server');
          const mongod = await MongoMemoryServer.create();
          const fallbackUri = mongod.getUri();
          const conn = await mongoose.connect(fallbackUri);
          console.log(`✅ Fallback In-Memory MongoDB Connected: ${conn.connection.host}`);
          return conn;
        } catch (fallbackErr) {
          console.error(`❌ Fallback MongoDB connection error: ${fallbackErr.message}`);
          throw error;
        }
      }
      throw error;
    }
  })();

  return connectPromise;
};

module.exports = connectDB;
