var express = require("express");
var router = express.Router();

const userModel = require("../models/userModel");
const { verifyRefToken } = require("../jwt");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.send("test!!!!!");
});

// 透過 refreshToken 換發 Token
router.post("/refreshToken", async function (req, res) {
  const { refreshToken } = req.body;
  try {
    // 驗證請求頭的 refreshToken
    const decoded = verifyRefToken(refreshToken);

    // 比對資料庫中使用者的 refreshToken
    const user = await userModel.findOne({ _id: decoded._id, refreshToken });
    if (!user) throw new Error("未找到匹配令牌之用戶！");

    // 重新製造新的 JWT
    const jwtData = await user.saveNewToken();
    console.log("jwtData: ", { ...jwtData });

    res.send({ status: 200, meg: "ref token", data: { jwt: jwtData } });
  } catch (e) {
    let status, meg;
    if (e.message === "未找到匹配令牌之用戶！") {
      console.error("未找到匹配令牌之用戶！", e);
      status = 401;
      meg = e.message;
    } else if (e.name === "TokenExpiredError") {
      console.error("refreshToken 已過期，換發令牌失敗！");
      status = 401;
      meg = "refreshToken 已過期，換發令牌失敗！";
    } else if (e.name === "JsonWebTokenError") {
      console.error("無效 refreshToken，換發令牌失敗！");
      status = 401;
      meg = "無效 refreshToken，換發令牌失敗！";
    } else {
      // 其他伺服器錯誤：查詢、保存
      console.error("refreshToken 驗證失敗，發生異常！", e);
      status = 500;
      meg = "refreshToken 驗證失敗，發生異常！";
    }
    res.send({ status, meg });
  }
});

module.exports = router;
