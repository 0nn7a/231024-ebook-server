const express = require("express");
const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");
const router = express.Router();
const authToken = require("../middleware/authToken");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

// 註冊
router.post("/signup", async function (req, res) {
  // 從前端請求中取得數據
  const { username, account, password } = req.body;

  try {
    // 查詢帳號是否重複
    const existedUser = await userModel.findOne({ account });
    console.log("existedUser: ", existedUser);
    if (existedUser) throw new Error("帳號已存在！");

    // 查詢 collection 中最大的 ID 以實現自增長
    const maxIdData = await userModel.findOne().sort({ id: -1 });
    const maxId = maxIdData ? maxIdData.id + 1 : 1;

    // 於本地創建新用戶數據
    const newUser = new userModel({
      id: maxId,
      username,
      account,
      password,
    });
    console.log("newUser: ", newUser);

    // 嘗試保存新用戶至 MongoDB Atlas
    await newUser.save();
    console.log("newUser 已被儲存到 mongoDB Atlas！");

    res.send({ status: 200, meg: "註冊成功！將導向登入頁。" });
  } catch (e) {
    switch (e.message) {
      case "帳號已存在！":
        console.error("帳號已存在！", e);
        res.send({ status: 409, meg: e.message });
        break;
      default:
        // 其他伺服器錯誤：查詢、保存
        console.error("註冊失敗，發生異常！", e);
        res.send({ status: 500, meg: "註冊失敗，發生異常！" });
        break;
    }
  }
});

// 登入
router.post("/login", async function (req, res) {
  // 從前端請求中取得數據
  const { account, password } = req.body;

  try {
    // 查詢帳號是否存在
    const existedUser = await userModel.findOne({ account });
    console.log("existedUser: ", existedUser);
    if (!existedUser) throw new Error("此帳號未註冊！");

    // 再次加鹽使用者輸入密碼進行比對
    const isMatch = await bcrypt.compare(password, existedUser.password);
    if (!isMatch) throw new Error("密碼輸入錯誤！");

    // 儲存新建的 JWT 至 MongoDB Atlas 並取得此數據以回傳前端
    const jwtData = await existedUser.saveNewToken();
    console.log("jwtData: ", { ...jwtData });

    res.send({
      status: 200,
      meg: "登入成功！",
      data: {
        jwt: jwtData,
        avatar: existedUser.avatar,
        username: existedUser.username,
      },
    });
  } catch (e) {
    let status, meg;
    switch (e.message) {
      case "此帳號未註冊！":
        console.error("此帳號未註冊！", e);
        status = 401;
        meg = e.message;
        break;
      case "密碼輸入錯誤！":
        console.error("密碼輸入錯誤！", e);
        status = 401;
        meg = e.message;
        break;
      default:
        // 伺服器錯誤：查詢、保存
        console.error("登入失敗，發生異常！", e);
        status = 500;
        meg = "登入失敗，發生異常！";
        break;
    }
    res.send({ status, meg });
  }
});

// 更新用戶資料
router.put("/update", authToken, async function (req, res) {
  const updateData = req.body;

  try {
    // 判斷並留下需要更新的屬性
    for (let key in updateData) {
      if (key === "oldPassword") {
        if (updateData.oldPassword) {
          // 再次加鹽使用者輸入的修改密碼進行比對
          const isMatch = await bcrypt.compare(
            updateData.oldPassword,
            req.user.password
          );
          if (!isMatch) throw new Error("舊密碼輸入錯誤！");
          updateData.password = await bcrypt.hash(updateData.newPassword, 8);
          delete updateData.oldPassword;
        }
      }
      if (!updateData[key]) delete updateData[key];
    }

    console.log("updateData: ", updateData);

    // 查詢並更新使用者
    const existedUser = await userModel.findOneAndUpdate(
      { _id: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );
    console.log("existedUser: ", existedUser);
    if (!existedUser) throw new Error("個人資料更新失敗，發生異常！");

    // 儲存新建的 JWT 至 MongoDB Atlas 以延長並取得此數據以回傳前端
    const jwtData = await existedUser.saveNewToken();
    console.log("jwtData: ", { ...jwtData });

    res.send({
      status: 200,
      meg: "個人資料更新成功！",
      data: {
        jwt: jwtData,
        avatar: existedUser.avatar,
        username: existedUser.username,
      },
    });
  } catch (e) {
    let status, meg;
    switch (e.message) {
      case "舊密碼輸入錯誤！":
        console.error("舊密碼輸入錯誤！", e);
        status = 401;
        meg = e.message;
        break;
      default:
        // 伺服器錯誤：查詢、保存
        console.error("個人資料更新失敗，發生異常！", e);
        status = 500;
        meg = "個人資料更新失敗，發生異常！";
        break;
    }
    res.send({ status, meg });
  }
});

// !!! 經過 authToken 這個 middleware 的路由
// !!! 都能從拿到 req.header("Authorization")、req.user

module.exports = router;
