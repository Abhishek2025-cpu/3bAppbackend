// controllers/orderController.js
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

const generateOrderId = () => {
  return '#3b' + Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
};


exports.placeOrder = async (req, res) => {
  try {
    const { userId, items, shippingAddresses } = req.body;

    // Validate user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found. Please register.' });
    }

    // Validate items
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No products provided.' });
    }

    const products = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({ success: false, message: `Product with ID ${item.productId} not found.` });
      }

      // Push product info with individual orderId
      products.push({
        productId: item.productId,
        orderId: generateOrderId(),
        quantity: item.quantity,
        priceAtPurchase: product.price // capture price at time of order
      });
    }

    if (!Array.isArray(shippingAddresses) || shippingAddresses.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one shipping address is required.' });
    }

    const newOrder = new Order({
      userId,
      products,
      shippingDetails: shippingAddresses,
      tracking: [{ status: 'Pending' }],
      currentStatus: 'Pending'
    });

    const savedOrder = await newOrder.save();

    const populatedOrder = await Order.findById(savedOrder._id)
      .populate('userId', 'name email phone')
      .populate('products.productId', 'name price');

    res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      order: populatedOrder
    });
  } catch (error) {
    console.error('Order placement failed:', error);
    res.status(500).json({ success: false, message: 'Server error placing order.', error: error.message });
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

