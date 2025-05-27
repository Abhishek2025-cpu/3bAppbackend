const Cart = require('../models/Cart');
const Favorite = require('../models/Favorite');
const Product = require('../models/Product');

// Add item to cart (create cart if not exists)
exports.addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity = 1, selectedColor, selectedModelNumber } = req.body;
    
    if (!userId || !productId) {
      return res.status(400).json({ success: false, message: 'UserId and productId required' });
    }

    // Check product exists
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    // Find user cart or create
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Check if product already in cart (optionally check selectedColor or modelNumber if needed)
    const existingItemIndex = cart.items.findIndex(item =>
      item.product.toString() === productId &&
      item.selectedColor === selectedColor &&
      item.selectedModelNumber === selectedModelNumber
    );

    if (existingItemIndex > -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({ product: productId, quantity, selectedColor, selectedModelNumber });
    }

    await cart.save();

    res.status(200).json({ success: true, message: 'Item added to cart', cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to add to cart', error: error.message });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { userId, productId } = req.body;
    if (!userId || !productId) {
      return res.status(400).json({ success: false, message: 'UserId and productId required' });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    cart.items = cart.items.filter(item => item.product.toString() !== productId);

    await cart.save();

    res.status(200).json({ success: true, message: 'Item removed from cart', cart });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to remove from cart', error: error.message });
  }
};

// Get user's cart
exports.getCart = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'UserId required' });
    }

    const cart = await Cart.findOne({ userId }).populate('items.product');

    if (!cart) return res.status(200).json({ success: true, items: [] });

    res.status(200).json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get cart', error: error.message });
  }
};

// Add product to favorites
exports.addToFavorite = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({ success: false, message: 'UserId and productId required' });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    let favorite = await Favorite.findOne({ userId });
    if (!favorite) {
      favorite = new Favorite({ userId, products: [] });
    }

    if (!favorite.products.includes(productId)) {
      favorite.products.push(productId);
      await favorite.save();
    }

    res.status(200).json({ success: true, message: 'Added to favorites', favorite });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add to favorite', error: error.message });
  }
};

// Remove product from favorites
exports.removeFromFavorite = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({ success: false, message: 'UserId and productId required' });
    }

    const favorite = await Favorite.findOne({ userId });
    if (!favorite) {
      return res.status(404).json({ success: false, message: 'Favorites not found' });
    }

    favorite.products = favorite.products.filter(pId => pId.toString() !== productId);
    await favorite.save();

    res.status(200).json({ success: true, message: 'Removed from favorites', favorite });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to remove from favorite', error: error.message });
  }
};

// Get user's favorites
exports.getFavorites = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'UserId required' });
    }

    const favorite = await Favorite.findOne({ userId }).populate('products');

    if (!favorite) return res.status(200).json({ success: true, products: [] });

    res.status(200).json({ success: true, favorite });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get favorites', error: error.message });
  }
};
