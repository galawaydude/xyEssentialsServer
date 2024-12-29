const mongoose = require('mongoose');
const comboSchema = new mongoose.Schema({
    name: {type: String},
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }],
    combinedPrice: {type: Number}
}, { timestamps: true });

const Combo = mongoose.model('Combo', comboSchema);
module.exports = Combo;
