

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure folder exists or create it
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Full absolute paths
const catImgsPath = path.resolve(__dirname, '../uploads/catImgs/');
const prodImgsPath = path.resolve(__dirname, '../uploads/productImgs/');

// Ensure folders exist
ensureDir(catImgsPath);
ensureDir(prodImgsPath);

// Storage for category images
const catStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, catImgsPath);
  },
  filename: (req, file, cb) => {
    cb(null, `cat_${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Storage for product images
const prodStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, prodImgsPath);
  },
  filename: (req, file, cb) => {
    cb(null, `prod_${Date.now()}${path.extname(file.originalname)}`);
  },
});

const uploadCat = multer({ storage: catStorage });
const uploadProd = multer({ storage: prodStorage });

module.exports = { uploadCat, uploadProd };
