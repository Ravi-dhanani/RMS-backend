const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token required", status: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded) {
      return decoded.id;
    }
  } catch (err) {
    return res.status(403).json({ message: "Invalid token", status: false });
  }
};

module.exports = authenticate;
