const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  number: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  role: { type: String, default: "client" },
  profileImage: { type: String, default: null } // base64 string, optional
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
