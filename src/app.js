// src/app.js

require("dotenv").config(); 

const express = require("express");
const path = require("path");
const cors = require("cors");
const db = require("./utils/database");
const app = express();


// Routes
const signupRoutes = require("./routes/signupRoute");
const loginRoutes = require("./routes/loginRoute");
const homeRoutes = require("./routes/homeRoute");
const paymentRoutes = require("./routes/paymentRoute");
const premiumRoutes = require("./routes/premiumUserRoute");
const passwordRoutes = require("./routes/passwordRoute");
const reportRoutes = require("./routes/reportRoute");


// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(express.static(path.join(__dirname, "../public")));


// API Routes
app.use("/", signupRoutes);
app.use("/", loginRoutes);
app.use("/", homeRoutes);
app.use("/payment", paymentRoutes);
app.use("/premium",premiumRoutes);
app.use("/password",passwordRoutes);
app.use("/report", reportRoutes);

// Sync DB and start server
const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await db.sync();
    console.log("Database synced");

    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}/signup.html`);
    });
  } catch (err) {
    console.error("DB sync error:", err);
  }
})();

module.exports = app;
