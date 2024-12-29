const express = require('express');
const router = express.Router();
const { getAllCoupons, applyCoupon, createCoupon, updateCoupon, deleteCoupon } = require('../controllers/coupon.controller.js');
const { protect, admin } = require('../middlewares/auth.middleware.js');

// Public Routes
router.post('/apply', protect, applyCoupon);

// Admin Routes
router.get('/', protect, getAllCoupons);
router.post('/', protect, admin, createCoupon);
router.put('/:id', protect, admin, updateCoupon);
router.delete('/:id', protect, admin, deleteCoupon);

module.exports = router;
