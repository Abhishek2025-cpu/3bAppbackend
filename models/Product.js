const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  name: { type: String, required: true },
  description: String,
  modelNumbers: [String],
  dimensions: [String],

  // Updated colors structure: each color has its own price & images
  colors: [
    {
      colorName: { type: String, required: true },
      price: { type: [Number], required: true }, // [original, discounted]
      images: [
        {
          url: String,
          public_id: String
        }
      ]
    }
  ],

  discount: { type: Number, default: 0 },
  available: { type: Boolean, default: true },
  quantity: { type: Number, required: true, default: 0 },
  position: { type: Number, default: 0 },

  models: [ 
    {
      url: String,
      public_id: String,
      format: String
    }
  ],

}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
