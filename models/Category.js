// models/Category.js
const mongoose = require('mongoose');
//category schema 
const categorySchema = new mongoose.Schema({
  categoryId: { type: String, required: true, unique: true },
  name: String,
  image: {
    data: Buffer,
    contentType: String,
  },
  position: {
    type: Number,
    default: null, // Optional field
  }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
