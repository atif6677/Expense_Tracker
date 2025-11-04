// src/controllers/signupController.js

const User = require("../models/signupModel");
const bcrypt = require("bcrypt");

const saltRounds = 10; 

const addUserSignup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // 1. Basic Validation Check
        if (!name || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }
        
        // 2. Check if email already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ error: "User already exists" });
        }

        // 3. Hash the password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 4. Create the new user
        const user = await User.create({ name, email, password: hashedPassword });
        
        // 5. Success Response
        res.status(201).json({
            message: "New user added successfully",
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Signup Error:', error);
        // 500 Internal Server Error for unexpected issues (like DB connection failure)
        res.status(500).json({ error: 'Failed to complete signup. Please try again later.' });
    }
};

module.exports = addUserSignup;
