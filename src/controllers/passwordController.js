const { User } = require("../models/signupModel");
const { ForgotPasswordRequest } = require("../models/forgotPasswordModel");
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');
const { sendEmail } = require('../services/emailService');

exports.forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new AppError('User not found', 404);

    const id = uuidv4();
    const request = new ForgotPasswordRequest({
        _id: id, 
        userId: user._id,
        isActive: true
    });
    await request.save();


    const serverUrl = process.env.SERVER_URL || 'http://localhost:3000';
    const resetURL = `${serverUrl}/password/resetpassword/${id}`;
    
    await sendEmail({
        toEmail: user.email,
        toName: user.name,
        subject: "Password Reset Link",
        htmlContent: `
            <p>Hi ${user.name},</p>
            <p>You requested a password reset.</p>
            <p>Click the link below to reset your password:</p>
            <a href="${resetURL}">${resetURL}</a>
            <p>If you did not request this, please ignore this email.</p>
        `
    });

    res.json({ message: 'Password reset link has been sent to your email' });
});

exports.getResetPasswordForm = asyncHandler(async (req, res) => {
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

exports.postResetPassword = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;

    const request = await ForgotPasswordRequest.findById(id);
    if (!request || !request.isActive) throw new AppError('Invalid or expired reset link', 400);

    const user = await User.findById(request.userId);
    if (!user) throw new AppError('User not found for this reset link', 404);

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    request.isActive = false;
    await request.save();

    res.send('Password updated successfully! You can now log in.');
});