const asyncHandler = require('express-async-handler');
const Review = require('../models/review.model');
const User = require('../models/user.model');
const Product = require('../models/product.model');

// Get all reviews
const getAllReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({})
  .populate('product', 'name')
  .populate('user', 'name');
  res.json(reviews);
});

// Get all reviews for a product
const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId });
  res.json(reviews);
});

// Add a review
const addReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(req.user._id);

  // Create a new review with the productId included
  const review = new Review({
    ...req.body,        // Spread the existing body data
    user: user._id,     // Set the user field
    product: id  // Set the product field
  });

  const createdReview = await review.save();

  await Product.findByIdAndUpdate(id, {
    $push: { reviews: createdReview._id }
  });

  res.status(201).json(createdReview);
});


// Update a review
const updateReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const review = await Review.findById(req.params.id);

  if (review && review.user.equals(req.user._id)) {
    review.rating = rating || review.rating;
    review.comment = comment || review.comment;

    const updatedReview = await review.save();
    res.json(updatedReview);
  } else {
    res.status(404);
    throw new Error('Review not found');
  }
});

// Delete a review
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (review && review.user.equals(req.user._id)) {
    await review.deleteOne();
    res.json({ message: 'Review removed' });
  } else {
    res.status(404);
    throw new Error('Review not found');
  }
});

module.exports = {
  getProductReviews,
  addReview,
  updateReview,
  deleteReview,
  getAllReviews
};
