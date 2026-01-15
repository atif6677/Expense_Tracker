// src/routes/signupRoute.js

const express = require('express');
const router = express.Router();
const addUserSignup = require('../controllers/signupController');

router.post('/signup', addUserSignup);

module.exports = router;