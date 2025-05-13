const express = require('express');
const router = express.Router();
const productController = require('../Controllers/productController');
const { uploadProduct } = require('../middleware/upload');//no s

// Updated to handle multipart/form-data and convert to base64
router.post('/add-product', uploadProduct.array('images'), productController.createProduct);

router.patch('/toggle-product/:productId', productController.toggleAvailability);
router.get('/get-products', productController.getProducts);

module.exports = router;
