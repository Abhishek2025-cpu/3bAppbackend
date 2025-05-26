const mongoose = require('mongoose');

// Sub-schema for images
const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  public_id: { type: String, required: true }
}, { _id: false });

// Sub-schema for 3D models
const modelSchema = new mongoose.Schema({
  url: { type: String, required: true },
  public_id: { type: String, required: true },
  format: { type: String, required: true }
}, { _id: false });

// Sub-schema for color variants
const colorVariantSchema = new mongoose.Schema({
  colorName: { type: String, required: true },
  price: {
    type: [Number], // e.g., [originalPrice, discountedPrice]
    required: true,
    validate: [arr => arr.length === 2, "Price array must have exactly 2 values"]
  },
  images: {
    type: [imageSchema],
    default: []
  }
}, { _id: false });

// Main product schema
const productSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },

  name: { type: String, required: true },
  description: { type: String },

  modelNumbers: [String],
  dimensions: [String],

  colors: [colorVariantSchema],

  discount: { type: Number, default: 0 },  // Optional, if not using price[1]
  available: { type: Boolean, default: true },
  quantity: { type: Number, default: 0 },

  position: { type: Number, default: 0 },

  models: [modelSchema]

}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
