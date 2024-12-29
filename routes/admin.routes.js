const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware.js');
const { 
    getDashboardStats,
    getSalesAnalytics,
    getProductAnalytics,
    getCustomerAnalytics,
    getInventoryAnalytics,
    getRevenueMetrics,
    getPerformanceMetrics
} = require('../controllers/admin.controller.js');

router.get('/dashboard', protect, getDashboardStats);
router.get('/sales', protect, getSalesAnalytics);
router.get('/products', protect, getProductAnalytics);
router.get('/customers', protect, getCustomerAnalytics);
router.get('/inventory', protect, getInventoryAnalytics);
router.get('/revenue', protect, getRevenueMetrics);
router.get('/performance', protect, getPerformanceMetrics);

module.exports = router;