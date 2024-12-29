const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, getUsers, getUserById } = require('../controllers/user.controller.js');
const { getUserOrders, getOrderById, placeOrder, updateOrderStatus, cancelOrder } = require('../controllers/order.controller.js');
const { getUserAddresses, createAddress, updateAddress, deleteAddress } = require('../controllers/address.controller.js');
const { getCart, addToCart, updateCartItem, removeCartItem, clearCart } = require('../controllers/cart.controller.js');
const { protect, admin } = require('../middlewares/auth.middleware.js');
const userValidator = require('../validations/user.validator.js');

// Protected Routes
router.get('/profile', protect, getUserProfile);
router.post('/profile', protect, updateUserProfile);
router.get('/user/orders', protect, getUserOrders);
router.get('/user/addresses', protect, getUserAddresses);
router.get('/user/cart', protect, getCart);
router.put('/profile', protect, updateUserProfile);

// Admin Routes
router.get('/', protect, admin, getUsers);
router.get('/:id', protect, admin, getUserById);

module.exports = router;
