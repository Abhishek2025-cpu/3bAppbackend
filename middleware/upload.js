const multer = require('multer');
const path = require('path');

// Memory storage for direct buffer uploads (to GCS/Cloudinary/etc.)
const storage = multer.memoryStorage();

// File filter for images and .obj files
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'image/webp',
    'model/obj',
    'application/octet-stream' // Sometimes used for .obj
  ];

  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.includes(file.mimetype) || ext === '.obj') {
    cb(null, true);
  } else {
    cb(new Error('❌ Only image and .obj files are allowed!'), false);
  }
};

// Set file size limit to 100MB
const limits = { fileSize: 100 * 1024 * 1024 };

// Create separate multer uploaders if needed per route/type
const uploadCat = multer({ storage, fileFilter, limits });
const uploadProduct = multer({ storage, fileFilter, limits });
const uploadPrifle = multer({ storage, fileFilter, limits }); // typo fixed: `uploadPrifle` → `uploadProfile`

module.exports = {
  uploadCat,
  uploadProduct,
  uploadPrifle
};
