const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  name: { type: String, required: true },
  description: String,
  modelNumbers: [String],
  dimensions: [String],
  images: [{
    url: String,
    public_id: String
  }],
  colors: [String],
  price: { type: [Number], required: true },
  discount: { type: Number, default: 0 },
  discountedPrice: [Number], // keep this
  colorPrice: [{
    color: String,
    price: Number
  }],
  discountedColorPrice: [{
    color: String,
    price: Number
  }],
  available: { type: Boolean, default: true },
  quantity: { type: Number, required: true, default: 0 },
  position: { type: Number, default: 0 }
}, { timestamps: true });
