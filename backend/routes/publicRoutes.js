const express = require('express');
const publicController = require('../controllers/publicController');
const createRateLimiter = require('../middleware/rateLimit');

const router = express.Router();
const newsletterLimiter = createRateLimiter({ windowMs: 60 * 60 * 1000, max: 20, message: 'Too many subscription requests. Please try again later.' });
const contactLimiter = createRateLimiter({ windowMs: 60 * 60 * 1000, max: 10, message: 'Too many messages sent. Please try again later.' });

router.post('/newsletter', newsletterLimiter, publicController.subscribeNewsletter);
router.post('/contact', contactLimiter, publicController.contact);

module.exports = router;
