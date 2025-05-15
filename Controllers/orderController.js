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
    const { userId, productIds, shippingAddresses } = req.body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one product must be selected.' });
    }

    // Check user existence
    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ success: false, message: 'User not found. Please register.' });

    // Check product existence
    const products = await Product.find({ _id: { $in: productIds } });
    if (products.length !== productIds.length) {
      return res.status(400).json({ success: false, message: 'One or more products not found.' });
    }

    // Validate shippingAddresses
    if (!Array.isArray(shippingAddresses) || shippingAddresses.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one shipping address is required.' });
    }

    const orderId = generateOrderId();

    const newOrder = new Order({
      orderId,
      userId,
      productIds,
      shippingDetails: shippingAddresses,
      tracking: [{ status: 'Pending' }],
      currentStatus: 'Pending'
    });

    const savedOrder = await newOrder.save();

    const populatedOrder = await Order.findById(savedOrder._id)
      .populate('userId', 'name email')
      .populate('productIds', 'name price');

    res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      orderDetails: {
        orderId: populatedOrder.orderId,
        user: populatedOrder.userId,
        products: populatedOrder.productIds,
        shippingAddresses: populatedOrder.shippingDetails,
        tracking: populatedOrder.tracking,
        createdAt: populatedOrder.createdAt
      }
    });
  } catch (error) {
    console.error('Order placement failed:', error);
    res.status(500).json({ success: false, message: 'Server error placing order.' });
  }
};




exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 }) // latest orders first
      .populate('userId', 'name email phone')
      .populate('productId', 'name price dimensions discount');

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, message: 'Server error fetching orders.' });
  }
};


// controllers/orderController.js

exports.getOrdersByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email phone')
      .populate('productId', 'name price dimensions discount');

    if (!orders.length) {
      return res.status(404).json({ success: false, message: 'No orders found for this user.' });
    }

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ success: false, message: 'Server error fetching user orders.' });
  }
};

