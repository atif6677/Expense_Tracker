// src/routes/reportRoute.js
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authenticate = require('../middleware/auth');

router.get('/paginated-and-filtered', authenticate, reportController.getReportExpenses);
router.get('/download', authenticate, reportController.downloadExpenses);

module.exports = router;