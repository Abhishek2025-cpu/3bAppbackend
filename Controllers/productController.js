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
      price,
      discount
    } = req.body;

    const productId = await generateProductId();

    const images = req.files.map(file => file.filename);

    const product = new Product({
      productId,
      categoryId,
      name,
      description,
      modelNumbers: JSON.parse(modelNumbers || '[]'),
      dimensions: JSON.parse(dimensions || '[]'),
      colors: JSON.parse(colors || '[]'),
      images,
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
