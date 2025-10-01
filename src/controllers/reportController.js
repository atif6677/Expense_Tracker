// src/controllers/reportController.js

const Expense = require('../models/homeModel');
const { Op } = require('sequelize');
const { Parser } = require('json2csv');

// 📌 Helper to build date filter based on query
const getDateCondition = (filter, date, month, year) => {
    let dateCondition = {};

    if (filter === 'daily' && date) {
        const selectedDate = new Date(date);
        selectedDate.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        dateCondition = { createdAt: { [Op.between]: [selectedDate, endOfDay] } };
    } else if (filter === 'monthly' && month && year) {
        const startOfMonth = new Date(year, month - 1, 1, 0, 0, 0);
        const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
        dateCondition = { createdAt: { [Op.between]: [startOfMonth, endOfMonth] } };
    } else if (filter === 'weekly') {
        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        startOfWeek.setHours(0, 0, 0, 0);
        dateCondition = { createdAt: { [Op.gte]: startOfWeek } };
    }

    return dateCondition;
};

// 📌 Get paginated AND filtered expenses
const getReportExpenses = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const { filter, date, month, year, salary } = req.query;

        const dateCondition = getDateCondition(filter, date, month, year);
        const whereClause = { userId: req.user.userId, ...dateCondition };

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

        // If monthly, calculate savings
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

// 📌 Download expenses as CSV
const downloadExpenses = async (req, res) => {
    try {
        const { filter, date, month, year, salary } = req.query;

        const dateCondition = getDateCondition(filter, date, month, year);
        const whereClause = { userId: req.user.userId, ...dateCondition };

        const expenses = await Expense.findAll({ where: whereClause, raw: true });

        if (!expenses || expenses.length === 0) {
            return res.status(404).json({ error: "No expenses found for the selected period." });
        }

        let csvData = expenses;

        // Only add one summary row for monthly report
        if (filter === 'monthly' && salary && !isNaN(salary)) {
            const totalMonthlyExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);
            const savings = parseFloat(salary) - totalMonthlyExpense;

            // Add one extra row for summary
            csvData.push({
                amount: '',
                description: '--- Summary ---',
                category: '',
                createdAt: '',
                salary: parseFloat(salary),
                totalMonthlyExpense: totalMonthlyExpense,
                savings: savings
            });
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
module.exports = { getReportExpenses, downloadExpenses };