const express = require('express');
const {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  updateAttendance,
  updateGrades,
  deleteStudent
} = require('../controllers/studentController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { validateStudentInput } = require('../middleware/validationMiddleware');
const { uploadProfilePhoto } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.route('/').get(getStudents).post(roleMiddleware('admin'), uploadProfilePhoto.single('profilePhoto'), validateStudentInput, createStudent);
router
  .route('/:id')
  .get(getStudentById)
  .put(roleMiddleware('admin'), uploadProfilePhoto.single('profilePhoto'), validateStudentInput, updateStudent)
  .delete(roleMiddleware('admin'), deleteStudent);
router.patch('/:id/attendance', roleMiddleware('teacher'), updateAttendance);
router.patch('/:id/grades', roleMiddleware('teacher'), updateGrades);

module.exports = router;
