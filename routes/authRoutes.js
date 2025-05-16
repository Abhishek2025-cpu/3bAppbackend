const express = require('express');
const router = express.Router();
const { signup, login,updateUser } = require('../Controllers/authController');
const { uploadPrifle } = require('../middleware/upload');

router.post('/signup', uploadPrifle.single('profileImage'), signup);
router.put('/update-user/:userId', uploadPrifle.single('profileImage'), updateUser);
router.post('/login', login);

module.exports = router;
