require("dotenv").config(); 
const express = require("express");
const path = require("path");
const cors = require("cors");
const connectDB = require("./utils/database");
const errorHandler = require("./middleware/errorMiddleware");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(express.static(path.join(__dirname, "../public")));

// Route mounting
app.use("/", require("./routes/signupRoute"));
app.use("/", require("./routes/loginRoute"));
app.use("/", require("./routes/homeRoute"));
app.use("/payment", require("./routes/paymentRoute"));
app.use("/premium", require("./routes/premiumUserRoute"));
app.use("/password", require("./routes/passwordRoute"));
app.use("/report", require("./routes/reportRoute"));

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
connectDB().then(() => {
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}/signup.html`));
});