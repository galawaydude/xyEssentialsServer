const Joi = require('joi');

// Schema for adding a review
const addReviewSchema = Joi.object({
  product: Joi.string().required(),  // Product ID should be required
  user: Joi.string().required(),     // User ID should be required
  rating: Joi.number().min(1).max(5).required(), // Rating between 1 and 5
  comment: Joi.string().required(),  // Comment is required
});

// Schema for updating a review
const updateReviewSchema = Joi.object({
  rating: Joi.number().min(1).max(5).optional(), // Optional rating
  comment: Joi.string().optional(),             // Optional comment
});

module.exports = {
  addReviewSchema,
  updateReviewSchema,
};
