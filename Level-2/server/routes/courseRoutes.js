const express = require('express');
const {
  getCourses,
  createCourse,
  getCourseStudents
} = require('../controllers/courseController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { validateCourseInput } = require('../middleware/validationMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.route('/').get(getCourses).post(roleMiddleware('admin'), validateCourseInput, createCourse);
router.get('/:id/students', getCourseStudents);

module.exports = router;
