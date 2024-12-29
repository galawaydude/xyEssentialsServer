const express = require('express');
const router = express.Router();
//  
const { registerUser, authUser, authAdmin, googleLogin, adminGoogleLogin, sendOTP, verifyOTP } = require('../controllers/auth.controller.js');
const { protect, admin } = require('../middlewares/auth.middleware.js');

router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/admin-login', authAdmin);
router.get('/google', googleLogin);
router.get('/admin-google', adminGoogleLogin);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);

module.exports = router;