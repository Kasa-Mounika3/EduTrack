const express = require('express');
const { login, profile, register } = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');
const { validateLogin, validateRegister } = require('../middleware/validationMiddleware');

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/profile', protect, profile);

module.exports = router;
