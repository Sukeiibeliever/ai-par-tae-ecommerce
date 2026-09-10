const User = require('../models/User');
const { verifyToken } = require('../utils/token');

async function requireAuth(req, res, next) {
    try {
        const header = String(req.headers.authorization || '');
        const match = header.match(/^Bearer\s+(.+)$/i);
        if (!match) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }

        const payload = verifyToken(match[1], 'auth');
        const user = await User.findById(payload.userId).select('name email username role createdAt');
        if (!user) {
            return res.status(401).json({ success: false, message: 'Account no longer exists' });
        }

        req.user = user;
        req.auth = payload;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Session expired or invalid. Please login again.' });
    }
}

function requireAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    next();
}

module.exports = { requireAuth, requireAdmin };
