/*
  config/db.js
  - MongoDB connection helper for the `customer` service.
  - Call `connectDB()` during startup to connect using `process.env.MONGO_URI`.
  - Errors are logged to console; adjust for production logging as needed.
*/

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (err) {
    console.log("DB Error:", err);
  }
};

module.exports = connectDB;