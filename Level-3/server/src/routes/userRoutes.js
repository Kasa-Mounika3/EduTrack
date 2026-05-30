const express = require('express');
const {
  changePassword,
  getMyProfile,
  getUsers,
  updateMyProfile
} = require('../controllers/userController');
const protect = require('../middleware/authMiddleware');
const { uploadProfilePhoto } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect);
router.get('/me', getMyProfile);
router.put('/me', uploadProfilePhoto.single('profilePhoto'), updateMyProfile);
router.patch('/me/password', changePassword);
router.get('/', getUsers);

module.exports = router;
