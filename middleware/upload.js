const multer = require('multer');
const path = require('path');

// Storage for category images
const catStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/catImgs/');
  },
  filename: (req, file, cb) => {
    cb(null, `cat_${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Storage for product images
const prodStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/productImgs/');
  },
  filename: (req, file, cb) => {
    cb(null, `prod_${Date.now()}${path.extname(file.originalname)}`);
  },
});

const uploadCat = multer({ storage: catStorage });
const uploadProd = multer({ storage: prodStorage });

module.exports = { uploadCat, uploadProd };
