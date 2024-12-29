const express = require('express');
const router = express.Router();
const { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory } = require('../controllers/category.controller.js');
const { protect, admin } = require('../middlewares/auth.middleware.js');

// Public Routes
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

// Admin Routes
router.post('/', protect, admin, createCategory);
router.put('/:id', protect, admin, updateCategory);
router.delete('/:id', protect, admin, deleteCategory);

module.exports = router;
