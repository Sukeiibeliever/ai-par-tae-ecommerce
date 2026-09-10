const express = require('express');
const productRoutes = require('./productRoutes');
const authRoutes = require('./authRoutes');
const orderRoutes = require('./orderRoutes');
const adminRoutes = require('./adminRoutes');
const publicRoutes = require('./publicRoutes');
const wishlistRoutes = require('./wishlistRoutes');

const router = express.Router();
const bargainRoutes = require('./bargainRoutes');

router.get('/health', async (req, res) => {
    const mongoose = require('mongoose');
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? 'connected' : 'disconnected';
    res.status(dbState === 1 ? 200 : 503).json({
        success: dbState === 1,
        message: 'NaNb API is running',
        database: dbStatus
    });
});

router.use('/products', productRoutes);
router.use('/auth', authRoutes);
router.use('/orders', orderRoutes);
router.use('/bargain', bargainRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/admin', adminRoutes);
router.use('/', publicRoutes);

module.exports = router;
