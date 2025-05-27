const jwt = require("jsonwebtoken");

const getUserIdFromToken = (token) => {
  const exitsToken = token.split(" ")[1];
  if (!exitsToken) throw new Error("Token required");
  const { id } = jwt.verify(exitsToken, process.env.JWT_SECRET);
  return id;
};

module.exports = getUserIdFromToken;
