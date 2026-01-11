// src/controllers/passwordController.js

const User = require('../models/signupModel');
const ForgotPasswordRequest = require('../models/forgotPasswordModel');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const brevo = require('@getbrevo/brevo');

// Configure Brevo client
const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
    brevo.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY
);

// Step 1: Create ForgotPasswordRequest and send email
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const id = uuidv4();

        // Create reset request
        // Ensure your ForgotPasswordModel has _id set to type String if you want to use UUIDs as IDs
        const request = new ForgotPasswordRequest({
            _id: id, // Explicitly setting _id if your schema allows string IDs
            userId: user._id,
            isActive: true
        });
        await request.save();

        const resetURL = `http://localhost:3000/password/resetpassword/${id}`;

        console.log("Password reset URL:", resetURL);

        // Send email using Brevo
        const sendSmtpEmail = new brevo.SendSmtpEmail();
        sendSmtpEmail.subject = "Password Reset Link";
        sendSmtpEmail.htmlContent = `<p>Click the link below to reset your password:</p><a href="${resetURL}">${resetURL}</a>`;
        sendSmtpEmail.sender = { name: "Expense Tracker", email: "noreply@expensetracker.com" };
        sendSmtpEmail.to = [{ email: user.email }];

        await apiInstance.sendTransacEmail(sendSmtpEmail);

        res.json({ message: 'Password reset link has been sent to your email' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error occurred while sending reset link.' });
    }
};

// Step 2: Show Reset Password Form
const getResetPasswordForm = async (req, res) => {
    try {
        const { id } = req.params;
        const request = await ForgotPasswordRequest.findById(id);

        if (!request || !request.isActive) {
            return res.status(400).send('Invalid or expired reset link');
        }

        res.send(`
            <form action="/password/resetpassword/${id}" method="POST">
                <input type="password" name="newPassword" placeholder="Enter new password" required />
                <button type="submit">Reset Password</button>
            </form>
        `);
    } catch (error) {
        res.status(500).send('Server error');
    }
};

// Step 3: Update Password and deactivate request
const postResetPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;

        const request = await ForgotPasswordRequest.findById(id);

        if (!request || !request.isActive) {
            return res.status(400).send('Invalid or expired reset link');
        }

        const user = await User.findById(request.userId);

        if (!user) {
            return res.status(404).send('User not found for this reset link');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        request.isActive = false;
        await request.save();

        res.send('Password updated successfully! You can now log in.');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};

module.exports = { forgotPassword, getResetPasswordForm, postResetPassword };