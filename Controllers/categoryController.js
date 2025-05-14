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

    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }

    const imageBuffer = req.file.buffer;
    const contentType = req.file.mimetype;

    const categoryId = await generateCategoryId();

    const category = new Category({
      categoryId,
      name,
      image: {
        data: imageBuffer,
        contentType,
      },
      position: position !== undefined ? Number(position) : null
    });

    await category.save();
    res.status(201).json({ message: 'Category created', category });

  } catch (error) {
    res.status(500).json({ message: 'Category creation failed', error: error.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();

    const updated = categories.map(cat => {
      const base64Image = cat.image?.data
        ? cat.image.data.toString('base64')
        : null;

      return {
        categoryId: cat.categoryId,
        name: cat.name,
        position: cat.position ?? null, // ✅ Add this line to include position
        image: base64Image
          ? {
              contentType: cat.image.contentType,
              data: base64Image,
            }
          : null,
      };
    });

    res.status(200).json(updated); // Send updated array
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch categories', error: error.message });
  }
};

