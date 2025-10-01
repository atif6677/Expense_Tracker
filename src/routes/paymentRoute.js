//src/routes/paymentRoute.js

const express = require("express");
const router = express.Router();
const { createPremiumOrder, updateTransactionStatus} = require("../controllers/paymentController");
const authenticate = require("../middleware/auth");

// Create a new premium order (status: PENDING)
router.get("/premium", authenticate, createPremiumOrder);

// Cashfree redirect URL after payment (handles SUCCESS or FAILED)
router.get("/updateTransactionStatus", updateTransactionStatus);

module.exports = router;
