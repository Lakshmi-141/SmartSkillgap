const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  // Connection event listeners
  mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB Engine] Connection disconnected.');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('[MongoDB Engine] Connection reestablished.');
  });

  // 1. If Atlas URI or non-localhost URI is provided in environment, attempt direct connection
  if (uri && !uri.includes('127.0.0.1') && !uri.includes('localhost')) {
    try {
      const conn = await mongoose.connect(uri);
      console.log(`[MongoDB Engine] Connected successfully to host: ${conn.connection.host}`);
      return;
    } catch (error) {
      const sanitizedMsg = error.message.replace(/mongodb\+srv:\/\/[^@]+@/, 'mongodb+srv://*****:*****@');
      console.error(`[MongoDB Engine] Connection error: ${sanitizedMsg}`);
    }
  }


  // 2. Try connecting to local MongoDB daemon
  try {
    const connStr = uri || 'mongodb://127.0.0.1:27017/smart_skillgap';
    const conn = await mongoose.connect(connStr, { serverSelectionTimeoutMS: 2000 });
    console.log(`[MongoDB Local] Connected successfully: ${conn.connection.host}`);
    return;
  } catch (error) {
    console.log(`[MongoDB Local] Connection unavailable, spinning up MongoDB In-Memory Server...`);
  }

  // 3. Fallback to MongoMemoryServer for instant zero-config dev execution
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    const conn = await mongoose.connect(mongoUri);
    console.log(`[MongoDB Memory Engine] Connected successfully: ${conn.connection.host}`);
  } catch (memError) {
    console.error(`[MongoDB Engine] Initialization error: ${memError.message}`);
  }
};

module.exports = connectDB;
