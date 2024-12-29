// app.js or server.js
const express = require('express');
const router = express.Router();
const {sendWelcomeEmail, sendBulkEmail, sendCustomEmail, sendFilteredEmail} = require('../controllers/mail.controller');
const { protect, admin } = require('../middlewares/auth.middleware');

// Use routes
// router.post('/contact', sendContactEmail);
// router.post('/broadcast', sendBulkEmails);
router.post('/welcome', protect, admin,sendWelcomeEmail);
router.post('/bulk', protect, admin, sendBulkEmail);
router.post('/custom', protect, admin, sendCustomEmail);
router.post('/filtered', protect, admin, sendFilteredEmail);

module.exports = router;