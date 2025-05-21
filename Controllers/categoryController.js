const Category = require('../models/Category');
const mongoose = require('mongoose');
const cloudinary = require('../utils/cloudinary');

async function generateCategoryId() {
  const lastCat = await Category.findOne().sort({ createdAt: -1 });
  if (!lastCat) return 'CAT001';

  const lastNum = parseInt(lastCat.categoryId.replace('CAT', '')) + 1;
  return `CAT${String(lastNum).padStart(3, '0')}`;
}



exports.createCategory = async (req, res) => {
  try {
    console.log("➡️ Received request:", req.body);
    console.log("➡️ Files received:", req.files);

    const { name, position } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' });
    }

    const categoryId = await generateCategoryId();
    console.log("🆔 Generated Category ID:", categoryId);

    const uploadImageToCloudinary = (fileBuffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'categories', resource_type: 'image' },
          (err, result) => {
            if (err) {
              console.error("❌ Cloudinary Upload Error:", err);
              return reject(new Error("Cloudinary error: " + err.message));
            }
            resolve({
              url: result.secure_url,
              public_id: result.public_id,
            });
          }
        );
        stream.end(fileBuffer);
      });
    };

    let uploadedImages = [];
    try {
      uploadedImages = await Promise.all(
        req.files.map(file => uploadImageToCloudinary(file.buffer))
      );
    } catch (uploadError) {
      return res.status(500).json({
        message: '❌ Cloudinary upload failed',
        error: uploadError.message
      });
    }

    const category = new Category({
      categoryId,
      name,
      images: uploadedImages,
      position: position !== undefined ? Number(position) : null,
    });

    await category.save();

    res.status(201).json({
      message: '✅ Category created successfully',
      category
    });

  } catch (error) {
    console.error("❌ Error creating category:", error);
    res.status(500).json({ message: '❌ Category creation failed', error: error.message });
  }
};





exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();

    // Aggregate product counts for each categoryId, only where quantity > 0
    const Product = require('../models/Product');
    const productCounts = await Product.aggregate([
      { $match: { quantity: { $gt: 0 } } }, // Only count products in stock
      { $group: { _id: "$categoryId", count: { $sum: 1 } } }
    ]);
    // Convert to a lookup object for quick access
    const productCountMap = {};
    productCounts.forEach(pc => {
      productCountMap[pc._id?.toString()] = pc.count;
    });

  const updated = categories.map(cat => ({
  _id: cat._id,
  categoryId: cat.categoryId,
  name: cat.name,
  position: cat.position ?? null,
  images: Array.isArray(cat.images)
    ? cat.images.map(img => ({
        url: img.url,
        public_id: img.public_id
      }))
    : [],
  totalProducts: productCountMap[cat.categoryId] || 0 // <-- FIXED: use categoryId string
}));

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: '❌ Failed to fetch categories', error: error.message });
  }
};




exports.updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, position } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (position !== undefined) updateData.position = Number(position);

    const existingCategory = await Category.findOne({ categoryId });

    if (!existingCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // If new images are uploaded
    if (req.files && req.files.length > 0) {
      // Delete old images from Cloudinary
      for (const img of existingCategory.images) {
        if (img.public_id) {
          await cloudinary.uploader.destroy(img.public_id);
        }
      }

      // Upload new images to Cloudinary
      const uploadedImages = await Promise.all(
        req.files.map(file =>
          cloudinary.uploader.upload_stream({
            folder: 'categories',
            resource_type: 'image'
          }, (error, result) => {
            if (error) throw error;
            return {
              url: result.secure_url,
              public_id: result.public_id
            };
          })
        ).map(streamUpload => {
          return new Promise((resolve, reject) => {
            const stream = streamUpload;
            const bufferStream = require('streamifier').createReadStream(file.buffer);
            stream.on('finish', () => resolve(stream));
            bufferStream.pipe(stream);
          });
        })
      );

      updateData.images = uploadedImages;
    }

    const updatedCategory = await Category.findOneAndUpdate(
      { categoryId },
      { $set: updateData },
      { new: true }
    );

    res.status(200).json({
      message: '✅ Category updated successfully',
      category: {
        ...updatedCategory.toObject(),
        images: updatedCategory.images.map(img => ({
          url: img.url,
          public_id: img.public_id
        }))
      }
    });

  } catch (error) {
    res.status(500).json({ message: '❌ Category update failed', error: error.message });
  }
};


// Delete Category by categoryId
exports.deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const deleted = await Category.findOneAndDelete({ categoryId });

    if (!deleted) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json({ message: '✅ Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: '❌ Category deletion failed', error: error.message });
  }
};



exports.toggleCategoryStock = async (req, res) => {
  try {
    let { id } = req.params;
    id = id.trim();

    // Find category ONLY by categoryId field (not _id)
    const category = await Category.findOne({ categoryId: id });

    if (!category) {
      return res.status(404).json({ message: `Category with categoryId '${id}' not found` });
    }

    // Toggle inStock boolean (default true if missing)
    if (typeof category.inStock !== 'boolean') {
      category.inStock = true;
    } else {
      category.inStock = !category.inStock;
    }

    await category.save();

    res.status(200).json({
      message: `Category stock status updated to ${category.inStock ? 'In Stock' : 'Out of Stock'}`,
      inStock: category.inStock
    });
  } catch (error) {
    console.error('Toggle Error:', error.message);
    res.status(500).json({ message: 'Failed to toggle stock status', error: error.message });
  }
};

