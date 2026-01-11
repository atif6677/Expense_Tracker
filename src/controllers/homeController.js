// src/controllers/homeController.js
const Expense = require('../models/homeModel');
const User = require('../models/signupModel'); 
const { uploadToS3 } = require('../services/s3Services'); 
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');

const addExpense = asyncHandler(async (req, res) => {
    const { amount, description, category } = req.body;
    const userId = req.user.userId;

    if (!amount || !description || !category) {
        throw new AppError("All fields are required", 400);
    }

    const expense = new Expense({
        amount,
        description,
        category,
        userId: userId,
    });
    await expense.save();

    const user = await User.findById(userId);
    if (user) {
        user.totalExpenses = (user.totalExpenses || 0) + Number(amount);
        await user.save();
    }

    res.status(201).json({ message: "Expense added successfully", expense });
});

const getExpense = asyncHandler(async (req, res) => {
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
});

const deleteExpense = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    const expense = await Expense.findOne({ _id: id, userId: userId });

    if (!expense) {
        throw new AppError("Expense not found or not authorized", 404);
    }

    const expenseAmount = expense.amount;
    await Expense.deleteOne({ _id: id });

    const user = await User.findById(userId);
    if (user) {
        user.totalExpenses = (user.totalExpenses || 0) - expenseAmount;
        await user.save();
    }

    res.status(200).json({ message: "Expense deleted successfully" });
});

const downloadExpenses = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const expenses = await Expense.find({ userId }).lean();

    const stringifiedExpenses = JSON.stringify(expenses);
    const filename = `Expense${userId}.txt`;

    const fileURL = await uploadToS3(stringifiedExpenses, filename);

    return res.status(200).json({ link: fileURL, success: true });
});

module.exports = { addExpense, getExpense, deleteExpense, downloadExpenses };