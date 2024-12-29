const asyncHandler = require('express-async-handler');
const Coupon = require('../models/coupon.model');

// Get all coupons (Admin only)
const getAllCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({});
  res.json(coupons);
});

// Apply a coupon (Public route, no authentication)
const applyCoupon = asyncHandler(async (req, res) => {
  const { code, totalAmount } = req.body;

  const coupon = await Coupon.findOne({ code });

  if (coupon) {
    const currentDate = new Date();

    // Check if coupon is active and not expired
    if (!coupon.isActive) {
      return res.status(400).json({ message: 'Coupon is not active' });
    }
    
    if (coupon.expirationDate < currentDate) {
      return res.status(400).json({ message: 'Coupon has expired' });
    }
    
    // Check if minimum purchase amount is met
    if (totalAmount < coupon.minimumPurchaseAmount) {
      return res.status(400).json({ message: `Minimum purchase of $${coupon.minimumPurchaseAmount} required` });
    }

    // Calculate the discount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (totalAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else if (coupon.discountType === 'fixed') {
      discountAmount = coupon.discountValue;
      if (discountAmount > totalAmount) {
        discountAmount = totalAmount; // Cannot exceed total
      }
    }

    return res.json({ discountAmount });
  } else {
    res.status(404);
    throw new Error('Coupon not found');
  }
});


// Create a new coupon (Admin only)
const createCoupon = asyncHandler(async (req, res) => {
  const couponData = {
    ...req.body,
  };

  const coupon = new Coupon(couponData);

  const createdCoupon = await coupon.save();
  res.status(201).json(createdCoupon);
});


// Update a coupon (Admin only)
const updateCoupon = asyncHandler(async (req, res) => {
  const { code, discount, expiresAt } = req.body;

  const coupon = await Coupon.findById(req.params.id);

  if (coupon) {
    coupon.code = code || coupon.code;
    coupon.discount = discount || coupon.discount;
    coupon.expiresAt = expiresAt || coupon.expiresAt;

    const updatedCoupon = await coupon.save();
    res.json(updatedCoupon);
  } else {
    res.status(404);
    throw new Error('Coupon not found');
  }
});


const deleteCoupon = asyncHandler(async (req, res) => {
  console.log(`Attempting to delete coupon with ID: ${req.params.id}`);

  try {
    const coupon = await Coupon.findById(req.params.id);

    if (coupon) {
      await coupon.deleteOne();
      console.log(`Coupon with ID: ${req.params.id} removed successfully`);
      res.json({ message: 'Coupon removed' });
    } else {
      console.error(`Coupon with ID: ${req.params.id} not found`);
      res.status(404);
      throw new Error('Coupon not found');
    }
  } catch (error) {
    console.error(`Error deleting coupon: ${error.message}`);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


module.exports = {
  getAllCoupons,
  applyCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
};
