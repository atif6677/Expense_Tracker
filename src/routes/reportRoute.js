// src/routes/reportRoute.js
const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { getReportExpenses, downloadExpenses } = require('../controllers/reportController');

// Get paginated and filtered expenses
router.get('/paginated-and-filtered', authenticate, getReportExpenses);

// Download expenses as CSV
router.get('/download', authenticate, downloadExpenses);

module.exports = router;
