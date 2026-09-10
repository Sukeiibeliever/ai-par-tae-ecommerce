const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { signToken } = require('../utils/token');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function authResponse(user, message) {
    return {
        success: true,
        message,
        token: signToken({ type: 'auth', userId: String(user._id), role: user.role }),
        user: user.toPublicJSON()
    };
}

exports.login = async (req, res) => {
    try {
        const email = String(req.body && req.body.email || '').toLowerCase().trim();
        const password = String(req.body && req.body.password || '');

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        res.json(authResponse(user, 'Login successful'));
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Login failed' });
    }
};

exports.signup = async (req, res) => {
    try {
        const name = String(req.body && req.body.name || '').trim();
        const email = String(req.body && req.body.email || '').toLowerCase().trim();
        const password = String(req.body && req.body.password || '');

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
        }
        if (name.length < 2 || name.length > 80) {
            return res.status(400).json({ success: false, message: 'Name must be between 2 and 80 characters' });
        }
        if (!EMAIL_PATTERN.test(email)) {
            return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
        }
        if (password.length < 8 || password.length > 128) {
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ success: false, message: 'An account with this email already exists' });
        }

        const user = await User.create({
            name,
            email,
            password: await bcrypt.hash(password, 12),
            role: 'customer'
        });

        res.status(201).json(authResponse(user, 'Account created successfully'));
    } catch (error) {
        console.error(error);
        if (error && error.code === 11000) {
            return res.status(409).json({ success: false, message: 'An account with this email already exists' });
        }
        res.status(500).json({ success: false, message: 'Signup failed' });
    }
};

exports.me = async (req, res) => {
    res.json({ success: true, user: req.user.toPublicJSON() });
};
