const mongoose = require('mongoose');

const productOrderSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  color: { type: String, default: 'Not specified' },
  priceAtPurchase: { type: Number, required: true },
  orderId: { type: String, required: true, unique: true }, // unique per product in order
  currentStatus: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Pending'
  }
});

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [productOrderSchema],
  shippingDetails: {
    name: String,
    number: String,
    addressType: String,
    detailedAddress: String
  },
  orderId: { type: String, required: true, unique: true }, // order-level id
  currentStatus: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
