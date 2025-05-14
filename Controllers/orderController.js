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

    // Check user existence
    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ success: false, message: 'User not found. Please register.' });

    // Check product existence
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

    const savedOrder = await newOrder.save();

    // Populate user and product data
    const populatedOrder = await Order.findById(savedOrder._id)
      .populate('userId', 'name email') // Only return name and email of user
      .populate('productId', 'name price'); // Only return name and price of product

    res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      orderDetails: {
        orderId: populatedOrder.orderId,
        user: populatedOrder.userId,
        product: populatedOrder.productId,
        shippingAddresses: populatedOrder.shippingAddresses,
        createdAt: populatedOrder.createdAt,
      }
    });
  } catch (error) {
    console.error('Order placement failed:', error);
    res.status(500).json({ success: false, message: 'Server error placing order.' });
  }
};