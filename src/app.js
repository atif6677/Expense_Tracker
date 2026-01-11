// src/app.js
require("dotenv").config(); 

const express = require("express");
const path = require("path");
const cors = require("cors");
const connectDB = require("./utils/database");
const errorHandler = require("./middleware/errorMiddleware"); // Import Error Handler

const app = express();

const signupRoutes = require("./routes/signupRoute");
const loginRoutes = require("./routes/loginRoute");
const homeRoutes = require("./routes/homeRoute");
const paymentRoutes = require("./routes/paymentRoute");
const premiumRoutes = require("./routes/premiumUserRoute");
const passwordRoutes = require("./routes/passwordRoute");
const reportRoutes = require("./routes/reportRoute");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(express.static(path.join(__dirname, "../public")));

app.use("/", signupRoutes);
app.use("/", loginRoutes);
app.use("/", homeRoutes);
app.use("/payment", paymentRoutes);
app.use("/premium", premiumRoutes);
app.use("/password", passwordRoutes);
app.use("/report", reportRoutes);

// ✅ Error Middleware (Must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`✅ Server running on http://localhost:${PORT}/signup.html`);
    });
});

module.exports = app;