const Joi = require('joi');

// Schema for creating a new category
const createCategorySchema = Joi.object({
  name: Joi.string().required().min(1).max(100), // Name should be required with a length constraint
});

// Schema for updating a category
const updateCategorySchema = Joi.object({
  name: Joi.string().min(1).max(100), // Name can be optional but must follow length constraints if provided
});

// Schema for getting a category by ID (not strictly necessary, but can be added)
const getCategoryByIdSchema = Joi.object({
  id: Joi.string().required(), // Ensure ID is provided and valid
});

module.exports = {
  createCategorySchema,
  updateCategorySchema,
  getCategoryByIdSchema,
};
