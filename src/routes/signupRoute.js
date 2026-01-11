// src/routes/signupRoute.js

const express = require('express');
const router = express.Router();

// ✅ Correct: Remove { } because the controller exports the function directly
const addUserSignup = require('../controllers/signupController');

router.post('/signup', addUserSignup);

module.exports = router;