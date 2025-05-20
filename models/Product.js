const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true },
  categoryId: { type: String, required: true },
  name: { type: String, required: true },
  description: String,
  modelNumbers: [String],
  dimensions: [String],
  images: [{
    url: String,
    public_id: String
  }],
  colors: [String],
  price: { type: [Number], required: true }, // [original, discounted]
  discount: { type: Number, default: 0 },
  available: { type: Boolean, default: true },
  position: { type: Number, default: 0 } // 🆕 position key
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
