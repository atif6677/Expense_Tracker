// src/controllers/premiumUserController.js

const { Order } = require("../models/orderModel");
const { User } = require("../models/signupModel");
const asyncHandler = require('../utils/asyncHandler');


exports.premiumContent = asyncHandler(async (req, res) => {
    const userStatus = await Order.findOne({
      userId: req.user.userId, 
      status: "SUCCESSFUL" 
    });

    if (!userStatus) {
      return res.status(200).json({ status: "FAILED" });
    }

    return res.status(200).json({ status: "SUCCESSFUL" });
});

exports.leaderboard = asyncHandler(async (req, res) => {
    const leaderboardData = await User.find()
      .select("name totalExpenses")
      .sort({ totalExpenses: -1 });

    const formattedLeaderboard = leaderboardData.map(user => ({
        name: user.name,
        totalExpense: user.totalExpenses 
    }));

    res.json(formattedLeaderboard);
});