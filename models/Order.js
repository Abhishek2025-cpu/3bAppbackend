const mongoose = require('mongoose');

const trackingSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  updatedAt: { type: Date, default: Date.now }
});

const shippingSchema = new mongoose.Schema({
  name: String,
  phone: String,
  state: String,
  city: String,
  pinCode: String,
  address: String,
  country: { type: String, default: null },
  landmark: { type: String, default: null },
  addressType: {
    type: String,
    enum: ['Home', 'Work', 'Custom'],
    default: 'Home'
  }
});

const orderedProductSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  orderId: { type: String, required: true }, // unique per product
  quantity: { type: Number, required: true },
  priceAtPurchase: { type: Number, required: true },
  currentStatus: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  tracking: [trackingSchema]
});

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  products: [orderedProductSchema],
  orderId: { type: String }, // shared parent order ID if needed
  shippingDetails: [shippingSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
