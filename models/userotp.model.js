const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // Add this line

const userOtpSchema = new mongoose.Schema({
  userId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  otp: { type: String }, // OTP field
  otpExpires: { type: Date }, // Expiration time for OTP
}, { timestamps: true });

const UserOtp = mongoose.model('UserOtp', userOtpSchema);
module.exports = UserOtp;
