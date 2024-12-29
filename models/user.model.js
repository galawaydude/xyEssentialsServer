const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // Add this line

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  cuid: { type: String }, 
  mobileNumber: { type:Number },
  pfp: { type: String },
  password: { type: String },
  googleId: { type: String },
  isAdmin: { type: Boolean, default: false },
  addresses: [{
    type: mongoose.Schema.Types.ObjectId, ref: 'Address'
  }],
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  otp: { type: String }, // OTP field
  otpExpires: { type: Date }, // Expiration time for OTP
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;



// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//   clerkId: { type: String, required: true, unique: true }, 
//   addresses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Address' }], 
//   orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }], 
// }, { timestamps: true });

// const User = mongoose.model('User', userSchema);
// module.exports = User;
