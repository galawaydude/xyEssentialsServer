const Joi = require('joi');

// Schema for creating a new address
const createAddressSchema = Joi.object({
  address: Joi.string().required().min(5).max(200), // Address is required and should be between 5 to 200 characters
  city: Joi.string().required().min(2).max(100), // City is required and should be between 2 to 100 characters
  postalCode: Joi.string().required().min(5).max(10), // Postal code is required and should be between 5 to 10 characters
  country: Joi.string().required().min(2).max(100), // Country is required and should be between 2 to 100 characters
});

// Schema for updating an existing address
const updateAddressSchema = Joi.object({
  address: Joi.string().optional().min(5).max(200), // Address is optional but should meet the length requirements if provided
  city: Joi.string().optional().min(2).max(100), // City is optional but should meet the length requirements if provided
  postalCode: Joi.string().optional().min(5).max(10), // Postal code is optional but should meet the length requirements if provided
  country: Joi.string().optional().min(2).max(100), // Country is optional but should meet the length requirements if provided
});

module.exports = {
  createAddressSchema,
  updateAddressSchema,
};
