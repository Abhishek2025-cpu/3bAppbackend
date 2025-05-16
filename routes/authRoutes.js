const express = require('express');
const router = express.Router();
const { signup, login } = require('../Controllers/authController');
const { uploadPrifleUpload } = require('../middleware/upload');

router.post('/signup', uploadPrifleUpload.single('profileImage'), signup);
router.put('/update-user/:userId', uploadPrifleUpload.single('profileImage'), updateUser);
router.post('/login', login);

module.exports = router;
