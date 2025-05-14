// models/Order.js
const mongoose = require('mongoose');

const ShippingAddressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phoneNo: { type: String, required: true },
  addressLine: { type: String, required: true }, // full address
  state: { type: String, required: true },
  city: { type: String, required: true },
  pincode: { type: String, required: true },
  country: { type: String, default: null },
  landmark: { type: String, default: null },
  addressType: { type: String, enum: ['Work', 'Home', 'Custom'], required: true },
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true, required: true }, // always starts with "3b"
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  shippingAddresses: [ShippingAddressSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', OrderSchema);
