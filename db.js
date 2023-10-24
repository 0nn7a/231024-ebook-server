// ENV
require("dotenv").config();

// mongoDB
const { MongoClient } = require("mongodb");
const client = new MongoClient(process.env.MONGODB_URI);
async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    return client.db(); // 返回 MongoDB 數據庫實例
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    return null;
  }
}
async function closeDatabaseConnection() {
  try {
    await client.close();
    console.log("Closed MongoDB connection");
  } catch (err) {
    console.error("Error closing MongoDB connection:", err);
  }
}

module.exports = { connectToDatabase, closeDatabaseConnection };
