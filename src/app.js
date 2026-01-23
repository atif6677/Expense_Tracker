require("dotenv").config(); 
const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { connectDB } = require("./config/database");
const errorHandler = require("./middleware/errorMiddleware");

const app = express();

// We disable contentSecurityPolicy so external scripts (Axios, Cashfree, Chart.js) work correctly.
app.use(helmet({
  contentSecurityPolicy: false, 
}));

// 2. Apply Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 200, 
  message: "Too many requests from this IP, please try again after 15 minutes"
});
app.use(limiter);

// 3. Standard Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(express.static(path.join(__dirname, "../public")));
app.get('/', (req, res) => {
    res.redirect('/login.html');
});

// ✅ Routes (Clean & Organized)
app.use("/", require("./routes/signupRoute"));
app.use("/", require("./routes/loginRoute"));
app.use("/", require("./routes/homeRoute"));
app.use("/payment", require("./routes/paymentRoute"));
app.use("/premium", require("./routes/premiumUserRoute"));
app.use("/password", require("./routes/passwordRoute"));
app.use("/report", require("./routes/reportRoute"));

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
    // Note: Once deployed, SERVER_URL env var will handle redirects, but this log is for local dev
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}/signup.html`));
});