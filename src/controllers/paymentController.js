const Order = require("../models/orderModel");
const User = require("../models/signupModel");
const cashfreeService = require("../services/cashfreeService");

// Create or update a premium order (one row per user)
const createPremiumOrder = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const orderId = `order_${Date.now()}`;
        const orderAmount = 2500.00;

        const paymentSessionId = await cashfreeService.createOrder(
            orderId,
            orderAmount,
            user.id.toString(),
            user.phone || "9999999999",
            user.email
        );

        if (!paymentSessionId) throw new Error("Failed to create payment session.");

        let order = await Order.findOne({ where: { UserId: user.id } });

        if (order) {
            await order.update({ orderId, status: 'PENDING' });
        } else {
            order = await user.createOrder({ orderId, status: 'PENDING' });
        }

        return res.status(201).json({ order, payment_session_id: paymentSessionId, order_id: orderId });
    } catch (err) {
        console.error("Error in createPremiumOrder:", err);
        return res.status(500).json({ error: 'Something went wrong while creating the order.' });
    }
};

// Update transaction status for SUCCESSFUL payments (called via GET)
const updateTransactionStatus = async (req, res) => {
    try {
        const order_id = req.query.order_id || req.query.orderId;
        if (!order_id) return res.status(400).json({ error: 'Invalid request: order_id missing' });

        const order = await Order.findOne({ where: { orderId: order_id } });
        if (!order) return res.status(404).json({ error: 'Order not found' });

        const user = await User.findByPk(order.UserId);
        if (!user) return res.status(404).json({ error: 'User not found for this order' });

        const paymentStatus = await cashfreeService.getPaymentStatus(order_id);

        if (paymentStatus === 'SUCCESS' || paymentStatus === 'PAID') {
            await Promise.all([
                order.update({ status: 'SUCCESSFUL' }),
                user.update({ isPremiumUser: true })
            ]);
            // This response is mainly for users redirected from the payment gateway
            return res.send("<h1>Transaction Successful </h1><p>You are now a premium user.</p>");
        } else {
            await order.update({ status: 'FAILED' });
            return res.send("<h1>Transaction Failed </h1><p>Please try again.</p>");
        }
    } catch (err) {
        console.error("Error in updateTransactionStatus:", err);
        return res.status(500).send("<h1>Something went wrong while updating transaction.</h1>");
    }
};

// Update transaction status for FAILED payments (called via POST from frontend)
const updateFailedTransaction = async (req, res) => {
    try {
        const { order_id } = req.body;
        if (!order_id) {
            return res.status(400).json({ error: "Order ID is required." });
        }

        const order = await Order.findOne({ where: { orderId: order_id } });
        if (!order) {
            return res.status(404).json({ error: "Order not found." });
        }

        await order.update({ status: 'FAILED' });
        res.status(200).json({ message: "Transaction status updated to FAILED." });

    } catch (err) {
        console.error("Error in updateFailedTransaction:", err);
        res.status(500).json({ error: "Something went wrong while updating transaction." });
    }
};

module.exports = { createPremiumOrder, updateTransactionStatus, updateFailedTransaction };
