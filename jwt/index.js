const jwt = require("jsonwebtoken");

const SECRET = "ebooksecretjwt";
const SECRET_REF = "twjterceskoobe";

function makeToken(user, time) {
  return jwt.sign({ _id: user._id.toString() }, SECRET, {
    expiresIn: time,
  });
}
function makeRefToken(user, time) {
  return jwt.sign({ _id: user._id.toString() }, SECRET_REF, {
    expiresIn: time,
  });
}
function verifyToken(token) {
  token = token.replace("Bearer ", "");
  return jwt.verify(token, SECRET);
}
function verifyRefToken(token) {
  token = token.replace("Bearer ", "");
  return jwt.verify(token, SECRET_REF);
}

module.exports = { makeToken, makeRefToken, verifyToken, verifyRefToken };
