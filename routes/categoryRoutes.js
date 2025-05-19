const express = require('express');
const router = express.Router();
const categoryController = require('../Controllers/categoryController');
const { uploadCat } = require('../middleware/upload');

router.post('/add-category', uploadCat.array('image'), categoryController.createCategory);
router.get('/get-categories', categoryController.getCategories);
router.put('/update-categories/:categoryId', uploadCat.array('images'), categoryController.updateCategory);
router.delete('/delete-categories/:categoryId', categoryController.deleteCategory);

module.exports = router;
const express = require('express');

const categoryController = require('../Controllers/categoryController');
const { uploadCat } = require('../middleware/upload');

/**
 * Category Routes
 */

/**
 * Create a new category
 */
router.post('/add-category', uploadCat.array('image'), categoryController.createCategory);

/**
 * Get all categories
 */
router.get('/get-categories', categoryController.getCategories);

/**
 * Update a category
 */
router.put('/update-categories/:categoryId', uploadCat.array('images'), categoryController.updateCategory);

/**
 * Delete a category
 */
router.delete('/delete-categories/:categoryId', categoryController.deleteCategory);

module.exports = router;