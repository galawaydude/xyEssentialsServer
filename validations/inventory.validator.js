const Joi = require('joi');

// Schema for updating inventory stock
const updateInventorySchema = Joi.object({
  quantity: Joi.number().integer().min(0).required(), // Quantity must be a non-negative integer
});

module.exports = {
  updateInventorySchema,
};
