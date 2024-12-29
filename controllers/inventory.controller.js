const asyncHandler = require('express-async-handler');
const Inventory = require('../models/inventory.model');

// Get all inventory items
const getInventory = asyncHandler(async (req, res) => {
  const inventory = await Inventory.find({});
  res.json(inventory);
});

// Get inventory for a specific product
const getProductInventory = asyncHandler(async (req, res) => {
  const inventory = await Inventory.findOne({ product: req.params.productId });

  if (inventory) {
    res.json(inventory);
  } else {
    res.status(404);
    throw new Error('Inventory item not found');
  }
});

// Update inventory stock for a specific product
const updateInventory = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const inventory = await Inventory.findOne({ product: req.params.productId });

  if (inventory) {
    inventory.quantity = quantity || inventory.quantity;

    const updatedInventory = await inventory.save();
    res.json(updatedInventory);
  } else {
    res.status(404);
    throw new Error('Inventory item not found');
  }
});

module.exports = {
  getInventory,
  getProductInventory,
  updateInventory,
};
