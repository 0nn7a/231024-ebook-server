// ENV
require("dotenv").config();

// mongoose
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connect to MongoDB successfully.");
  } catch (e) {
    console.log("Connect to MongoDB failed. ", e.message);
  }
};

module.exports = connectDB;
