const multer = require('multer');
const path = require('path');

// Accept any file type (for .obj support)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'model/obj', 'application/octet-stream'];
  // Accept .obj files by mimetype or extension
  if (
    allowedTypes.includes(file.mimetype) ||
    path.extname(file.originalname).toLowerCase() === '.obj'
  ) {
    cb(null, true);
  } else {
    cb(new Error('Only images and .obj files are allowed!'), false);
  }
};

const uploadCat = multer({ storage, fileFilter });
const uploadProduct = multer({ storage, fileFilter });
const uploadPrifle = multer({ storage, fileFilter });

module.exports = { uploadCat, uploadProduct, uploadPrifle };
