const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Notification Service: Connected to MongoDB (notification_db)');
  } catch (error) {
    console.error('Notification Service: MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
