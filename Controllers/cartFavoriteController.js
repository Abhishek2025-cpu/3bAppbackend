const Cart = require('../models/Cart');
const Favorite = require('../models/Favorite');
const Product = require('../models/Product');

// Add multiple items to cart (create cart if not exists)
exports.addToCart = async (req, res) => {
  try {
    const { userId, items } = req.body;

    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'UserId and items array required' });
    }

    // Validate all products exist
    for (const item of items) {
      if (!item.productId) {
        return res.status(400).json({ success: false, message: 'Each item must have a productId' });
      }
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.productId}` });
      }
    }

    // Find user cart or create new
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Loop through each item to add or update quantity
    for (const item of items) {
      const { productId, quantity = 1, selectedColor, selectedModelNumber } = item;

      const existingItemIndex = cart.items.findIndex(cartItem =>
        cartItem.product.toString() === productId &&
        cartItem.selectedColor === selectedColor &&
        cartItem.selectedModelNumber === selectedModelNumber
      );

      if (existingItemIndex > -1) {
        // Update quantity of existing item
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        // Add new item to cart
        cart.items.push({ product: productId, quantity, selectedColor, selectedModelNumber });
      }
    }

    await cart.save();

    res.status(200).json({ success: true, message: 'Items added to cart', cart });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to add to cart', error: error.message });
  }
};


// Remove multiple items from cart
// Remove multiple items from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { userId, productIds } = req.body;

    if (!userId || !productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ success: false, message: 'UserId and productIds array required' });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    cart.items = cart.items.filter(item => !productIds.includes(item.product.toString()));

    await cart.save();

    res.status(200).json({ success: true, message: 'Items removed from cart', cart });
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


// Add multiple products to favorites
exports.addToFavorite = async (req, res) => {
  try {
    const { userId, productIds } = req.body;

    if (!userId || !productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ success: false, message: 'UserId and productIds array required' });
    }

    // Verify products exist (optional but recommended)
    const products = await Product.find({ _id: { $in: productIds } });
    if (products.length !== productIds.length) {
      return res.status(404).json({ success: false, message: 'One or more products not found' });
    }

    let favorite = await Favorite.findOne({ userId });
    if (!favorite) {
      favorite = new Favorite({ userId, products: [] });
    }

    // Add only new productIds to favorites
    productIds.forEach(pid => {
      if (!favorite.products.includes(pid)) {
        favorite.products.push(pid);
      }
    });

    await favorite.save();

    res.status(200).json({ success: true, message: 'Added to favorites', favorite });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add to favorite', error: error.message });
  }
};


// Remove multiple products from favorites
exports.removeFromFavorite = async (req, res) => {
  try {
    const { userId, productIds } = req.body;

    if (!userId || !productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ success: false, message: 'UserId and productIds array required' });
    }

    const favorite = await Favorite.findOne({ userId });
    if (!favorite) {
      return res.status(404).json({ success: false, message: 'Favorites not found' });
    }

    favorite.products = favorite.products.filter(pid => !productIds.includes(pid.toString()));

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
