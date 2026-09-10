require('dotenv').config();
const express = require('express');
const cors = require('cors');
const config = require('./config');
const connectDB = require('./config/database');
const apiRoutes = require('./routes');
const bootstrapAdmin = require('./utils/bootstrapAdmin');
const bootstrapData = require('./utils/bootstrapData');

const app = express();
app.disable('x-powered-by');

const corsOptions = {
    origin(origin, callback) {
        if (!origin || !config.corsOrigins.length || config.corsOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Origin not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
});
app.use(express.json({ limit: '256kb' }));
app.use(express.urlencoded({ extended: true, limit: '256kb' }));

app.use('/api', apiRoutes);
app.use(express.static(config.frontendPath));

app.use((req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ success: false, message: 'API route not found' });
    }
    res.status(404).sendFile(require('path').join(config.frontendPath, 'index.html'));
});

app.use((err, req, res, next) => {
    console.error(err);
    if (String(err.message || '').includes('CORS')) {
        return res.status(403).json({ success: false, message: 'Origin not allowed' });
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
});

async function startServer() {
    try {
        await connectDB();
        await bootstrapData();
        await bootstrapAdmin();
        app.listen(config.port, () => {
            console.log(`NaNb server running at http://localhost:${config.port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
}

startServer();
