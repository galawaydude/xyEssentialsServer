const express = require('express');
const router = express.Router();
const { getInventory, getProductInventory, updateInventory } = require('../controllers/inventory.controller.js');
const { protect, admin } = require('../middlewares/auth.middleware.js');

// Admin Routes
router.get('/', protect, admin, getInventory);
router.get('/:productId', protect, admin, getProductInventory);
router.put('/:productId', protect, admin, updateInventory);

module.exports = router;
