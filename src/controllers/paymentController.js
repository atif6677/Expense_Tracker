// src/controllers/paymentController.js

const Order = require("../models/orderModel");
const User = require("../models/signupModel");
const cashfreeService = require("../services/cashfreeService");

// Create Premium Order
const createPremiumOrder = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        const orderId = `order_${Date.now()}`;
        const orderAmount = 500.00;

        const paymentSessionId = await cashfreeService.createOrder(
            orderId,
            orderAmount,
            user._id.toString(),
            user.phone || "9999999999",
            user.email
        );
        if (!paymentSessionId) throw new Error("Failed to create payment session");

        // Check if order exists, otherwise create new
        let order = await Order.findOne({ userId: user._id }); // Assuming userId field in Order model
        
        if (order) {
            order.orderId = orderId;
            order.status = "PENDING";
            await order.save();
        } else {
            order = new Order({
                orderId,
                status: "PENDING",
                userId: user._id
            });
            await order.save();
        }

        res.status(201).json({ order, payment_session_id: paymentSessionId });
    } catch (err) {
        console.error("Error in createPremiumOrder:", err);
        res.status(500).json({ error: "Something went wrong while creating the order." });
    }
};

// Handle Success / Redirect
const updateTransactionStatus = async (req, res) => {
    try {
        const order_id = req.query.order_id;
        if (!order_id) return res.status(400).send("<h1>Order ID missing</h1>");

        const order = await Order.findOne({ orderId: order_id });
        if (!order) return res.status(404).send("<h1>Order not found</h1>");

        const user = await User.findById(order.userId);
        if (!user) return res.status(404).send("<h1>User not found for this order</h1>");

        const paymentStatus = await cashfreeService.getPaymentStatus(order_id);

        if (paymentStatus === "SUCCESS" || paymentStatus === "PAID") {
            // Update order
            order.status = "SUCCESSFUL";
            await order.save();

            // Update user
            user.isPremiumUser = true;
            await user.save();

            return res.redirect("http://localhost:3000/home.html");
        } else {
            order.status = "FAILED";
            await order.save();
            return res.redirect("http://localhost:3000/home.html");
        }
    } catch (err) {
        console.error("Error in updateTransactionStatus:", err);
        return res.status(500).send("<h1>Something went wrong while updating transaction.</h1>");
    }
};

module.exports = { createPremiumOrder, updateTransactionStatus };