const express = require('express');
const {
  getTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher
} = require('../controllers/teacherController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { uploadProfilePhoto } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.route('/').get(roleMiddleware('admin'), getTeachers).post(roleMiddleware('admin'), uploadProfilePhoto.single('profilePhoto'), createTeacher);
router
  .route('/:id')
  .put(roleMiddleware('admin'), uploadProfilePhoto.single('profilePhoto'), updateTeacher)
  .delete(roleMiddleware('admin'), deleteTeacher);

module.exports = router;
