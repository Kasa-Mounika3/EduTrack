const express = require('express');
const {
  createCourse,
  getCourseStudents,
  getCourses
} = require('../controllers/courseController');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const { validateCourse } = require('../middleware/validationMiddleware');

const router = express.Router();

router.use(protect);

router.route('/').get(getCourses).post(authorize('admin'), validateCourse, createCourse);
router.get('/:id/students', getCourseStudents);

module.exports = router;
