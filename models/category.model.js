const mongoose = require('mongoose');
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, 
  description: { type: String },
  isActive: { type: Boolean, default: true }, 
  parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },  // For nested categories (optional)
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
