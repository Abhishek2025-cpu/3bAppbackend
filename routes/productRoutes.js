const express = require('express');
const router = express.Router();
const productController = require('../Controllers/productController');

// Accept JSON body directly with base64 images
router.post('/add-product', productController.createProduct);
router.patch('/toggle-product/:productId', productController.toggleAvailability);
router.get('/products', productController.getProducts);

module.exports = router;
