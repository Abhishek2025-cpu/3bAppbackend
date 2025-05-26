// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../Controllers/productController');
const { uploadProduct } = require('../middleware/upload');

// Accept both images and models fields
router.post(
  '/add-products',
  uploadProduct.fields([
    { name: 'images', maxCount: 10 },
    { name: 'models', maxCount: 5 },
  ]),
  productController.createProduct
);

router.get('/get-products', productController.getProducts);
router.get('/get-product/:productId', productController.getProductById);
router.put('/update-product/:productId', uploadProduct.fields([
  { name: 'images', maxCount: 10 },
  { name: 'models', maxCount: 5 },
]), productController.updateProduct);
router.put('/toggle-product/:productId', productController.toggleProductAvailability);

module.exports = router;
