// models/Dimension.js
const mongoose = require('mongoose');

const dimensionSchema = new mongoose.Schema({
  value: { type: String, required: true, unique: true }
}, { timestamps: true });

module.exports = mongoose.model('Dimension', dimensionSchema);
