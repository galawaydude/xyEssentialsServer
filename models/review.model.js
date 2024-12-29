const mongoose = require('mongoose');
const reviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product'}, 
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
}, { timestamps: true });

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
