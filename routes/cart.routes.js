const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateCartItem, removeCartItem, clearCart } = require('../controllers/cart.controller.js');
const { protect } = require('../middlewares/auth.middleware.js');

// Protected Routes
router.get('/', protect, getCart);
router.post('/', protect, addToCart);
router.put('/:itemId', protect,  updateCartItem);
router.delete('/:itemId', protect, removeCartItem);
router.delete('/', protect, clearCart);

module.exports = router;
