const bcrypt = require('bcryptjs');
const User = require('../models/User');
const config = require('../config');

async function bootstrapAdmin() {
    if (!config.admin.password) {
        console.warn('ADMIN_PASSWORD is not configured; admin login will be unavailable.');
        return;
    }

    let admin = await User.findOne({
        $or: [
            { email: config.admin.email },
            { username: config.admin.username }
        ]
    }).select('+password');

    if (!admin) {
        admin = await User.create({
            name: 'NaNb Administrator',
            username: config.admin.username,
            email: config.admin.email,
            password: await bcrypt.hash(config.admin.password, 12),
            role: 'admin'
        });
        console.log(`Admin account created: ${config.admin.username}`);
        return;
    }

    let changed = false;
    if (admin.role !== 'admin') {
        admin.role = 'admin';
        changed = true;
    }
    if (!admin.username) {
        admin.username = config.admin.username;
        changed = true;
    }
    if (changed) await admin.save();
}

module.exports = bootstrapAdmin;
