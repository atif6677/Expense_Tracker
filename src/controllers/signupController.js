// src/controllers/signupController.js

const { User } = require("../models/signupModel");
const bcrypt = require("bcrypt");
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');

const saltRounds = 10; 

exports.addUserSignup = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
        throw new AppError("All fields are required", 400);
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new AppError("User already exists", 409);
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = new User({ 
        name, 
        email, 
        password: hashedPassword,
        totalExpenses: 0 
    });
    
    await user.save();
    
    res.status(201).json({
        message: "New user added successfully",
        user: { id: user._id, name: user.name, email: user.email }
    });
});