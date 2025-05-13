const express = require('express');
const router = express.Router();
const categoryController = require('../Controllers/categoryController');
const { uploadCat } = require('../middleware/upload');

router.post('/add-category', uploadCat.single('image'), categoryController.createCategory);
router.get('/categories', categoryController.getCategories);

module.exports = router;
