var express = require("express");
var router = express.Router();
const { connectToDatabase, closeDatabaseConnection } = require("../db"); // 假設你已將連接和關閉連接的函數放在一個名為 db.js 的文件中

/* GET home page. */
router.get("/", async function (req, res, next) {
  const db = await connectToDatabase(); // 建立連接

  if (!db) {
    console.error("Failed to connect to the database.");
    res.send("Failed!!!!!");
  }

  const collection = db.collection("users");
  console.log(collection);

  try {
    // 假設這是你的查詢操作
    const query = { account: "test1" };
    const result = await collection.find(query).toArray();

    console.log("Query result:", result);
  } catch (err) {
    console.error("Error performing database operation:", err);
  } finally {
    closeDatabaseConnection(); // 關閉連接
  }

  res.send("test!!!!!");
});

module.exports = router;
