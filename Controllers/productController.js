const Product = require('../models/Product');
const cloudinary = require('../utils/cloudinary');
const streamifier = require('streamifier');
const Category = require('../models/Category');
const path = require('path'); 

const uploadObjToCloudinary = (fileBuffer, fileName) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'models', resource_type: 'raw', public_id: fileName },
      (err, result) => {
        if (err) return reject(err);
        resolve({
          url: result.secure_url,
          public_id: result.public_id,
          format: result.format
        });
      }
    );
    stream.end(fileBuffer);
  });
};
// Create Product
exports.createProduct = async (req, res) => {
  try {
    const {
      productId,
      categoryId,
      name,
      description,
      modelNumbers,
      dimensions,
      colors,
      price,
      discount,
      available,
      quantity,
      position
    } = req.body;

    // 🔍 Find the category by its string ID
    const category = await Category.findOne({ categoryId });
    if (!category) return res.status(400).json({ success: false, message: 'Invalid categoryId provided' });

    // 🖼️ Upload images
    const uploadedImages = await Promise.all(
      req.files.map(file =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream({ folder: 'products' }, (err, result) => {
            if (err) return reject(err);
            resolve({
              url: result.secure_url,
              public_id: result.public_id,
            });
          });
          stream.end(file.buffer);
        })
      )
    );

    // Parse price array and discount
    const priceArr = price.split(',').map(p => Number(p));
    const discountValue = Number(discount);

    // Calculate discounted prices up to 3 decimal digits
    let discountedPrices = [];
    if (!isNaN(discountValue) && discountValue > 0) {
      discountedPrices = priceArr.map(p =>
        Number((p - (p * discountValue / 100)).toFixed(3))
      );
    } else {
      discountedPrices = [...priceArr];
    }

    const objFiles = req.files.filter(file => path.extname(file.originalname).toLowerCase() === '.obj');
const uploadedModels = await Promise.all(
  objFiles.map(file => uploadObjToCloudinary(file.buffer, path.parse(file.originalname).name))
);

    const newProduct = new Product({
      productId,
      categoryId: category._id,
      models: uploadedModels,
      name,
      description,
      modelNumbers: modelNumbers ? modelNumbers.split(',') : [],
      dimensions: dimensions ? dimensions.split(',') : [],
      colors: colors ? colors.split(',') : [],
      price: priceArr,
      discount: discountValue,
      available: available !== undefined ? available : true,
      position: Number(position) || 0,
       quantity: quantity !== undefined ? Number(quantity) : 0,
      images: uploadedImages
    });

    await newProduct.save();

    res.status(201).json({
      success: true,
      message: '✅ Product created successfully',
      product: {
        ...newProduct.toObject(),
        price: priceArr,
        discountedPrice: discountedPrices
      }
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ success: false, message: '❌ Failed to create product', error: error.message });
  }
};

// Get All Products (sorted by position)
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ position: 1 });

    // Aggregate sum of quantity for each categoryId (string)
    const categoryCounts = await Product.aggregate([
      { $group: { _id: "$categoryId", count: { $sum: "$quantity" } } }
    ]);
    // Convert to a lookup object for quick access
    const categoryCountMap = {};
    categoryCounts.forEach(cat => {
      categoryCountMap[cat._id] = cat.count;
    });

    const result = products.map(prod => {
      // Calculate discounted prices
      let discountedPrices = [];
      if (!isNaN(prod.discount) && prod.discount > 0) {
        discountedPrices = prod.price.map(p =>
          Number((p - (p * prod.discount / 100)).toFixed(3))
        );
      } else {
        discountedPrices = [...prod.price];
      }

      return {
        _id: prod._id,
        productId: prod.productId,
        categoryId: prod.categoryId,
        name: prod.name,
        description: prod.description,
        modelNumbers: prod.modelNumbers,
        dimensions: prod.dimensions,
        colors: prod.colors,
        price: prod.price,
        discountedPrice: discountedPrices,
        discount: prod.discount,
        available: prod.available,
        position: prod.position,
        images: prod.images.map(img => ({
          url: img.url,
          public_id: img.public_id
        })),
        productQuantity: prod.quantity || 0, // Each product's quantity
        categoryTotalQuantity: categoryCountMap[prod.categoryId] || 0 // Total quantity for this category
      };
    });

    res.status(200).json({ success: true, products: result });
  } catch (error) {
    res.status(500).json({ success: false, message: '❌ Failed to fetch products', error: error.message });
  }
};


// Get Product by Unique ID
exports.getProductById = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findOne({ productId });

    if (!product) {
      return res.status(404).json({ success: false, message: '❌ Product not found' });
    }

    res.status(200).json({
      success: true,
      product: {
        productId: product.productId,
        categoryId: product.categoryId,
        name: product.name,
        description: product.description,
        modelNumbers: product.modelNumbers,
        dimensions: product.dimensions,
        colors: product.colors,
        price: product.price,
        discount: product.discount,
        available: product.available,
        position: product.position,
        images: product.images
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: '❌ Failed to fetch product', error: error.message });
  }
};

// Update Product (with image replacement)
exports.updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const updateFields = req.body;

    const product = await Product.findOne({ productId });
    if (!product) {
      return res.status(404).json({ success: false, message: '❌ Product not found' });
    }

    // If new images uploaded, delete old ones and upload new
    if (req.files && req.files.length > 0) {
      // Delete existing images
      for (const img of product.images) {
        if (img.public_id) {
          await cloudinary.uploader.destroy(img.public_id);
        }
      }

      // Upload new images
      const uploadedImages = await Promise.all(req.files.map(file => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream({ folder: 'products' }, (error, result) => {
            if (error) return reject(error);
            resolve({ url: result.secure_url, public_id: result.public_id });
          });
          streamifier.createReadStream(file.buffer).pipe(stream);
        });
      }));

      updateFields.images = uploadedImages;
    }

    if (updateFields.price) {
      updateFields.price = updateFields.price.split(',').map(Number);
    }

    if (updateFields.modelNumbers) {
      updateFields.modelNumbers = updateFields.modelNumbers.split(',');
    }

    if (updateFields.dimensions) {
      updateFields.dimensions = updateFields.dimensions.split(',');
    }

    if (updateFields.colors) {
      updateFields.colors = updateFields.colors.split(',');
    }

    if (updateFields.position !== undefined) {
      updateFields.position = Number(updateFields.position);
    }

    const updatedProduct = await Product.findOneAndUpdate(
      { productId },
      { $set: updateFields },
      { new: true }
    );

    res.status(200).json({ success: true, message: '✅ Product updated', product: updatedProduct });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ success: false, message: '❌ Failed to update product', error: error.message });
  }
};
// Toggle Product Availability
exports.toggleProductAvailability = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findOne({ productId });
    if (!product) {
      return res.status(404).json({ success: false, message: '❌ Product not found' });
    }

    product.available = !product.available;
    await product.save();

    res.status(200).json({
      success: true,
      message: `✅ Product availability toggled to ${product.available ? 'Available' : 'Unavailable'}`,
      available: product.available
    });
  } catch (error) {
    console.error('Toggle availability error:', error);
    res.status(500).json({ success: false, message: '❌ Failed to toggle availability', error: error.message });
  }
};
