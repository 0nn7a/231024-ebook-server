var express = require("express");
var router = express.Router();
const connectDB = require("../connectMongo"); // 假設你已將連接和關閉連接的函數放在一個名為 connectMongo.js 的文件中

/* GET home page. */
router.get("/", async function (req, res, next) {
  await connectDB();
  res.send("test!!!!!");
});

module.exports = router;
