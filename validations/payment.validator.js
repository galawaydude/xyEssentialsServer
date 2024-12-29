const Joi = require('joi');

// Schema for processing a payment
const processPaymentSchema = Joi.object({
  orderId: Joi.string().required(),         // Order ID should be required
  paymentMethod: Joi.string().valid('Razorpay', 'CreditCard', 'DebitCard').required(), // Example payment methods
  amount: Joi.number().positive().required(), // Amount must be a positive number
});

// Schema for verifying a payment
const verifyPaymentSchema = Joi.object({
  paymentId: Joi.string().required(), // Razorpay payment ID
  orderId: Joi.string().required(),    // Order ID should be required
});

module.exports = {
  processPaymentSchema,
  verifyPaymentSchema,
};
