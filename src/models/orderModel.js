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
    paymentid: String, 
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

const Order = mongoose.model("Order", orderSchema);

module.exports = { Order };