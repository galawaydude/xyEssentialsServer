const Combo = require('../models/combo.model');
const asyncHandler = require('express-async-handler');

// Create a new combo
exports.createCombo = asyncHandler(async (req, res) => {
    const combo = new Combo(req.body);
    await combo.save();
    res.status(201).json(combo);
});

// Get all combos
exports.getCombos = asyncHandler(async (req, res) => {
    const combos = await Combo.find().populate('products');
    res.json(combos);
});

// Get a single combo by ID
exports.getComboById = asyncHandler(async (req, res) => {
    const combo = await Combo.findById(req.params.id).populate('products');
    if (!combo) return res.status(404).json({ message: 'Combo not found' });
    res.json(combo);
});

// Update a combo
exports.updateCombo = asyncHandler(async (req, res) => {
    const combo = await Combo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!combo) return res.status(404).json({ message: 'Combo not found' });
    res.json(combo);
});

// Delete a combo
exports.deleteCombo = asyncHandler(async (req, res) => {
    const combo = await Combo.findByIdAndDelete(req.params.id);
    if (!combo) return res.status(404).json({ message: 'Combo not found' });
    res.json({ message: 'Combo deleted successfully' });
});
