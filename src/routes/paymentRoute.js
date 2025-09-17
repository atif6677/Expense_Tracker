//src/routes/paymentRoute.js

const express = require("express");
const router = express.Router();
const { createPremiumOrder, updateTransactionStatus } = require("../controllers/paymentController");
const authenticate = require("../middleware/auth");

// Create a new premium order (requires authentication)
router.get('/premium', authenticate, createPremiumOrder);

// Update transaction status
router.get('/updateTransactionStatus', updateTransactionStatus); // Cashfree redirect
router.post('/updateTransactionStatus', authenticate, updateTransactionStatus); // Frontend manual update

module.exports = router;
