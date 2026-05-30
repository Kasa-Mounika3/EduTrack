const express = require('express');
const {
  getAnnouncements,
  createAnnouncement
} = require('../controllers/announcementController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.route('/').get(getAnnouncements).post(roleMiddleware('admin', 'teacher'), createAnnouncement);

module.exports = router;
