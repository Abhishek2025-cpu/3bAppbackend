const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  number: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  role: { type: String, default: "client" }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

