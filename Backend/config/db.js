// Backend/config/db.js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = process.env.NODE_ENV === 'test' ? process.env.TEST_DB_URI || process.env.MONGO_URI : process.env.MONGO_URI;
    
    // Temporary debug - remove after fixing deployment
    console.log('MONGO_URI type:', typeof uri);
    console.log('MONGO_URI value:', JSON.stringify(uri));
    console.log('MONGO_URI starts with:', uri?.substring(0, 15));
    
    const conn = await mongoose.connect(uri);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

