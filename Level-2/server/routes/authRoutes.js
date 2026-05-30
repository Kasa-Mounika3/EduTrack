const express = require('express');
const {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  changePassword,
  logoutUser
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { uploadProfilePhoto } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', authMiddleware, logoutUser);
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, uploadProfilePhoto.single('profilePhoto'), updateProfile);
router.patch('/profile/password', authMiddleware, changePassword);

module.exports = router;
