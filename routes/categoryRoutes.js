const express = require('express');
const router = express.Router();

// Correctly importing the full controller object
const categoryController = require('../Controllers/categoryController');

// Import the multer middleware for category image upload
const { uploadCat } = require('../middleware/upload');

// POST route to add a new category with image upload
router.post('/add-category', uploadCat.single('image'), categoryController.createCategory);

module.exports = router;
