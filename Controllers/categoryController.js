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
      images: cat.images.map(img => ({
        contentType: img.contentType,
        data: img.data.toString('base64')
      }))
    }));

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: '❌ Failed to fetch categories', error: error.message });
  }
};

