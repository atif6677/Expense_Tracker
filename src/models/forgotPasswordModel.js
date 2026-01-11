// src/models/forgotPasswordModel.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const forgotPasswordSchema = new Schema({
    _id: { // If you generate your own UUIDs for links, keep this. If not, remove it to let Mongo use its own IDs.
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
