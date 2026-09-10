const mongoose = require('mongoose');

const newsletterSubscriberSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        }
    },
    { timestamps: true, versionKey: false }
);

module.exports = mongoose.model('NewsletterSubscriber', newsletterSubscriberSchema);
