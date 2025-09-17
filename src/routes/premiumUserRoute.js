const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { premiumContent, leaderboard } = require("../controllers/premiumUserController");

// Check if user has premium content access
router.get("/status", auth, premiumContent);

// Get the leaderboard
router.get("/leaderboard", leaderboard);

module.exports = router;
