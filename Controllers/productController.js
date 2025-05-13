const Product = require('../models/Product');

async function generateProductId() {
  const last = await Product.findOne().sort({ createdAt: -1 });
  if (!last) return 'PROD001';

  const lastNum = parseInt(last.productId.replace('PROD', '')) + 1;
  return `PROD${String(lastNum).padStart(3, '0')}`;
}

exports.createProduct = async (req, res) => {
  try {
    const {
      categoryId,
      name,
      description,
      modelNumbers,
      dimensions,
      colors,
      images, // base64 image strings
      price,
      discount,
    } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' });
    }

    const productId = await generateProductId();

    const product = new Product({
      productId,
      categoryId,
      name,
      description,
      modelNumbers: JSON.parse(modelNumbers || '[]'),
      dimensions: JSON.parse(dimensions || '[]'),
      colors: JSON.parse(colors || '[]'),
      images, // Already base64
      price,
      discount
    });

    await product.save();
    res.status(201).json({ message: 'Product added', product });

  } catch (error) {
    res.status(500).json({ message: 'Product creation failed', error: error.message });
  }
};

exports.toggleAvailability = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findOne({ productId });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.available = !product.available;
    await product.save();

    res.status(200).json({ message: 'Availability updated', available: product.available });
  } catch (error) {
    res.status(500).json({ message: 'Error toggling availability', error: error.message });
  }
};

// ✅ Optional: Get all products with images
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch products', error: err.message });
  }
};
