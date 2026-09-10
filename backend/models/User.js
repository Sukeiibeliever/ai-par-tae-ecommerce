const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
        username: { type: String, trim: true, lowercase: true, unique: true, sparse: true, maxlength: 40 },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            maxlength: 160,
            match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        },
        password: { type: String, required: true, select: false },
        role: { type: String, enum: ['customer', 'admin'], default: 'customer', index: true },
        wishlist: {
            type: [{
                _id: false,
                productId: { type: Number, required: true },
                alertEnabled: { type: Boolean, default: true }
            }],
            default: []
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

userSchema.methods.toPublicJSON = function toPublicJSON() {
    return {
        id: String(this._id),
        name: this.name,
        email: this.email,
        role: this.role
    };
};

module.exports = mongoose.model('User', userSchema);
