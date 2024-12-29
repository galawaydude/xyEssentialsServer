const express = require('express');
const router = express.Router();
const { processRazorpay, getPaymentStatus, verify, handleRazorpayWebhook } = require('../controllers/payment.controller.js');
const { protect } = require('../middlewares/auth.middleware.js');

// Protected Routes
router.post('/razorpay', protect, processRazorpay);
router.get('/status/:orderId', protect, getPaymentStatus);

// Razorpay Webhook for payment verification
router.post('/verify', protect, verify);
router.post('/razorpayWebhook', protect, handleRazorpayWebhook);

module.exports = router;
