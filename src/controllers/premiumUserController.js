// src/controllers/premiumUserController.js

const Order = require("../models/orderModel");
const User = require("../models/signupModel");

// Check if the user has premium content access
const premiumContent = async (req, res) => {
  try {
    const userStatus = await Order.findOne({
      userId: req.user.userId, 
      status: "SUCCESSFUL" 
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
    // MongoDB aggregation or simple find with sort
    // We select 'name' and 'totalExpenses'
    const leaderboard = await User.find()
      .select("name totalExpenses")
      .sort({ totalExpenses: 1 }); // 1 for ASC, -1 for DESC

    // If front-end expects strict "totalExpense" key, map it, 
    // or just ensure front-end uses "totalExpenses"
    const formattedLeaderboard = leaderboard.map(user => ({
        name: user.name,
        totalExpense: user.totalExpenses // Mapping to match previous alias
    }));

    res.json(formattedLeaderboard);
  } catch (err) {
    console.error("Error fetching leaderboard:", err);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
};

module.exports = { premiumContent, leaderboard };
