const express = require('express');
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');
const createRateLimiter = require('../middleware/rateLimit');

const router = express.Router();
const loginLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10, message: 'Too many login attempts. Please try again later.' });
const signupLimiter = createRateLimiter({ windowMs: 60 * 60 * 1000, max: 8, message: 'Too many signup attempts. Please try again later.' });

router.post('/login', loginLimiter, authController.login);
router.post('/signup', signupLimiter, authController.signup);
router.get('/me', requireAuth, authController.me);

module.exports = router;
