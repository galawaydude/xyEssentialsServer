const Joi = require('joi');

// Schema for placing a new order
const placeOrderSchema = Joi.object({
  user: Joi.string().required(),  // User ID should be required
  products: Joi.array().items(
    Joi.object({
      product: Joi.string().required(),  // Product ID should be required
      quantity: Joi.number().integer().min(1).required(),  // Quantity must be a positive integer
    })
  ).required(),
  totalAmount: Joi.number().positive().required(),  // Total amount must be positive
  orderStatus: Joi.string().valid('Pending', 'Completed', 'Cancelled', 'Delivered').default('Pending'), // Default status
});

// Schema for updating order status
const updateOrderStatusSchema = Joi.object({
  orderStatus: Joi.string().valid('Pending', 'Completed', 'Cancelled', 'Delivered').required(),
});

module.exports = {
  placeOrderSchema,
  updateOrderStatusSchema,
};
