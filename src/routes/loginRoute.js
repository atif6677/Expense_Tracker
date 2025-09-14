const addUserLogin = require("../controllers/loginController");
const express = require("express");
const router = express.Router();

router.post("/login", addUserLogin);
router.get("/login", (req, res) => {
    res.send("Login route working!");
});

module.exports = router;