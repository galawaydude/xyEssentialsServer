const express = require('express');
const router = express.Router();
const { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, updateProductStock } = require('../controllers/product.controller.js');
const { protect, admin } = require('../middlewares/auth.middleware.js');
const { productSchema } = require('../validations/product.validator.js');
const validateRequest = require('../middlewares/validate.middleware.js');
const clerkAuth = require('../middlewares/clerk.middleware.js');
const { getProductReviews, addReview, updateReview, deleteReview,  } = require('../controllers/review.controller.js');
const { upload } = require('../middlewares/multer.middleware.js');

// User Routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.put('/update-stock', updateProductStock);
router.get('/:id/reviews', getProductReviews);
router.post('/:id/reviews', protect, addReview);
router.post('/:id/reviews/:id', protect, updateReview);

// Admin Routes
router.post('/', protect, admin, upload.fields([{ name: 'productImages' }]), createProduct);
router.put('/:id',protect, admin, upload.fields([{ name: 'productImages' }]), updateProduct);
router.delete('/:id', protect, admin, deleteProduct);



module.exports = router;
