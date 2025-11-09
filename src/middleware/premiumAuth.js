// src/middleware/premiumAuth.js
const Order = require("../models/orderModel");

const premiumAuth = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const premiumOrder = await Order.findOne({
      where: { UserId: userId, status: "SUCCESSFUL" }
    });

    if (!premiumOrder) {
      return res.status(403).json({
        error: "Access denied. You must be a premium user to access this route."
      });
    }

    console.log("user is premium")
    next(); // ✅ user is premium
  } catch (err) {
    console.error("premiumAuth error:", err);
    res.status(500).json({ error: "Server error during premium validation" });
  }
};

module.exports = premiumAuth;
