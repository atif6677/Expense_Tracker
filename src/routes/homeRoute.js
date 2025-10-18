// routes/homeRoute.js
const express = require("express");
const router = express.Router();
const { addExpense, getExpense, deleteExpense, downloadExpenses } = require("../controllers/homeController");
const auth = require("../middleware/auth");

router.post("/home", auth, addExpense);
router.get("/home", auth, getExpense);
router.delete("/home/:id", auth, deleteExpense);
router.get('/home/download',auth, downloadExpenses);

module.exports = router;
