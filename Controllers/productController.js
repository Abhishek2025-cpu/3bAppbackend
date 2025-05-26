const Product = require('../models/Product');
const cloudinary = require('../utils/cloudinary');
const streamifier = require('streamifier');
const Category = require('../models/Category');
const path = require('path'); 
const { uploadToGCS } = require('../utils/gcsUploader');


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
    const { name, description, category, colors } = req.body;

    let parsedColors;
    try {
      parsedColors = JSON.parse(colors); // Must be a JSON string
    } catch {
      return res.status(400).json({ success: false, message: "Invalid colors JSON format" });
    }

    // Group uploaded files by color (e.g. 'color_Red_0')
    const colorImageMap = {};
    (req.files || []).forEach(file => {
      const match = file.fieldname.match(/^color_(\w+)_\d+$/); // e.g., color_Red_0
      if (match) {
        const color = match[1];
        if (!colorImageMap[color]) colorImageMap[color] = [];
        colorImageMap[color].push(file);
      }
    });

    const colorVariants = await Promise.all(
      parsedColors.map(async (item) => {
        const { colorName, price } = item;
        const priceArr = price.split(",").map(p => parseFloat(p.trim()));

        const uploadedImages = await Promise.all(
          (colorImageMap[colorName] || []).map(file =>
            new Promise((resolve, reject) => {
              const uploadStream = cloudinary.uploader.upload_stream(
                { folder: "products/colors" },
                (err, result) => {
                  if (err) return reject(err);
                  resolve({
                    url: result.secure_url,
                    public_id: result.public_id
                  });
                }
              );
              uploadStream.end(file.buffer);
            })
          )
        );

        return {
          colorName,
          price: priceArr,
          images: uploadedImages
        };
      })
    );

    const product = new Product({
      name,
      description,
      category,
      colorVariants
    });

    await product.save();

    res.status(201).json({ success: true, message: "Product created", data: product });
  } catch (err) {
    console.error("CREATE ERROR:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};



// Get All Products (sorted by position)
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ position: 1 });

    const categoryCounts = await Product.aggregate([
      { $group: { _id: "$categoryId", count: { $sum: "$quantity" } } }
    ]);

    const categoryCountMap = {};
    categoryCounts.forEach(cat => {
      categoryCountMap[cat._id.toString()] = cat.count;
    });

    const result = products.map(prod => {
      return {
        _id: prod._id,
        productId: prod.productId,
        categoryId: prod.categoryId,
        name: prod.name,
        description: prod.description,
        modelNumbers: prod.modelNumbers,
        dimensions: prod.dimensions,
        discount: prod.discount,
        available: prod.available,
        position: prod.position,
        productQuantity: prod.quantity || 0,
        categoryTotalQuantity: categoryCountMap[prod.categoryId.toString()] || 0,

        // Safely map colors
        colors: (prod.colors || []).map(color => {
          const [original = 0, discounted = 0] = color.price || [];

          return {
            colorName: color.colorName,
            price: {
              original,
              discounted
            },
            images: (color.images || []).map(img => ({
              url: img.url,
              public_id: img.public_id
            }))
          };
        }),

        models: (prod.models || []).map(model => ({
          url: model.url,
          public_id: model.public_id,
          format: model.format
        }))
      };
    });

    res.status(200).json({ success: true, products: result });

  } catch (error) {
    console.error('❌ Error in getProducts:', error);
    res.status(500).json({
      success: false,
      message: '❌ Failed to fetch products',
      error: error.message
    });
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
//push code deleted
