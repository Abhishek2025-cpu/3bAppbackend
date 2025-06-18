const generateProductPDFBuffer = require('../utils/generateProductPDF');
const generateQRCodeBase64 = require('../utils/generateQRCode');
const QRCode = require('qrcode');
const path = require('path');

const Product = require('../models/Product');
const Category = require('../models/Category');
const { uploadBufferToGCS } = require('../utils/gcsUploader');

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
      position,
      colorPrice // expecting a JSON string
    } = req.body;

    const category = await Category.findOne({ categoryId });
    if (!category) {
      return res.status(400).json({ success: false, message: '❌ Invalid categoryId' });
    }

    const imageFiles = req.files?.images || [];
    const colorImages = req.files?.colorImages || [];

    // ✅ File size validation (limit: 100MB)
    const limitMB = 100;
    for (const file of [...imageFiles, ...colorImages]) {
      if (file.size > limitMB * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: `❌ File size exceeds ${limitMB}MB limit: ${file.originalname}`
        });
      }
    }

    // Upload main product images to GCS
    const uploadedImages = await Promise.all(
      imageFiles.map(file =>
        uploadBufferToGCS(file.buffer, file.originalname, 'products')
      )
    );

    // Price processing
    const priceArr = price.split(',').map(p => Number(p));
    const discountValue = Number(discount) || 0;
    const discountedPrices = priceArr.map(p =>
      Number((p - (p * discountValue / 100)).toFixed(2))
    );

    // Process colorPrice JSON
    let parsedColorPrice = [];
    let discountedColorPrice = [];

    if (colorPrice) {
      const colorPriceArr = JSON.parse(colorPrice);
      for (let i = 0; i < colorPriceArr.length; i++) {
        const { color, price } = colorPriceArr[i];
        let image = null;

        if (colorImages && colorImages[i]) {
          image = await uploadBufferToGCS(colorImages[i].buffer, colorImages[i].originalname, 'color-images');
        }

        parsedColorPrice.push({ color, price: Number(price), image });
        discountedColorPrice.push({
          color,
          price: Number((price - (price * discountValue / 100)).toFixed(2)),
          image
        });
      }
    }

    // Create product object (before saving PDF/QR)
    const newProduct = new Product({
      productId,
      categoryId: category._id,
      name,
      description,
      modelNumbers: modelNumbers ? modelNumbers.split(',') : [],
      dimensions: dimensions ? dimensions.split(',') : [],
      colors: colors ? colors.split(',') : [],
      price: priceArr,
      discount: discountValue,
      discountedPrice: discountedPrices,
      available: typeof available === 'string' ? available.trim().toLowerCase() === 'true' : Boolean(available),
      position: Number(position) || 0,
      quantity: quantity !== undefined ? Number(quantity) : 0,
      images: uploadedImages,
      colorPrice: parsedColorPrice,
      discountedColorPrice
    });

    await newProduct.save(); // Save first to get _id for filenames

    // ✅ Generate PDF and upload to GCS
    const pdfBuffer = await generateProductPDFBuffer(newProduct);
    const pdfGcsResult = await uploadBufferToGCS(
      pdfBuffer,
      `product-pdfs/${newProduct._id}.pdf`,
      'application/pdf'
    );

    // ✅ Generate QR Code buffer from PDF URL
    const qrBuffer = await QRCode.toBuffer(pdfGcsResult.url, { type: 'png' });

    // ✅ Upload QR Code to GCS
    const qrUploadResult = await uploadBufferToGCS(
      qrBuffer,
      `product-qrcodes/${newProduct._id}.png`,
      'image/png'
    );

    // ✅ Save URLs to product
    newProduct.pdfUrl = pdfGcsResult.url;
    newProduct.qrCodeUrl = qrUploadResult.url;
    await newProduct.save();

    // ✅ Send response
    res.status(201).json({
      success: true,
      message: '✅ Product created with QR code and PDF',
      product: newProduct,
      qrCodeUrl: newProduct.qrCodeUrl,
      pdfUrl: newProduct.pdfUrl
    });
  } catch (error) {
    console.error('❌ Create product error:', error);
    res.status(500).json({ success: false, message: '❌ Failed to create product', error: error.message });
  }
};

// Get All Products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ position: 1 });

    const categoryCounts = await Product.aggregate([
      { $group: { _id: "$categoryId", count: { $sum: "$quantity" } } }
    ]);

    const categoryCountMap = {};
    categoryCounts.forEach(cat => {
      categoryCountMap[cat._id] = cat.count;
    });

    const result = products.map(prod => {
      // Calculate global discounted prices
      let discountedPrices = [];
      if (!isNaN(prod.discount) && prod.discount > 0) {
        discountedPrices = prod.price.map(p =>
          Number((p - (p * prod.discount / 100)).toFixed(3))
        );
      } else {
        discountedPrices = [...prod.price];
      }

      // Apply discount to colorPrice items
      const discountedColorPrice = (prod.colorPrice || []).map(cp => {
        const discounted = !isNaN(prod.discount) && prod.discount > 0
          ? Number((cp.price - (cp.price * prod.discount / 100)).toFixed(3))
          : cp.price;

        return {
          color: cp.color,
          originalPrice: cp.price,
          discountedPrice: discounted,
          image: cp.image || null
        };
      });

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
        colorPrice: discountedColorPrice,
        discount: prod.discount,
        available: prod.available,
        position: prod.position,
        images: prod.images.map(img => ({
          url: img.url,
          public_id: img.public_id
        })),
        productQuantity: prod.quantity || 0,
        categoryTotalQuantity: categoryCountMap[prod.categoryId] || 0,
        pdfUrl: prod.pdfUrl || null,
        qrCodeUrl: prod.qrCodeUrl || null
      };
    });

    res.status(200).json({ success: true, products: result });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '❌ Failed to fetch products',
      error: error.message
    });
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


exports.getProductById = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findOne({ productId });

    if (!product) {
      return res.status(404).json({ success: false, message: '❌ Product not found' });
    }

    const discountedPrices = (!isNaN(product.discount) && product.discount > 0)
      ? product.price.map(p => Number((p - (p * product.discount / 100)).toFixed(3)))
      : [...product.price];

    const discountedColorPrice = (product.colorPrice || []).map(cp => {
      const discounted = !isNaN(product.discount) && product.discount > 0
        ? Number((cp.price - (cp.price * product.discount / 100)).toFixed(3))
        : cp.price;

      return {
        color: cp.color,
        originalPrice: cp.price,
        discountedPrice: discounted
      };
    });

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
        discountedPrice: discountedPrices,
        colorPrice: discountedColorPrice,
        colorImages: product.colorImages || [],
        discount: product.discount,
        available: product.available,
        position: product.position,
        images: product.images
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: '❌ Failed to fetch product',
      error: error.message
    });
  }
};


// Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findOne({ productId });
    if (!product) {
      return res.status(404).json({ success: false, message: '❌ Product not found' });
    }

    // Delete images from Cloudinary
    for (const img of product.images || []) {
      if (img.public_id) {
        await cloudinary.uploader.destroy(img.public_id);
      }
    }

    await Product.deleteOne({ productId });

    res.status(200).json({ success: true, message: '✅ Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ success: false, message: '❌ Failed to delete product', error: error.message });
  }
};
