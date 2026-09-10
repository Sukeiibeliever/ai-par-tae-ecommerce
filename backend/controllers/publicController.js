const NewsletterSubscriber = require('../models/NewsletterSubscriber');
const ContactMessage = require('../models/ContactMessage');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.subscribeNewsletter = async (req, res) => {
    try {
        const email = String(req.body && req.body.email || '').toLowerCase().trim();
        if (!EMAIL_PATTERN.test(email)) {
            return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
        }
        const existing = await NewsletterSubscriber.findOne({ email });
        if (existing) {
            return res.status(200).json({ success: true, alreadySubscribed: true, message: 'This email is already subscribed.' });
        }
        await NewsletterSubscriber.create({ email });
        res.status(201).json({ success: true, alreadySubscribed: false, message: "Thanks! You'll be notified about future drops." });
    } catch (error) {
        console.error(error);
        if (error && error.code === 11000) {
            return res.status(200).json({ success: true, alreadySubscribed: true, message: 'This email is already subscribed.' });
        }
        res.status(500).json({ success: false, message: 'Could not subscribe right now' });
    }
};

exports.contact = async (req, res) => {
    try {
        const name = String(req.body && req.body.name || '').trim();
        const email = String(req.body && req.body.email || '').toLowerCase().trim();
        const subject = String(req.body && req.body.subject || '').trim();
        const message = String(req.body && req.body.message || '').trim();

        if (name.length < 2 || name.length > 80) return res.status(400).json({ success: false, message: 'Enter a valid name' });
        if (!EMAIL_PATTERN.test(email)) return res.status(400).json({ success: false, message: 'Enter a valid email address' });
        if (!subject || subject.length > 160) return res.status(400).json({ success: false, message: 'Enter a valid subject' });
        if (!message || message.length > 4000) return res.status(400).json({ success: false, message: 'Enter a valid message' });

        await ContactMessage.create({ name, email, subject, message });
        res.status(201).json({ success: true, message: 'Message sent successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Could not send message right now' });
    }
};
