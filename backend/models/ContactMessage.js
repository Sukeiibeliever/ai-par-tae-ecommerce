const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
        email: { type: String, required: true, lowercase: true, trim: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
        subject: { type: String, required: true, trim: true, maxlength: 160 },
        message: { type: String, required: true, trim: true, maxlength: 4000 },
        status: { type: String, enum: ['New', 'Read', 'Closed'], default: 'New' }
    },
    { timestamps: true, versionKey: false }
);

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
