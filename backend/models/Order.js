const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
    {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        productId: { type: Number, required: true },
        name: { type: String, required: true },
        brand: { type: String, default: '' },
        category: { type: String, default: 'sneakers' },
        image: { type: String, default: '' },
        selectedSize: { type: String, default: '' },
        quantity: { type: Number, required: true, min: 1, max: 10 },
        unitPrice: { type: Number, required: true, min: 0 },
        originalPrice: { type: Number, required: true, min: 0 },
        negotiated: { type: Boolean, default: false }
    },
    { _id: false }
);

const orderSchema = new mongoose.Schema(
    {
        orderId: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        status: {
            type: String,
            enum: ['Pending', 'Accepted', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
            default: 'Pending',
            index: true
        },
        acceptedAt: { type: Date, default: null },
        estimatedArrivalAt: { type: Date, default: null },
        cancelledAt: { type: Date, default: null },
        cancellationMessage: { type: String, default: '', trim: true, maxlength: 240 },
        adminHidden: { type: Boolean, default: false, index: true },
        stockRestored: { type: Boolean, default: false },
        items: { type: [orderItemSchema], required: true },
        customer: {
            name: { type: String, required: true, trim: true },
            phone: { type: String, required: true, trim: true },
            address: { type: String, required: true, trim: true }
        },
        payment: {
            method: { type: String, enum: ['KPay', 'Wave Money', 'COD', 'Bank Transfer'], required: true },
            note: { type: String, default: '', trim: true, maxlength: 200 },
            status: { type: String, enum: ['Pending', 'Submitted', 'Paid', 'Failed', 'Refunded'], default: 'Pending' }
        },
        promoCode: { type: String, default: '', uppercase: true, trim: true },
        subtotal: { type: Number, required: true, min: 0 },
        discount: { type: Number, default: 0, min: 0 },
        appraisalFee: { type: Number, default: 15000, min: 0 },
        grandTotal: { type: Number, required: true, min: 0 },
        item: { type: String, required: true },
        brand: { type: String, default: '' },
        category: { type: String, default: 'sneakers' },
        price: { type: Number, required: true, min: 0 },
        grade: { type: String, default: '' },
        detail: { type: String, default: '' }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

orderSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
