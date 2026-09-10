const express = require('express');
const productController = require('../controllers/productController');
const createRateLimiter = require('../middleware/rateLimit');

const router = express.Router();
const bargainLimiter = createRateLimiter({ windowMs: 60 * 1000, max: 20, message: 'Too many bargain attempts. Please try again shortly.' });

router.get('/', productController.getProducts);
router.post('/:id/bargain', bargainLimiter, productController.bargain);
router.get('/:id', productController.getProductById);

module.exports = router;
