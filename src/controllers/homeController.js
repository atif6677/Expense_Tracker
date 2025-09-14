// src/controllers/homeController.js

const Expense = require('../models/homeModel');
const User = require('../models/signupModel'); // 👈 Import User model
const db = require('../utils/database'); // 👈 Import Sequelize instance for transactions

const addExpense = async (req, res) => {
  // Start a transaction
  const t = await db.transaction();

  try {
    const { amount, description, category } = req.body;
    const userId = req.user.userId;

    if (!amount || !description || !category) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // ✅ Step 1: Create the expense within the transaction
    const expense = await Expense.create({
      amount,
      description,
      category,
      userId: userId,
    }, { transaction: t });

    // ✅ Step 2: Update the user's total expenses
    const user = await User.findByPk(userId, { transaction: t });
    // Make sure amount is treated as a number
    const newTotalExpenses = user.totalExpenses + Number(amount); 
    await user.update({ totalExpenses: newTotalExpenses }, { transaction: t });

    // If everything is successful, commit the transaction
    await t.commit();

    res.status(201).json({ message: "Expense added successfully", expense });
  } catch (error) {
    // If any step fails, roll back the entire transaction
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

const getExpense = async (req, res) => {
  try {
    const expenses = await Expense.findAll({
      where: { userId: req.user.userId },
    });
    res.status(200).json({ expenses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteExpense = async (req, res) => {
  // Start a transaction
  const t = await db.transaction();

  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // ✅ Step 1: Find the expense to be deleted
    const expense = await Expense.findOne({
      where: { id, userId: userId },
      transaction: t,
    });

    if (!expense) {
      await t.rollback();
      return res.status(404).json({ error: "Expense not found or not authorized" });
    }

    const expenseAmount = expense.amount;

    // ✅ Step 2: Update the user's total expenses by subtracting the amount
    const user = await User.findByPk(userId, { transaction: t });
    const newTotalExpenses = user.totalExpenses - expenseAmount;
    await user.update({ totalExpenses: newTotalExpenses }, { transaction: t });

    // ✅ Step 3: Destroy the expense record
    await expense.destroy({ transaction: t });

    // If everything succeeds, commit the transaction
    await t.commit();
    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (err) {
    // If any step fails, roll back
    await t.rollback();
    res.status(500).json({ err: "Something went wrong" });
  }
};

module.exports = { addExpense, getExpense, deleteExpense };