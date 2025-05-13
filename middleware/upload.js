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



// Use memory storage for saving image in MongoDB
const storage = multer.memoryStorage();

const uploadCat = multer({ storage });
const uploadProduct = multer({storage});

module.exports = { uploadCat,uploadProduct };
