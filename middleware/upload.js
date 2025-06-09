const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'image/webp',
    'model/obj',
    'application/octet-stream'
  ];

  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.includes(file.mimetype) || ext === '.obj') {
    cb(null, true);
  } else {
    cb(new Error('❌ Only image and .obj files are allowed!'), false);
  }
};

const limits = { fileSize: 100 * 1024 * 1024 };

// ✅ Accept 'images' and 'colorImages' fields as arrays
const uploadProduct = multer({ storage, fileFilter, limits }).fields([
  { name: 'images', maxCount: 10 },
  { name: 'colorImages', maxCount: 10 }
]);

const uploadCat = multer({ storage, fileFilter, limits });
const uploadPrifle = multer({ storage, fileFilter, limits });

module.exports = {
  uploadCat,
  uploadProduct,
uploadPrifle
};






// uploadPrifle