//src/middleware/auth.js

const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET; // same as in loginUser.js

const auth = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const bearer = token.split(" ");
    if (bearer.length !== 2 || bearer[0] !== "Bearer") {
      return res.status(401).json({ error: "Invalid token format" });
    }

    const decoded = jwt.verify(bearer[1], JWT_SECRET);
    req.user = decoded; // contains userId, email
    next();
  } catch (err) {
    res.status(400).json({ error: "Invalid token" });
  }
};

module.exports = auth;
