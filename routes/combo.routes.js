const express = require('express');
const router = express.Router();
const {createCombo, getCombos, getComboById, updateCombo, deleteCombo} = require('../controllers/combo.controller'); 

// Define routes
router.post('/', createCombo); // Create a new combo
router.get('/', getCombos); // Get all combos
router.get('/:id', getComboById); // Get a single combo by ID
router.put('/:id', updateCombo); // Update a combo
router.delete('/:id', deleteCombo); // Delete a combo

module.exports = router;
