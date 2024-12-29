const Joi = require('joi');

// Schema for updating a product
const productSchema = Joi.object({
  name: Joi.string().optional(),
  price: Joi.number().positive().optional(),
  description: Joi.string().optional(),
  images: Joi.array().items(Joi.string().uri()).optional(),
  category: Joi.string().optional(),
  stock: Joi.number().integer().min(0).optional(),
  brand: Joi.string().optional(),
  rating: Joi.number().min(0).max(5).optional(),
  reviews: Joi.array().items(Joi.string()).optional(),
  claims: Joi.array().items(Joi.string()).optional(),
  suitableFor: Joi.array().items(Joi.string()).optional(),
  keyIngredients: Joi.array().items(
    Joi.object({
      ingredient: Joi.string().required(),
      description: Joi.string().optional()
    })
  ).optional(),
  whatMakesItWorthUsing: Joi.string().optional(),
});

module.exports = {
  productSchema,
};
