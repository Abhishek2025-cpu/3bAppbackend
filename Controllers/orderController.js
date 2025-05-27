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
    const { userId, shippingAddressId, items } = req.body;

    // 1. Get User and selected shipping address
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const shippingAddress = user.shippingAddresses.id(shippingAddressId);
    if (!shippingAddress) {
      return res.status(404).json({ success: false, message: 'Shipping address not found' });
    }

    // 2. Process items and deduct stock
    const products = await Promise.all(
      items.map(async item => {
        const product = await Product.findById(item.productId);
        if (!product) throw new Error('Product not found');

        if (product.quantity < item.quantity) {
          throw new Error(`Insufficient stock for product: ${product.name}`);
        }

        product.quantity -= item.quantity;
        if (product.quantity <= 0) {
          product.quantity = 0;
          product.available = false;
        }
        await product.save();

        return {
          productId: product._id,
          quantity: item.quantity,
          color: item.color || 'Not specified',
          priceAtPurchase: item.price, // 💡 Trusting frontend-provided price
          orderId: generateOrderId()
        };
      })
    );

    // 3. Create new order
    const newOrder = new Order({
      userId,
      products,
      shippingDetails: {
        name: shippingAddress.name,
        phone: shippingAddress.phone,
        addressType: shippingAddress.addressType,
        detailedAddress: shippingAddress.detailedAddress
      },
      orderId: generateOrderId(),
      currentStatus: "Pending",
      tracking: [{
        status: "Pending",
        updatedAt: new Date()
      }]
    });

    await newOrder.save();

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: newOrder
    });

  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({
      success: false,
      message: 'Server error placing order.',
      error: error.message
    });
  }
};





exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'name email number') // Include phone number
      .populate('products.productId', 'name price dimensions discount');

    const formattedOrders = orders.map(order => ({
      ...order.toObject(),
      totalAmount: order.products.reduce((sum, item) => sum + (item.priceAtPurchase * item.quantity), 0)
    }));

    res.status(200).json({
      success: true,
      count: formattedOrders.length,
      orders: formattedOrders
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
      .populate('userId', 'name email number')
      .populate('products.productId', 'name price dimensions discount');

    if (!orders.length) {
      return res.status(404).json({ success: false, message: 'No orders found for this user.' });
    }

    const formattedOrders = orders.map(order => ({
      ...order.toObject(),
      totalAmount: order.products.reduce((sum, item) => sum + (item.priceAtPurchase * item.quantity), 0)
    }));

    res.status(200).json({
      success: true,
      count: formattedOrders.length,
      orders: formattedOrders
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ success: false, message: 'Server error fetching user orders.', error: error.message });
  }
};



exports.updateProductOrderStatus = async (req, res) => {
  const { productOrderId, newStatus } = req.body; // renamed orderId => productOrderId for clarity

  if (!productOrderId || !newStatus) {
    return res.status(400).json({ success: false, message: 'productOrderId and newStatus are required.' });
  }

  const validStatuses = ['Pending', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
  if (!validStatuses.includes(newStatus)) {
    return res.status(400).json({ success: false, message: 'Invalid status provided.' });
  }

  try {
    // Find the order containing the product with productOrderId
    const order = await Order.findOne({ 'products.orderId': productOrderId });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Product order not found.' });
    }

    // Find the product subdocument
    const product = order.products.find(p => p.orderId === productOrderId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found in order.' });
    }

    // Update product-level tracking and currentStatus
    product.currentStatus = newStatus;
    product.tracking.push({ status: newStatus, updatedAt: new Date() });

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Product order status updated successfully.',
      productOrderId: product.orderId,
      currentStatus: product.currentStatus,
      trackingHistory: product.tracking
    });
  } catch (error) {
    console.error('Error updating product order status:', error);
    res.status(500).json({ success: false, message: 'Server error updating status.', error: error.message });
  }
};



