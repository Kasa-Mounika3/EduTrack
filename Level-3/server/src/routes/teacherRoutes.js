const express = require('express');
const {
  createTeacher,
  deleteTeacher,
  getTeachers,
  updateTeacher
} = require('../controllers/teacherController');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const { uploadProfilePhoto } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect);

router.route('/').get(authorize('admin', 'teacher'), getTeachers).post(authorize('admin'), uploadProfilePhoto.single('profilePhoto'), createTeacher);
router.route('/:id').put(authorize('admin'), uploadProfilePhoto.single('profilePhoto'), updateTeacher).delete(authorize('admin'), deleteTeacher);

module.exports = router;
