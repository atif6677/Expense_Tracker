// src/models/forgotPasswordModel.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const forgotPasswordSchema = new Schema({
    _id: { // To generate your own UUIDs for links, Cause it is more secure.
        type: String, 
        required: true 
    },
    isActive: {
        type: Boolean,
        default: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

module.exports = mongoose.model('ForgotPasswordRequest', forgotPasswordSchema);
