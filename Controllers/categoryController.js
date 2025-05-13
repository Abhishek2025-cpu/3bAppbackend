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
    const image = req.file ? req.file.filename : null;

    if (!name || !image) {
      return res.status(400).json({ message: 'Name and image are required' });
    }

    const categoryId = await generateCategoryId();
    const category = new Category({ categoryId, name, image });
    await category.save();

    res.status(201).json({ message: 'Category created', category });
  } catch (error) {
    res.status(500).json({ message: 'Category creation failed', error: error.message });
  }
};
