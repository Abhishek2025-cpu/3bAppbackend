const Category = require('../models/Category');

async function generateCategoryId() {
  const lastCat = await Category.findOne().sort({ createdAt: -1 });
  if (!lastCat) return 'CAT001';

  const lastNum = parseInt(lastCat.categoryId.replace('CAT', '')) + 1;
  return `CAT${String(lastNum).padStart(3, '0')}`;
}

exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const file = req.file;

    if (!name || !file) {
      return res.status(400).json({ message: 'Name and image are required' });
    }

    const categoryId = await generateCategoryId();

    const category = new Category({
      categoryId,
      name,
      image: {
        data: file.buffer,
        contentType: file.mimetype,
      },
    });

    await category.save();

    res.status(201).json({
      message: 'Category created',
      category: {
        categoryId: category.categoryId,
        name: category.name,
        image: {
          contentType: category.image.contentType,
          data: category.image.data.toString('base64'), // for preview
        },
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating category', error: error.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();

    const updated = categories.map(cat => ({
      categoryId: cat.categoryId,
      name: cat.name,
      image: {
        contentType: cat.image.contentType,
        data: cat.image.data.toString('base64'),
      },
    }));

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get categories', error: error.message });
  }
};
