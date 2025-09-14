const premiumUserController = require("../controllers/premiumUserController");
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");


router.get("/status",auth,premiumUserController.premiumContent);
router.get("/leaderboard",premiumUserController.leaderboard);


module.exports =router;