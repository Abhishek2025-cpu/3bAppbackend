// File: routes/productRoutes.js

const express = require('express');
const router = express.Router();

// ✅ Import the entire controller correctly
const productController = require('../Controllers/productController');

// ✅ Multer middleware for product image uploads
const { uploadProd } = require('../middleware/upload');

// ✅ POST route to add a product with up to 5 images (stored in uploads/productImgs)
router.post('/add-product', uploadProd.array('images', 5), productController.createProduct);

// ✅ PATCH route to toggle availability of a product by productId
router.patch('/toggle-product/:productId', productController.toggleAvailability);

module.exports = router;
