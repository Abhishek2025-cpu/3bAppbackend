const Category = require('../models/Category');

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

    const images = req.files.map(file => ({
      data: file.buffer,
      contentType: file.mimetype,
    }));

    const categoryId = await generateCategoryId();

    const category = new Category({
      categoryId,
      name,
      images,
      position: position !== undefined ? Number(position) : null
    });

    await category.save();

    res.status(201).json({
      message: '✅ Category created successfully',
      category: {
        ...category.toObject(),
        images: category.images.map(img => ({
          contentType: img.contentType,
          data: img.data.toString('base64')
        }))
      }
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
    let { categoryId } = req.params;
    categoryId = categoryId.trim(); // sanitize input

    // Find category by categoryId (case-sensitive match)
    const category = await Category.findOne({ categoryId: categoryId });

    if (!category) {
      return res.status(404).json({ message: `Category with ID '${categoryId}' not found` });
    }

    // Toggle the inStock value
    category.inStock = !category.inStock;
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
