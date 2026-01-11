// src/controllers/homeController.js

const Expense = require('../models/homeModel');
const User = require('../models/signupModel'); 
const { uploadToS3 } = require('../services/s3Services'); 

const addExpense = async (req, res) => {
    // ❌ REMOVED: Transaction Session for local compatibility
    try {
        const { amount, description, category } = req.body;
        const userId = req.user.userId;

        if (!amount || !description || !category) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // ✅ Step 1: Create the expense
        const expense = new Expense({
            amount,
            description,
            category,
            userId: userId,
        });
        await expense.save(); // Removed { session }

        // ✅ Step 2: Update the user's total expenses manually
        // Note: Without transactions, if this fails, the expense still exists. 
        // For a simple app, this is acceptable.
        const user = await User.findById(userId);
        if (user) {
            user.totalExpenses = (user.totalExpenses || 0) + Number(amount);
            await user.save();
        }

        res.status(201).json({ message: "Expense added successfully", expense });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

const getExpense = async (req, res) => {
    try {
        const userId = req.user.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const totalExpenses = await Expense.countDocuments({ userId });

        const expenses = await Expense.find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            expenses,
            totalExpenses,
            currentPage: page,
            totalPages: Math.ceil(totalExpenses / limit)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteExpense = async (req, res) => {
    // ❌ REMOVED: Transaction Session
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const expense = await Expense.findOne({ _id: id, userId: userId });

        if (!expense) {
            return res.status(404).json({ error: "Expense not found or not authorized" });
        }

        const expenseAmount = expense.amount;

        // ✅ Step 2: Delete the expense
        await Expense.deleteOne({ _id: id });

        // ✅ Step 3: Update User total
        const user = await User.findById(userId);
        if (user) {
            user.totalExpenses = (user.totalExpenses || 0) - expenseAmount;
            await user.save();
        }

        res.status(200).json({ message: "Expense deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Something went wrong" });
    }
};

const downloadExpenses = async (req, res) => {
  try {
    const userId = req.user.userId;
    const expenses = await Expense.find({ userId }).lean();

    const stringifiedExpenses = JSON.stringify(expenses);
    const filename = `Expense${userId}.txt`;

    // Ensure uploadToS3 is working correctly in your services
    const fileURL = await uploadToS3(stringifiedExpenses, filename);

    return res.status(200).json({ link: fileURL, success: true });
  } catch (err) {
    console.error('Error in downloadExpenses:', err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};

module.exports = { addExpense, getExpense, deleteExpense, downloadExpenses };