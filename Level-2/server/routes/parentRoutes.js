const express = require('express');
const {
  getParents,
  createParent,
  updateParent,
  deleteParent
} = require('../controllers/parentController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { uploadProfilePhoto } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.route('/').get(roleMiddleware('admin'), getParents).post(roleMiddleware('admin'), uploadProfilePhoto.single('profilePhoto'), createParent);
router
  .route('/:id')
  .put(roleMiddleware('admin'), uploadProfilePhoto.single('profilePhoto'), updateParent)
  .delete(roleMiddleware('admin'), deleteParent);

module.exports = router;
