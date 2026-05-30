const express = require('express');
const {
  createParent,
  deleteParent,
  getParents,
  updateParent
} = require('../controllers/parentController');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const { uploadProfilePhoto } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect);

router.route('/').get(authorize('admin', 'teacher'), getParents).post(authorize('admin'), uploadProfilePhoto.single('profilePhoto'), createParent);
router.route('/:id').put(authorize('admin'), uploadProfilePhoto.single('profilePhoto'), updateParent).delete(authorize('admin'), deleteParent);

module.exports = router;
