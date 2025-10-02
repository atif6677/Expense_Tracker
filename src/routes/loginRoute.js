// src/routes/loginRoute.js

const express = require("express");
const router = express.Router();
const addUserLogin = require("../controllers/loginController");



router.post("/login", addUserLogin);
router.get("/login", (req, res) => {
    res.send("Login route working!");
});

module.exports = router;