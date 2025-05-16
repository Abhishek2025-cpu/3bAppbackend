const multer = require('multer');
const path = require('path');
const fs = require('fs');


// Use memory storage for saving image in MongoDB
const storage = multer.memoryStorage();

const uploadCat = multer({ storage });
const uploadProduct = multer({storage});
const uploadPrifle = multer({ storage });

module.exports = { uploadCat,uploadProduct,uploadPrifle };
