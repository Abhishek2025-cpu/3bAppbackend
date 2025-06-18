// models/Product.js
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
  discountedPrice: [Number],
  colorPrice: [{
    color: String,
    price: Number,
    image: {
      url: String,
      public_id: String
    }
  }],
  discountedColorPrice: [{
    color: String,
    price: Number,
    image: {
      url: String,
      public_id: String
    }
  }],
  pdfUrl: { type: String },
qrCodeUrl: { type: String },

  available: { type: Boolean, default: true },
  quantity: { type: Number, required: true, default: 0 },
  position: { type: Number, default: 0 },
},
 { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
