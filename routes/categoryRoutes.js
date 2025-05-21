const express = require('express');
const router = express.Router();
const categoryController = require('../Controllers/categoryController');
const { uploadCat } = require('../middleware/upload');

router.post('/add-category', uploadCat.array('images'), categoryController.createCategory);

router.get('/get-categories', categoryController.getCategories);
router.put('/update-categories/:categoryId', uploadCat.array('images'), categoryController.updateCategory);
router.delete('/delete-categories/:categoryId', categoryController.deleteCategory);
router.put('/toggle-stock/:id', categoryController.toggleCategoryStock);

module.exports = router;



