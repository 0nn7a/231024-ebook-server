const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const {
  makeToken,
  makeRefToken,
  verifyToken,
  verifyRefToken,
} = require("../jwt");

const userSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
  },
  avatar: {
    type: String,
    required: true,
    default: "https://i.imgur.com/CJOAv0U.jpg",
  },
  username: {
    type: String,
    required: true,
  },
  account: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  token: {
    type: String,
  },
  refreshToken: {
    type: String,
  },
});

// userSchema 儲存(.save) 前預處理密碼加鹽
userSchema.pre("save", async function (next) {
  // this = 當前正要被儲存的使用者數據
  const user = this;

  // 確認使用者的 password 欄位是有被變更：初次建立＆修改密碼都算
  if (user.isModified("password")) {
    // 透過 bcrypt 處理密碼，獲得 hashed password
    user.password = await bcrypt.hash(user.password, 8);

    console.log("password modify!!!");
  }
  next();
});

// userSchema.methods 實例方法，會綁定在每個新用戶上
// - 新建、儲存、回傳新 Token
userSchema.methods.saveNewToken = async function () {
  // this = 當前使用者數據
  const user = this;

  // 製作 Token & Refresh Token
  const token = makeToken(user, 60 * 5);
  const refreshToken = makeRefToken(user, 60 * 30);

  // 取得 Token 到期時間格式
  const expireTime = new Date(verifyToken(token).exp * 1000).toUTCString();
  const expireTimeR = new Date(
    verifyRefToken(refreshToken).exp * 1000
  ).toUTCString();

  // 更新並嘗試儲存使用者
  user.token = token;
  user.refreshToken = refreshToken;
  await user.save();
  console.log("existedUser 已更新 JWT 到 mongoDB Atlas！");

  // 回傳 JWT 數據
  return { token, refreshToken, expireTime, expireTimeR };
};
// - 驗證 Token

// userSchema.statics 靜態方法，會綁定在整個 model(= User) 物件上

// 在 mongoDB 中 collection 名為 "users"
// 但是在 mongoose.model 的參數中要輸入 "User"
const userModel = mongoose.model("User", userSchema);

module.exports = userModel;
