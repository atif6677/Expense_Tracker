// src/controllers/reportController.js

const Expense = require('../models/homeModel');
const { Op } = require('sequelize');
const { Parser } = require('json2csv');

// This function builds the date condition based on the filter
const getDateCondition = (filter) => {
    let dateCondition = {};
    if (filter === 'daily') {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        dateCondition = { createdAt: { [Op.between]: [startOfDay, endOfDay] } };
    } else if (filter === 'weekly') {
        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        startOfWeek.setHours(0, 0, 0, 0);
        dateCondition = { createdAt: { [Op.gte]: startOfWeek } };
    } else if (filter === 'monthly') {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        dateCondition = { createdAt: { [Op.gte]: startOfMonth } };
    }
    return dateCondition;
};

// 📌 Get paginated AND filtered expenses (UPDATED)
const getReportExpenses = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const { filter, salary } = req.query; // Get salary from query

        const dateCondition = getDateCondition(filter);
        const whereClause = { userId: req.user.userId, ...dateCondition };

        // Get paginated expenses
        const { count, rows } = await Expense.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });

        const responseData = {
            expenses: rows,
            currentPage: page,
            totalPages: Math.ceil(count / limit)
        };

        // If it's a monthly filter and salary is provided, calculate savings
        if (filter === 'monthly' && salary && !isNaN(salary)) {
            const totalMonthlyExpense = await Expense.sum('amount', { where: whereClause });
            responseData.totalMonthlyExpense = totalMonthlyExpense || 0;
            responseData.savings = parseFloat(salary) - (totalMonthlyExpense || 0);
        }

        res.status(200).json(responseData);
    } catch (err) {
        console.error("Error fetching report expenses:", err);
        res.status(500).json({ error: "Failed to fetch expenses for the report." });
    }
};

// 📌 Download expenses as CSV (UPDATED)
const downloadExpenses = async (req, res) => {
    try {
        const { filter, salary } = req.query; // Get salary
        const dateCondition = getDateCondition(filter);
        const whereClause = { userId: req.user.userId, ...dateCondition };

        const expenses = await Expense.findAll({ where: whereClause, raw: true });

        if (expenses.length === 0) {
            return res.status(404).json({ error: "No expenses found for the selected filter." });
        }

        let csvData = expenses;
        // If monthly, add the savings data to every row for the CSV
        if (filter === 'monthly' && salary && !isNaN(salary)) {
            const totalMonthlyExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);
            const savings = parseFloat(salary) - totalMonthlyExpense;
            
            // Add new columns to the data before parsing
            csvData = expenses.map(exp => ({
                ...exp,
                monthlySalary: parseFloat(salary),
                totalMonthlyExpense: totalMonthlyExpense,
                savings: savings
            }));
        }

        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(csvData);

        res.header('Content-Type', 'text/csv');
        res.attachment('expense_report.csv');
        return res.send(csv);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getReportExpenses,
    downloadExpenses
};