// src/controllers/premiumUserController.js

const Order = require("../models/orderModel");
const User = require("../models/signupModel");
// No longer need Expense or Sequelize here for the leaderboard!

exports.premiumContent = async (req, res) => {
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

exports.leaderboard = async (req, res) => {
  try {
    // ✅ This is the new, highly efficient query!
    const leaderboard = await User.findAll({
      attributes: [
        "name",
        // Alias 'totalExpenses' to 'totalExpense' to match the front-end's expectation
        ["totalExpenses", "totalExpense"] 
      ],
      order: [["totalExpenses", "DESC"]] // Order by the pre-calculated column
    });

    res.json(leaderboard);
  } catch (err) {
    console.error("Error fetching leaderboard:", err);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
};