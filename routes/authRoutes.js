const express = require('express');
const router = express.Router();
const { signup, login,updateUser,getUserProfiles } = require('../Controllers/authController');
const { uploadPrifle } = require('../middleware/upload');

router.post('/signup', uploadPrifle.single('profileImage'), signup);
router.put('/update-user/:userId', uploadPrifle.single('profileImage'), updateUser);
router.post('/login', login);


router.get('/get-user-profiles', getUserProfiles);
router.get('/users/:userId', authController.getUserProfileById);

module.exports = router;
