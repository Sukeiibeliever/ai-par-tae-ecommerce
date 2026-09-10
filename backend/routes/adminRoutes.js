const express = require('express');
const adminController = require('../controllers/adminController');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');
const createRateLimiter = require('../middleware/rateLimit');

const router = express.Router();
const adminLoginLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 8, message: 'Too many admin login attempts. Please try again later.' });

router.post('/login', adminLoginLimiter, adminController.login);
router.use(requireAuth, requireAdmin);
router.get('/dashboard', adminController.dashboard);
router.patch('/orders/:orderId/status', adminController.updateOrderStatus);
router.patch('/orders/:orderId/accept', adminController.acceptOrder);
router.delete('/orders/:orderId', adminController.deleteOrder);
router.patch('/products/:id', adminController.updateProduct);
router.delete('/newsletter/:id', adminController.deleteSubscriber);
router.get('/contacts', adminController.getContacts);

module.exports = router;
