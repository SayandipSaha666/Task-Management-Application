const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Task Service: Connected to MongoDB (task_db)');
  } catch (error) {
    console.error('Task Service: MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
