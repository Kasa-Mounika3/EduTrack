const express = require('express');
const {
  createStudent,
  deleteStudent,
  getStudentById,
  getStudents,
  updateAttendance,
  updateGrades,
  updateStudent
} = require('../controllers/studentController');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const { validateStudent } = require('../middleware/validationMiddleware');
const { uploadProfilePhoto } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect);

router.route('/').get(getStudents).post(authorize('admin'), uploadProfilePhoto.single('profilePhoto'), validateStudent, createStudent);
router
  .route('/:id')
  .get(getStudentById)
  .put(authorize('admin'), uploadProfilePhoto.single('profilePhoto'), validateStudent, updateStudent)
  .delete(authorize('admin'), deleteStudent);
router.patch('/:id/attendance', authorize('teacher'), updateAttendance);
router.patch('/:id/grades', authorize('teacher'), updateGrades);

module.exports = router;
