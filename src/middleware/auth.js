// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/signupModel');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');

const authenticate = asyncHandler(async (req, res, next) => {
    // 1. Get the header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
        throw new AppError("Authentication token missing", 401);
    }

    // 2. Extract the token (Remove 'Bearer ' string)
    const token = authHeader.replace('Bearer ', '');

    // 3. Verify token
    // jwt.verify throws a standard error if invalid, which asyncHandler catches.
    // If you want a custom message for invalid tokens, the errorMiddleware 
    // can be tweaked, or we let the generic 500/401 handle it.
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