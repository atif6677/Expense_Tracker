// src/utils/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        console.log("🔍 Debug - Checking MONGO_URI...");
        
        // 1. Log the value (partially hidden for security)
        const uri = process.env.MONGO_URI;
        if (!uri) {
            console.error("❌ ERROR: MONGO_URI is undefined in .env file");
            console.error("   Ensure your .env file is in the root folder and saved.");
            process.exit(1);
        } else {
            console.log(`✅ Found MONGO_URI: ${uri.substring(0, 20)}...`);
        }

        // 2. Connect directly to the URI (No localhost fallback)
        await mongoose.connect(uri);
        
        console.log('✅ Connected to MongoDB Atlas successfully.');
    } catch (err) {
        console.error('❌ MongoDB Connection Failed:');
        console.error(err.message);
        process.exit(1);
    }
};

module.exports = connectDB;