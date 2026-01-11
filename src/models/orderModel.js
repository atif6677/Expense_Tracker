// models/orderModel.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    orderId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    paymentid: String, // Store payment ID if needed
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

module.exports = mongoose.model('Order', orderSchema);