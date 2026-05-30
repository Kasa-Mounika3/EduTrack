const express = require('express');
const { getMessages } = require('../controllers/messageController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.get('/', getMessages);

module.exports = router;
