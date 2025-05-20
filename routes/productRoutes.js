const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { uploadProduct } = require('../middleware/upload'); // multer config

router.post('/add-product', uploadProduct.array('images'), productController.createProduct);
router.get('/get-products', productController.getProducts);
router.get('/get-product/:productId', productController.getProductById);
router.put('/update-product/:productId', uploadProduct.array('images'), productController.updateProduct);
router.put('/toggle-product/:productId', productController.toggleProductAvailability);


module.exports = router;

