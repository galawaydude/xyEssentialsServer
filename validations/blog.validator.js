const Joi = require('joi');

// Schema for creating a new blog post
const createBlogSchema = Joi.object({
  title: Joi.string().required().min(3).max(100), // Title is required and should be between 3 to 100 characters
  content: Joi.string().required().min(10), // Content is required and should be at least 10 characters
});

// Schema for updating a blog post
const updateBlogSchema = Joi.object({
  title: Joi.string().optional().min(3).max(100), // Title is optional, but if provided, should be between 3 to 100 characters
  content: Joi.string().optional().min(10), // Content is optional, but if provided, should be at least 10 characters
});

module.exports = {
  createBlogSchema,
  updateBlogSchema,
};
