//src/routes/passwordRoutes.js

const express = require('express');
const router = express.Router();
const { forgotPassword, getResetPasswordForm, postResetPassword } = require('../controllers/passwordController');

// Route to request a password reset link
router.post('/forgotpassword', forgotPassword);

// Route to display the reset password form
router.get('/resetpassword/:id', getResetPasswordForm);

// Route to handle the actual password update
router.post('/resetpassword/:id', postResetPassword);

module.exports = router;
