// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../Controllers/productController');
const { uploadProduct } = require('../middleware/upload');


router.post('/add-products', (req, res, next) => {
  uploadProduct.fields([
    { name: 'images', maxCount: 10 },
    { name: 'colorImages', maxCount: 10 }
  ])(req, res, function (err) {
    if (err instanceof multer.MulterError || err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}, productController.createProduct);


router.get('/get-products', productController.getProducts);
router.get('/get-product/:productId', productController.getProductById);
router.put('/update-product/:productId', uploadProduct.fields([
  { name: 'images', maxCount: 10 },
 
]), productController.updateProduct);
router.put('/toggle-product/:productId', productController.toggleProductAvailability);
router.delete('/delete-product/:productId', productController.deleteProduct);


module.exports = router;
