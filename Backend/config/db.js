// Backend/config/db.js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = process.env.NODE_ENV === 'test' ? process.env.TEST_DB_URI || process.env.MONGO_URI : process.env.MONGO_URI;

    if (typeof uri !== 'string' || uri.trim().length === 0) {
      throw new Error(
        `Missing MongoDB connection string. Set ${process.env.NODE_ENV === 'test' ? 'TEST_DB_URI or MONGO_URI' : 'MONGO_URI'} in your environment.`
      );
    }

    const conn = await mongoose.connect(uri);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

