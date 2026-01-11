// src/controllers/passwordController.js

const User = require('../models/signupModel');
const ForgotPasswordRequest = require('../models/forgotPasswordModel');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const brevo = require('@getbrevo/brevo');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');

// Configure Brevo client
const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
    brevo.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY
);

// Step 1: Create ForgotPasswordRequest and send email
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        throw new AppError('User not found', 404);
    }

    // Generate a UUID for the reset link
    const id = uuidv4();

    // Create reset request
    // Note: We manually set _id to the UUID string here because your 
    // ForgotPasswordModel is defined with `_id: { type: String }`
    const request = new ForgotPasswordRequest({
        _id: id, 
        userId: user._id,
        isActive: true
    });
    await request.save();

    const resetURL = `http://localhost:3000/password/resetpassword/${id}`;
    
  
    console.log("🔗 PASSWORD RESET LINK GENERATED:");
    console.log(resetURL);
    

    // Send email using Brevo
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.subject = "Password Reset Link";
    sendSmtpEmail.htmlContent = `<p>Click the link below to reset your password:</p><a href="${resetURL}">${resetURL}</a>`;
    sendSmtpEmail.sender = { name: "Expense Tracker", email: "noreply@expensetracker.com" };
    sendSmtpEmail.to = [{ email: user.email }];

    await apiInstance.sendTransacEmail(sendSmtpEmail);

    res.json({ message: 'Password reset link has been sent to your email' });
});

// Step 2: Show Reset Password Form
const getResetPasswordForm = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const request = await ForgotPasswordRequest.findById(id);

    if (!request || !request.isActive) {
        throw new AppError('Invalid or expired reset link', 400);
    }

    res.send(`
        <html>
            <head><title>Reset Password</title></head>
            <body>
                <form action="/password/resetpassword/${id}" method="POST">
                    <h3>Reset Your Password</h3>
                    <input type="password" name="newPassword" placeholder="Enter new password" required />
                    <button type="submit">Reset Password</button>
                </form>
            </body>
        </html>
    `);
});

// Step 3: Update Password and deactivate request
const postResetPassword = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;

    const request = await ForgotPasswordRequest.findById(id);

    if (!request || !request.isActive) {
        throw new AppError('Invalid or expired reset link', 400);
    }

    const user = await User.findById(request.userId);

    if (!user) {
        throw new AppError('User not found for this reset link', 404);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Deactivate the request so the link cannot be used again
    request.isActive = false;
    await request.save();

    res.send('Password updated successfully! You can now log in.');
});

module.exports = { forgotPassword, getResetPasswordForm, postResetPassword };