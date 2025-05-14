// controllers/orderController.js
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

const generateOrderId = () => {
  const randomNum = Math.floor(100000000000 + Math.random() * 900000000000);
  return '#3b' + randomNum.toString().slice(0, 10);
};

exports.placeOrder = async (req, res) => {
  try {
    const { userId, productId, shippingAddresses } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ success: false, message: 'User not found. Please register.' });

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) return res.status(400).json({ success: false, message: 'Product not found.' });

    // Validate shippingAddresses
    if (!Array.isArray(shippingAddresses) || shippingAddresses.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one shipping address is required.' });
    }

    const orderId = generateOrderId();

    const newOrder = new Order({
      orderId,
      userId,
      productId,
      shippingAddresses,
    });

    await newOrder.save();

    res.status(201).json({ success: true, message: 'Order placed successfully.', orderId });
  } catch (error) {
    console.error('Order placement failed:', error);
    res.status(500).json({ success: false, message: 'Server error placing order.' });
  }
};
