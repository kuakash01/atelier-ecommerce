const express = require('express');
const router = express.Router();

const verifyToken = require('../middlewares/verifyToken'); // Middleware to verify token

const { 
    createOrder, 
    getUserOrders, 
    getOrderById, 
    verifyPayment, 
    handlePaymentFailed, 
    razorpayWebhook 
} = require('../conrollers/order.controller');

// Create a new order
router.post('/', verifyToken, createOrder);

// Verify client-completed payment
router.post('/verify-payment', verifyToken, verifyPayment);

// Handle client-reported payment dismissal or payment failure
router.post('/payment-failed', verifyToken, handlePaymentFailed);

// Razorpay server-to-server webhook endpoint
router.post('/webhook', razorpayWebhook);

// Get all orders for a user
router.get('/', verifyToken, getUserOrders);

// Get a specific order by ID
router.get('/:orderId', verifyToken, getOrderById);


module.exports = router;