const mongoose = require('mongoose');
const checkoutItemsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  checkoutItems: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
  }],
}, { timestamps: true });

const CheckoutItems = mongoose.model('CheckoutItems', checkoutItemsSchema);
module.exports = CheckoutItems;
