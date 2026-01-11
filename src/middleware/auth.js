// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/signupModel');

const authenticate = async (req, res, next) => {
    try {
        // 1. Get the header
        const authHeader = req.header('Authorization');
        
        if (!authHeader) {
            return res.status(401).json({ error: "Authentication token missing" });
        }

        // 2. Extract the token (Remove 'Bearer ' string)
        // If the header is "Bearer abc123xyz", this leaves just "abc123xyz"
        const token = authHeader.replace('Bearer ', '');

        // 3. Verify token
        const userObj = jwt.verify(token, process.env.JWT_SECRET);
        
        // 4. Find user in MongoDB
        const user = await User.findById(userObj.userId);

        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }

        // 5. Attach user to request
        req.user = user; 
        req.user.userId = user._id; // Standardize access to ID
        next();

    } catch (err) {
        // console.error(err); // Optional: Un-comment to see full error details
        return res.status(401).json({ success: false, message: "Authentication failed" });
    }
};

module.exports = authenticate;