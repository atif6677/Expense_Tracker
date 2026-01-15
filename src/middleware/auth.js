// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/signupModel');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');

const authenticate = asyncHandler(async (req, res, next) => {

    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
        throw new AppError("Authentication token missing", 401);
    }

    // 2. Extract the token (Remove 'Bearer ' string)
    const token = authHeader.replace('Bearer ', '');

    let userObj;
    try {
        userObj = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        throw new AppError("Invalid or expired token", 401);
    }
    
    // 4. Find user in MongoDB
    const user = await User.findById(userObj.userId);

    if (!user) {
        throw new AppError("User not found", 401);
    }

    // 5. Attach user to request
    req.user = user; 
    req.user.userId = user._id; 
    next();
});

module.exports = authenticate;