const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('username:password')) {
      console.log('⚠️  No MongoDB URI configured. Running with in-memory mock data.');
      return;
    }
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('ℹ️  Continuing with mock data...');
  }
};

module.exports = connectDB;
