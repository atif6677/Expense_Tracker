const brevo = require('@getbrevo/brevo');

// 1. Initialize Brevo Client (Once for the whole app)
const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
    brevo.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY
);

// 2. Generic Send Function
const sendEmail = async ({ toEmail, toName, subject, htmlContent }) => {
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.sender = { 
        name: "Expense Tracker", 
        email: process.env.EMAIL_USER || "noreply@expensetracker.com" 
    };
    sendSmtpEmail.to = [{ email: toEmail, name: toName || "User" }];

    try {
        await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log(`📧 Email sent to ${toEmail}`);
        return true;
    } catch (err) {
        console.error("❌ Email Failed:", err.body || err.message);
        return false;
    }
};

module.exports = { sendEmail };