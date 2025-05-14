const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true },
  categoryId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String },
  modelNumbers: [String],
  dimensions: [String],
  images: [String], // base64 images
  colors: [String],
  price: { type: [Number], required: true }, // ✅ array: [original, discounted]
  discount: { type: Number, default: 0 },
  available: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
