// routes/paymentRoute.js

const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const authenticate = require("../middleware/auth");

// Create a new premium order (requires authentication)
router.get('/premium', authenticate, paymentController.createPremiumOrder);

// Update transaction status
// GET: used by Cashfree redirect (no auth required)
// POST: used by frontend for manual updates (requires auth)
router.get('/updateTransactionStatus', paymentController.updateTransactionStatus);
router.post('/updateTransactionStatus', authenticate, paymentController.updateTransactionStatus);

module.exports = router;
