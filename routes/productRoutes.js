const express = require('express');
const router = express.Router();
const { createProduct, toggleAvailability } = require('../Controllers/productController');
const { uploadProd } = require('../middleware/upload');

router.post('/add-product', uploadProd.array('images', 5), createProduct);
router.patch('/toggle-product/:productId', toggleAvailability);

module.exports = router;

