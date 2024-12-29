const express = require('express');
const router = express.Router();
const { getProductReviews, addReview, updateReview, deleteReview , getAllReviews} = require('../controllers/review.controller.js');
const { protect, admin } = require('../middlewares/auth.middleware.js');

// Public Routes
router.get('/product/:productId', getProductReviews);

// Protected Routes
router.post('/', addReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

router.get('/', protect, admin, getAllReviews);

module.exports = router;
