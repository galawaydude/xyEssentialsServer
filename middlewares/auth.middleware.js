const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/user.model.js');
const asyncHandler = require('express-async-handler');

const protect = asyncHandler(async (req, res, next) => {
  // console.log('Cookies:', req.cookies);
  const token = req.cookies.token;

  if (token) {
    try {
      // console.log('Token:', token);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // console.log('Decoded Token:', decoded);

      // Use decoded.id if present, otherwise use decoded._id
      const userId = decoded.id || decoded._id; 
      // console.log('Decoded User ID:', userId);

      req.user = await User.findById(userId);

      if (!req.user) {
        console.error('User not found');
        return res.redirect('/');
      }

      // console.log('Authenticated User:', req.user);
      next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      return res.redirect('/');
    }
  } else {
    console.error('No token found');
    return res.redirect('/');
  }
});


const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as an admin');
  }
};

module.exports = { protect, admin };
