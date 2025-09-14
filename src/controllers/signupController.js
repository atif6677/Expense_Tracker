const User = require("../models/signupModel");
const bcrypt = require("bcrypt");

const addUserSignup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
       res.status(400).json({ error: "All fields are required" });
       return;
    }

    // check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: "User already exists" });
      return;
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await User.create({ name, email, password: hashedPassword });
    
    res.status(201).json({
      message: "New user added successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = addUserSignup;
