const express = require('express');
const orderController = require('../controllers/orderController');
const { requireAuth } = require('../middleware/authMiddleware');
const createRateLimiter = require('../middleware/rateLimit');

const router = express.Router();
const checkoutLimiter = createRateLimiter({ windowMs: 60 * 1000, max: 10, message: 'Too many checkout attempts. Please wait a moment.' });

router.use(requireAuth);
router.get('/', orderController.getOrders);
router.post('/checkout', checkoutLimiter, orderController.checkout);
router.get('/:orderId', orderController.trackOrder);

module.exports = router;
