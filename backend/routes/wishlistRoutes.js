const express = require('express');
const wishlistController = require('../controllers/wishlistController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(requireAuth);
router.get('/', wishlistController.getWishlist);
router.post('/:productId', wishlistController.addWishlist);
router.delete('/:productId', wishlistController.removeWishlist);
router.patch('/:productId/alert', wishlistController.updateAlert);
module.exports = router;
