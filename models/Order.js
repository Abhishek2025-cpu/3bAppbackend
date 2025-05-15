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
  addressType: { type: String, enum: ['Home', 'Work', 'Custom'], default: 'Home' }
});

const orderedProductSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  orderId: { type: String, required: true }, // unique per product
  quantity: { type: Number, required: true },
  priceAtPurchase: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  products: [orderedProductSchema],
  orderId: { type: String }, // removed 'unique: true'
  shippingDetails: [shippingSchema],
  tracking: [trackingSchema],

  currentStatus: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('Order', orderSchema);
