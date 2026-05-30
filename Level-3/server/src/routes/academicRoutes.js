const express = require('express');
const {
  createAcademicYear,
  createDepartment,
  createSection,
  createSubject,
  listAcademicStructure
} = require('../controllers/academicController');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', listAcademicStructure);
router.post('/years', authorize('admin'), createAcademicYear);
router.post('/departments', authorize('admin'), createDepartment);
router.post('/sections', authorize('admin'), createSection);
router.post('/subjects', authorize('admin'), createSubject);

module.exports = router;
