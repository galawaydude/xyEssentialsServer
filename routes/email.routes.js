// routes/email.routes.js
const express = require('express');
const {
  sendOrderConfirmation,
  sendNewsletterSignup,
  sendPromotionEmail
} = require('../controllers/email.controller.js');
const { protect, admin } = require('../middlewares/auth.middleware');

const router = express.Router();

// Order Confirmation Email Route (for protected users, e.g., customers)
router.post('/order-confirmation', protect, sendOrderConfirmation);

// Newsletter Signup Email Route (open to everyone)
router.post('/newsletter-signup', sendNewsletterSignup);

// Promotional Emails Route (for admin)
router.post('/send-promotions', protect, admin, sendPromotionEmail);

module.exports = router;
