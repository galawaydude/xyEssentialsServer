const Joi = require('joi');

// Schema for creating a new coupon
const createCouponSchema = Joi.object({
  code: Joi.string().required(), // Coupon code should be required
  discount: Joi.number().required(), // Discount value should be required
  expiresAt: Joi.date().required(), // Expiration date should be required
});

// Schema for updating a coupon
const updateCouponSchema = Joi.object({
  code: Joi.string(),
  discount: Joi.number(),
  expiresAt: Joi.date(),
});

// Schema for applying a coupon
const applyCouponSchema = Joi.object({
  code: Joi.string().required(), // Coupon code should be required
});

module.exports = {
  createCouponSchema,
  updateCouponSchema,
  applyCouponSchema,
};
