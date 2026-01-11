// src/utils/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        console.log("🔍 Debug - Checking MONGO_URI...");
        
        const uri = process.env.MONGO_URI;
        if (!uri) {
            console.error("❌ ERROR: MONGO_URI is undefined in .env file");
            process.exit(1);
        }

        // Connect directly to the URI
        await mongoose.connect(uri);
        
        console.log('✅ Connected to MongoDB Atlas successfully.');
    } catch (err) {
        console.error('❌ MongoDB Connection Failed:', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;