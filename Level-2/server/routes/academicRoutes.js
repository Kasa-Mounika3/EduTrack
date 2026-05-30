const express = require('express');
const {
  createAcademicYear,
  createDepartment,
  createSection,
  createSubject,
  listAcademicStructure
} = require('../controllers/academicController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', listAcademicStructure);
router.post('/years', roleMiddleware('admin'), createAcademicYear);
router.post('/departments', roleMiddleware('admin'), createDepartment);
router.post('/sections', roleMiddleware('admin'), createSection);
router.post('/subjects', roleMiddleware('admin'), createSubject);

module.exports = router;
