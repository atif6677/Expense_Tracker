// routes/homeRoute.js
const express = require("express");
const router = express.Router();
const { addExpense, getExpense, deleteExpense } = require("../controllers/homeController");
const auth = require("../middleware/auth");

router.post("/home", auth, addExpense);
router.get("/home", auth, getExpense);
router.delete("/home/:id", auth, deleteExpense);

module.exports = router;
