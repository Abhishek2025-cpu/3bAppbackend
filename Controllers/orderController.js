// controllers/orderController.js
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const admin = require('../utils/fcm');

const generateOrderId = () => {
  const prefix = '#3b';
  const random = Math.floor(100000000000 + Math.random() * 900000000000); // 12 digits
  return `${prefix}${random}`;
};

exports.placeOrder = async (req, res) => {
  try {
    const { userId, items, shippingAddresses } = req.body;

// In orderController.js, inside placeOrder
const products = await Promise.all(
  items.map(async item => {
    const product = await Product.findById(item.productId);
    if (!product) throw new Error('Product not found');
    if (product.quantity < item.quantity) throw new Error(`Insufficient stock for product: ${product.name}`);

    // Deduct the ordered quantity
    product.quantity -= item.quantity;
    if (product.quantity <= 0) {
      product.quantity = 0;
      product.available = false;
    }
    await product.save();

    return {
      productId: product._id,
      quantity: item.quantity,
      priceAtPurchase: product.price[0],
      orderId: generateOrderId()
    };
  })
);
    const newOrder = new Order({
      userId,
      products,
      shippingDetails: shippingAddresses,
      orderId: generateOrderId(), // ensure this is not null and unique
      currentStatus: "Pending",
      tracking: [{
        status: "Pending",
        updatedAt: new Date()
      }]
    });

    await newOrder.save();

    res.status(201).json({ success: true, message: "Order placed successfully", order: newOrder });

  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ success: false, message: 'Server error placing order.', error: error.message });
  }
};



exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 }) // latest orders first
      .populate('userId', 'name email phone')
      .populate('products.productId', 'name price dimensions discount');

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, message: 'Server error fetching orders.', error: error.message });
  }
};



// controllers/orderController.js

exports.getOrdersByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email phone')
      .populate('products.productId', 'name price dimensions discount');

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
    res.status(500).json({ success: false, message: 'Server error fetching user orders.', error: error.message });
  }
};


exports.updateProductOrderStatus = async (req, res) => {
  const { orderId, newStatus } = req.body;

  if (!orderId || !newStatus) {
    return res.status(400).json({ success: false, message: 'orderId and newStatus are required.' });
  }

  const validStatuses = ['Pending', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
  if (!validStatuses.includes(newStatus)) {
    return res.status(400).json({ success: false, message: 'Invalid status provided.' });
  }

  try {
    // Find the order that contains the product with the given orderId
    const order = await Order.findOne({ 'products.orderId': orderId });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Product with this orderId not found in any order.' });
    }

    // Find the specific product
    const product = order.products.find(p => p.orderId === orderId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Update tracking and currentStatus
    product.tracking.push({ status: newStatus, updatedAt: new Date() });
    product.currentStatus = newStatus;

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Product order status updated successfully.',
      orderId: product.orderId,
      currentStatus: product.currentStatus,
      trackingHistory: product.tracking
    });
  } catch (error) {
    console.error('Error updating product order status:', error);
    res.status(500).json({ success: false, message: 'Server error updating status.', error: error.message });
  }
};


