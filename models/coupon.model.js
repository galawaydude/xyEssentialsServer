const mongoose = require('mongoose');
const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },  
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },  
  discountValue: { type: Number, required: true },  
  expirationDate: { type: Date, required: true },  
  minimumPurchaseAmount: { type: Number, default: 0 }, 
  maxDiscountAmount: { type: Number },  
  usageLimit: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Coupon = mongoose.model('Coupon', couponSchema);
module.exports = Coupon;
