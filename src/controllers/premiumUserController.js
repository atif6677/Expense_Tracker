// src/controllers/premiumUserController.js

const Order = require("../models/orderModel");
const User = require("../models/signupModel");

// Check if the user has premium content access
const premiumContent = async (req, res) => {
  try {
    const userStatus = await Order.findOne({
      where: { UserId: req.user.userId, status: "SUCCESSFUL" }
    });

    if (!userStatus) {
      return res.status(200).json({ status: "FAILED" });
    }

    return res.status(200).json({ status: "SUCCESSFUL" });
  } catch (err) {
    console.error("Error in premiumContent:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

// Fetch leaderboard based on total expenses
const leaderboard = async (req, res) => {
  try {
    const leaderboard = await User.findAll({
      attributes: [
        "name",
        ["totalExpenses", "totalExpense"] // Alias to match front-end expectation
      ],
      order: [["totalExpenses", "DESC"]]
    });

    res.json(leaderboard);
  } catch (err) {
    console.error("Error fetching leaderboard:", err);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
};

module.exports = { premiumContent, leaderboard };
