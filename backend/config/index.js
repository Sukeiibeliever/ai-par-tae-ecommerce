const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const corsOrigins = String(process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

module.exports = {
    port: Number(process.env.PORT) || 5000,
    mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nanb',
    frontendPath: path.join(__dirname, '../../frontend'),
    authSecret: process.env.AUTH_SECRET || 'nanb-local-development-secret-change-me',
    authTokenHours: Math.max(1, Number(process.env.AUTH_TOKEN_HOURS) || 24),
    corsOrigins,
    admin: {
        username: String(process.env.ADMIN_USERNAME || 'admin').trim().toLowerCase(),
        email: String(process.env.ADMIN_EMAIL || 'admin@nanb.local').trim().toLowerCase(),
        password: String(process.env.ADMIN_PASSWORD || '')
    },
    defaultStockPerSize: Math.max(1, Number(process.env.DEFAULT_STOCK_PER_SIZE) || 5)
};
