// controllers/orderController.js
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

const generateOrderId = (userId, productId) => {
  const timePart = Date.now().toString().slice(-6); // last 6 digits of timestamp
  const shortUser = userId.toString().slice(-4);
  const shortProd = productId.toString().slice(-4);
  return `ORD#-${shortUser}-${shortProd}-${timePart}`;
};

exports.placeOrder = async (req, res) => {
  try {
    const { userId, items, shippingAddresses } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Product list is required.' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const productIds = items.map(i => i.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length !== productIds.length) {
      return res.status(400).json({ success: false, message: 'Invalid product(s) found.' });
    }

    const orderedProducts = products.map(prod => {
      const item = items.find(i => i.productId === prod._id.toString());
      const quantity = item?.quantity || 1;

      return {
        productId: prod._id,
        orderId: generateOrderId(user._id, prod._id),
        quantity,
        priceAtPurchase: prod.price
      };
    });

    const newOrder = new Order({
      userId,
      products: orderedProducts,
      shippingDetails: shippingAddresses,
      tracking: [{ status: 'Pending' }],
      currentStatus: 'Pending'
    });

    const saved = await newOrder.save();

    const populated = await Order.findById(saved._id)
      .populate('userId', 'name email')
      .populate('products.productId', 'name price');

    res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      order: {
        user: populated.userId,
        products: populated.products,
        shippingAddresses: populated.shippingDetails,
        tracking: populated.tracking,
        createdAt: populated.createdAt
      }
    });

  } catch (err) {
    console.error('Order placement error:', err);
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

