const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order'},
  razorpayOrderId: { type: String, required: function() { return this.paymentMethod === 'razorpay'; } }, // Razorpay order ID
  paymentId: { type: String, required: function() { return this.paymentMethod === 'razorpay'; } },  // Razorpay payment ID, required only for Razorpay
  signature: { type: String, required: function() { return this.paymentMethod === 'razorpay'; } }, 
  paymentMethod: { type: String, required: true }, // Payment method ('razorpay', 'cod', etc.)
  status: { type: String, required: true },  // 'Completed', 'Failed', etc.
  amount: { type: Number, required: true },
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
