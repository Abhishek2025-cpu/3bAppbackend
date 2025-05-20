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
    const { name, position } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' });
    }

    const categoryId = await generateCategoryId();

    // Upload each image to Cloudinary
    const uploadedImages = await Promise.all(
      req.files.map(async (file) => {
        const uploadResult = await cloudinary.uploader.upload_stream({ resource_type: 'image' }, async (error, result) => {
          if (error) throw new Error(error.message);
          return result;
        });

        // promisify the stream to wait for result
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream({ folder: 'categories' }, (err, result) => {
            if (err) reject(err);
            else resolve({
              url: result.secure_url,
              public_id: result.public_id,
            });
          });
          stream.end(file.buffer);
        });
      })
    );

    const category = new Category({
      categoryId,
      name,
      images: uploadedImages,
      position: position !== undefined ? Number(position) : null
    });

    await category.save();

    res.status(201).json({
      message: '✅ Category created successfully',
      category
    });

  } catch (error) {
    res.status(500).json({ message: '❌ Category creation failed', error: error.message });
  }
};



exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();

    const updated = categories.map(cat => ({
      categoryId: cat.categoryId,
      name: cat.name,
      position: cat.position ?? null,
      images: Array.isArray(cat.images)
        ? cat.images.map(img => ({
            contentType: img.contentType,
            data: img.data.toString('base64')
          }))
        : []
    }));

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: '❌ Failed to fetch categories', error: error.message });
  }
};

// ...existing code...

// Update Category by categoryId
exports.updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, position } = req.body;
    let updateData = {};

    if (name) updateData.name = name;
    if (position !== undefined) updateData.position = Number(position);

    // If images are uploaded, replace them
    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map(file => ({
        data: file.buffer,
        contentType: file.mimetype,
      }));
    }

    const updatedCategory = await Category.findOneAndUpdate(
      { categoryId },
      { $set: updateData },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json({
      message: '✅ Category updated successfully',
      category: {
        ...updatedCategory.toObject(),
        images: updatedCategory.images.map(img => ({
          contentType: img.contentType,
          data: img.data.toString('base64')
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

