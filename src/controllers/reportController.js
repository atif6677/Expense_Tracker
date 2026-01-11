// src/controllers/reportController.js
const Expense = require('../models/homeModel');
const { Parser } = require('json2csv');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');

const getDateCondition = (filter, date, month, year) => {
    let dateCondition = {};
    if (filter === 'daily' && date) {
        const selectedDate = new Date(date);
        selectedDate.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        dateCondition = { createdAt: { $gte: selectedDate, $lte: endOfDay } };
    } else if (filter === 'monthly' && month && year) {
        const yearNum = parseInt(year);
        const monthNum = parseInt(month);
        const startOfMonth = new Date(yearNum, monthNum - 1, 1, 0, 0, 0);
        const endOfMonth = new Date(yearNum, monthNum, 0, 23, 59, 59, 999);
        dateCondition = { createdAt: { $gte: startOfMonth, $lte: endOfMonth } };
    } else if (filter === 'weekly') {
        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        startOfWeek.setHours(0, 0, 0, 0);
        dateCondition = { createdAt: { $gte: startOfWeek } };
    }
    return dateCondition;
};

const getReportExpenses = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { filter, date, month, year, salary } = req.query;

    const dateCondition = getDateCondition(filter, date, month, year);
    const whereClause = { userId: req.user.userId, ...dateCondition };

    const count = await Expense.countDocuments(whereClause);
    const rows = await Expense.find(whereClause).sort({ createdAt: -1 }).skip(skip).limit(limit);

    const responseData = { expenses: rows, currentPage: page, totalPages: Math.ceil(count / limit) };

    if (filter === 'monthly' && salary && !isNaN(salary)) {
        const aggregation = await Expense.aggregate([
            { $match: whereClause },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const totalMonthlyExpense = aggregation.length > 0 ? aggregation[0].total : 0;
        responseData.totalMonthlyExpense = totalMonthlyExpense;
        responseData.savings = parseFloat(salary) - totalMonthlyExpense;
    }

    res.status(200).json(responseData);
});

const downloadExpenses = asyncHandler(async (req, res) => {
    const { filter, date, month, year, salary } = req.query;
    const dateCondition = getDateCondition(filter, date, month, year);
    const whereClause = { userId: req.user.userId, ...dateCondition };

    const expenses = await Expense.find(whereClause).select("amount description createdAt category").lean();

    if (!expenses || expenses.length === 0) {
        throw new AppError("No expenses found for the selected period.", 404);
    }

    const csvData = expenses.map(exp => ({
        Amount: exp.amount,
        Description: exp.description,
        Date: exp.createdAt ? new Date(exp.createdAt).toISOString().split("T")[0] : "N/A",
        Category: exp.category
    }));

    if (filter === "monthly" && salary && !isNaN(salary)) {
        const totalMonthlyExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const savings = parseFloat(salary) - totalMonthlyExpense;
        csvData.push({ Amount: "", Description: "--- Summary ---", Date: "", Category: "" });
        csvData.push({ Amount: `Total: ${totalMonthlyExpense}`, Description: `Salary: ${salary}`, Date: "", Category: `Savings: ${savings}` });
    }

    const fields = ["Amount", "Description", "Date", "Category"];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(csvData);

    res.header("Content-Type", "text/csv");
    res.attachment("expense_report.csv");
    return res.send(csv);
});

module.exports = { getReportExpenses, downloadExpenses };