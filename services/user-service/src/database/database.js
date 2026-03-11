const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('User Service: Connected to MongoDB (user_db)');
  } catch (error) {
    console.error('User Service: MongoDB connection failed:', error.message);
    process.exit(1);  // Stop the service if DB is unavailable
  }
};

module.exports = connectDB;
