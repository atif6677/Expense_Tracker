// src/services/cashfreeService.js

const axios = require("axios");

exports.createOrder = async (orderId, orderAmount, customerId, customerPhone, customerEmail) => {
  try {
    const response = await axios.post(
      "https://sandbox.cashfree.com/pg/orders",
      {
        order_id: orderId,
        order_amount: orderAmount,
        order_currency: "INR",
        customer_details: {
          customer_id: customerId,
          customer_email: customerEmail,
          customer_phone: customerPhone,
        },
        order_meta: {
          return_url: `http://localhost:3000/payment/updateTransactionStatus?order_id=${encodeURIComponent(orderId)}`,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-client-id": process.env.CASHFREE_APP_ID,
          "x-client-secret": process.env.CASHFREE_SECRET_KEY,
          "x-api-version": "2023-08-01",
        },
      }
    );

    return response.data.payment_session_id;
  } catch (error) {
    console.error("Error creating Cashfree order:", error.response?.data || error.message);
    return null;
  }
};

exports.getPaymentStatus = async (orderId) => {
  try {
    const response = await axios.get(
      `https://sandbox.cashfree.com/pg/orders/${orderId}`,
      {
        headers: {
          "x-client-id": process.env.CASHFREE_APP_ID,
          "x-client-secret": process.env.CASHFREE_SECRET_KEY,
          "x-api-version": "2023-08-01",
        },
      }
    );

    return response.data.order_status || "FAILED";
  } catch (error) {
    console.error("Error fetching Cashfree payment status:", error.response?.data || error.message);
    return "FAILED";
  }
};
