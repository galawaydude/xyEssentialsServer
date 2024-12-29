const mongoose = require('mongoose');
const addressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // User who owns the address
  fullName: { type: String, required: true }, 
  addressLine1: { type: String, required: true },
  addressLine2: { type: String },
  landMark: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  isDefault: { type: Boolean, default: false }, 
}, { timestamps: true });

const Address = mongoose.model('Address', addressSchema);
module.exports = Address;
