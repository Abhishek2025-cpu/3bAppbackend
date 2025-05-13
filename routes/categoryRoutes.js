const express = require('express');
const router = express.Router();
const { createCategory } = require('../Controllers/categoryController');
const { uploadCat } = require('../middleware/upload');

router.post('/add-category', uploadCat.single('image'), createCategory);

module.exports = router;
