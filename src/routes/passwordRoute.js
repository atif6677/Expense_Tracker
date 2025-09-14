//src/routes/passwordRoutes.js

const express = require('express');
const router = express.Router();
const passwordController = require('../controllers/passwordController');

router.post('/forgotpassword', passwordController.forgotPassword);
router.get('/resetpassword/:id', passwordController.getResetPasswordForm);
router.post('/resetpassword/:id', passwordController.postResetPassword);

module.exports = router;
