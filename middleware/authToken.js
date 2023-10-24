const { verifyToken } = require("../jwt");
const userModel = require("../models/userModel");

module.exports = async (req, res, next) => {
  try {
    // 驗證請求頭的 token
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = verifyToken(token);

    // 比對資料庫中使用者的 token
    const user = await userModel.findOne({ _id: decoded._id, token });
    if (!user) throw new Error("未找到匹配令牌之用戶！");

    // 將用戶保存讓後續方便處理
    req.user = user;
    next();
  } catch (e) {
    let status, meg;
    if (e.message === "未找到匹配令牌之用戶！") {
      console.error("未找到匹配令牌之用戶！", e);
      status = 401;
      meg = e.message;
    } else if (e.name === "TokenExpiredError") {
      console.error("Token 已過期，請重新登入！");
      status = 401;
      meg = "Token 已過期，請重新登入！";
    } else if (e.name === "JsonWebTokenError") {
      console.error("無效 Token，請重新登入！");
      status = 401;
      meg = "無效 Token，請重新登入！";
    } else {
      // 其他伺服器錯誤：查詢、保存
      console.error("Token 驗證失敗，發生異常！", e);
      status = 500;
      meg = "Token 驗證失敗，發生異常！";
    }
    res.send({ status, meg });
  }
};
