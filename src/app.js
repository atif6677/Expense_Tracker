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


// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // <-- Add this
app.use(express.static(path.join(__dirname, "../public")));


// API Routes
app.use("/", signupRoutes);
app.use("/", loginRoutes);
app.use("/", homeRoutes);
app.use("/payment", paymentRoutes);
app.use("/premium",premiumRoutes);
app.use("/password",passwordRoutes)

// Sync DB and start server
db.sync()
  .then(() => {
    console.log("✅ Database synced");
    app.listen(3000, () =>
      console.log("🚀 Server running at http://localhost:3000")
    );
  })
  .catch((err) => console.error("❌ DB sync error:", err));

module.exports = app;
