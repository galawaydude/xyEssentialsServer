const mongoose = require('mongoose');
const inventorySchema = new mongoose.Schema({
  products: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantityInStock: { type: Number, required: true },
}, { timestamps: true });

const Inventory = mongoose.model('Inventory', inventorySchema);
module.exports = Inventory;
