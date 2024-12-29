const Joi = require('joi');

// Schema for adding an item to the cart
const addToCartSchema = Joi.object({
  productId: Joi.string().required(), // Product ID is required
  quantity: Joi.number().integer().min(1).required(), // Quantity must be a positive integer
});

// Schema for updating an item in the cart
const updateCartItemSchema = Joi.object({
  quantity: Joi.number().integer().min(0).required(), // Quantity must be a positive integer or zero to remove
});

// Schema for removing an item from the cart
const removeCartItemSchema = Joi.object({
  itemId: Joi.string().required(), // Item ID is required for removal
});

module.exports = {
  addToCartSchema,
  updateCartItemSchema,
  removeCartItemSchema,
};
