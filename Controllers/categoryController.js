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

    // Upload all files to Cloudinary
    const uploadedImages = await Promise.all(
      req.files.map(file => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'categories' },
            (error, result) => {
              if (error) return reject(error);
              resolve({
                url: result.secure_url,
                public_id: result.public_id,
              });
            }
          );
          stream.end(file.buffer); // important: pass the file buffer to the stream
        });
      })
    );

    const category = new Category({
      categoryId,
      name,
      images: uploadedImages,
      position: position ? Number(position) : null,
    });

    await category.save();

    res.status(201).json({
      message: '✅ Category created successfully',
      category
    });

  } catch (error) {
    console.error('Category creation error:', error);
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
            url: img.url,
            public_id: img.public_id
          }))
        : []
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

