const asyncHandler = require('express-async-handler');
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const generateToken = require('../utils/generateToken.js');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../utils/resend');

// Get user profile
const getUserProfile = asyncHandler(async (req, res) => {
  const user = req.user;
  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// Update user profile
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const { name, email, mobileNumber } = req.body;

    console.log('Updating user:', req.body);
    
    user.name = name || user.name;
    user.email = email || user.email;
    user.mobileNumber = mobileNumber || user.mobileNumber;

    const updatedUser = await user.save();

    console.log('User updated:', updatedUser);

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      mobileNumber: updatedUser.mobileNumber,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// Register user
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    const user = await User.create({ name, email, password });
    
    // Send welcome email
    await sendWelcomeEmail(user);

    res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id)
    });
});

// Request password reset
const requestPasswordReset = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (user) {
        const resetToken = generateResetToken();
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        await sendPasswordResetEmail(user, resetToken);
        res.json({ message: 'Password reset email sent' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// Get all users (Admin only)
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({})
  .populate('orders')
  .populate('addresses'); 
  res.json(users);
});

// Get user by ID (Admin only)
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  .populate('orders')
  .populate('addresses');
  res.json(user);
});

// Clerk

// Fetch all users
// const getAllUsers = async (req, res) => {
//   try {
//     // Fetch all users from Clerk
//     const clerkUsers = await clerkClient.users.getUserList();

//     // Fetch custom data from MongoDB
//     const mongoUsers = await User.find();

//     // Combine Clerk data with MongoDB data
//     const combinedUsers = clerkUsers.map(clerkUser => {
//       const mongoUser = mongoUsers.find(user => user.clerkId === clerkUser.id);
//       return {
//         id: clerkUser.id,
//         name: clerkUser.firstName + ' ' + clerkUser.lastName,
//         email: clerkUser.emailAddresses[0]?.emailAddress,
//         addresses: mongoUser?.addresses || [],
//         orders: mongoUser?.orders || [],
//         createdAt: clerkUser.createdAt,
//       };
//     });

//     res.status(200).json(combinedUsers);
//   } catch (error) {
//     console.error('Error fetching users:', error);
//     res.status(500).send('Error fetching users');
//   }
// };

// Fetch a particular user by clerkId
// const getUserById = async (req, res) => {
//   const { clerkId } = req.params;

//   try {
//     // Fetch user from Clerk
//     const clerkUser = await clerkClient.users.getUser(clerkId);

//     // Fetch custom data from MongoDB
//     const mongoUser = await User.findOne({ clerkId }).populate('orders addresses');

//     // Combine Clerk data with MongoDB data
//     const user = {
//       id: clerkUser.id,
//       name: clerkUser.firstName + ' ' + clerkUser.lastName,
//       email: clerkUser.emailAddresses[0]?.emailAddress,
//       addresses: mongoUser?.addresses || [],
//       orders: mongoUser?.orders || [],
//       createdAt: clerkUser.createdAt,
//     };

//     res.status(200).json(user);
//   } catch (error) {
//     console.error('Error fetching user:', error);
//     res.status(404).send('User not found');
//   }
// };

module.exports = {
  getUserProfile,
  updateUserProfile,
  getUsers, 
  getUserById,
  registerUser,
  requestPasswordReset
};
