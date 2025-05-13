const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure directory exists
const ensureDirExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Absolute upload directories
const catDir = path.join(__dirname, '..', 'uploads', 'catImgs');
const prodDir = path.join(__dirname, '..', 'uploads', 'productImgs');

ensureDirExists(catDir);
ensureDirExists(prodDir);

// Category Image Storage
const catStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, catDir);
  },
  filename: (req, file, cb) => {
    cb(null, `cat_${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Product Image Storage
const prodStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, prodDir);
  },
  filename: (req, file, cb) => {
    cb(null, `prod_${Date.now()}${path.extname(file.originalname)}`);
  },
});

const uploadCat = multer({ storage: catStorage });
const uploadProd = multer({ storage: prodStorage });

module.exports = { uploadCat, uploadProd };
