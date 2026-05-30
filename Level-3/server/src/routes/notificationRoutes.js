const express = require('express');
const {
  createNotification,
  getNotifications,
  markNotificationsRead
} = require('../controllers/notificationController');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);

router.route('/').get(getNotifications).post(authorize('admin', 'teacher'), createNotification);
router.patch('/read', markNotificationsRead);

module.exports = router;
