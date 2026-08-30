const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bridgeable';

  console.log(`Connecting to MongoDB at ${mongoUri}...`);

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 4000,
      autoIndex: true
    });
    console.log(`MongoDB connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('MongoDB connection failed:');
    console.error(error.message);
    console.error('Ensure MongoDB is installed and running, or configure a valid MONGODB_URI in backend/.env.');
    return null;
  }
};

module.exports = connectDB;
