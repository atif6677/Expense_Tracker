const { Order } = require("../models/orderModel");
const { User } = require("../models/signupModel");
const cashfreeService = require("../services/cashfreeService");
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');

exports.createPremiumOrder = asyncHandler(async (req, res) => {
    const user = req.user;

    const orderId = `order_${Date.now()}`;
    const orderAmount = 500.00;

    const paymentSessionId = await cashfreeService.createOrder(
        orderId,
        orderAmount,
        user._id.toString(),
        user.phone || "9999999999",
        user.email
    );
    if (!paymentSessionId) throw new AppError("Failed to create payment session", 500);

    let order = await Order.findOne({ userId: user._id });
    
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
});

exports.updateTransactionStatus = asyncHandler(async (req, res) => {
    const order_id = req.query.order_id;
    if (!order_id) throw new AppError("Order ID missing", 400);

    const order = await Order.findOne({ orderId: order_id });
    if (!order) throw new AppError("Order not found", 404);

    const user = await User.findById(order.userId);
    if (!user) throw new AppError("User not found for this order", 404);

    const paymentStatus = await cashfreeService.getPaymentStatus(order_id);

    
    const serverUrl = process.env.SERVER_URL || "http://localhost:3000";

    if (paymentStatus === "SUCCESS" || paymentStatus === "PAID") {
        order.status = "SUCCESSFUL";
        await order.save();

        user.isPremiumUser = true;
        await user.save();

        return res.redirect(`${serverUrl}/home.html`);
    } else {
        order.status = "FAILED";
        await order.save();
        return res.redirect(`${serverUrl}/home.html`);
    }
});