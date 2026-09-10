const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema(
    {
        className: { type: String, required: true },
        label: { type: String, required: true }
    },
    { _id: false }
);

const inventorySchema = new mongoose.Schema(
    {
        size: { type: String, required: true },
        quantity: { type: Number, required: true, min: 0, default: 0 }
    },
    { _id: false }
);

const productSchema = new mongoose.Schema(
    {
        id: { type: Number, required: true, unique: true },
        name: { type: String, required: true, trim: true },
        brand: { type: String, required: true, trim: true },
        brandSlug: { type: String, required: true, trim: true },
        category: { type: String, required: true, trim: true },
        price: { type: Number, required: true, min: 0 },
        image: { type: String, required: true },
        description: { type: String, default: '' },
        rating: { type: Number, min: 0, max: 5, default: 4 },
        color: { type: String, default: '' },
        keyword: { type: [String], default: [] },
        instock_size: { type: [String], default: [] },
        inventory: { type: [inventorySchema], default: [] },
        stock: { type: Number, min: 0, default: 0 },
        badge: badgeSchema,
        sections: { type: [String], default: ['grid'] },
        tag: String,
        isLocal: { type: Boolean, default: false },
        popularity: { type: Number, default: 0 },
        createdAt: { type: Date, required: true }
    },
    {
        id: false,
        versionKey: false
    }
);

productSchema.index({ category: 1, brandSlug: 1, price: 1, popularity: -1 });
productSchema.index({ name: 'text', brand: 'text', description: 'text', keyword: 'text' });

module.exports = mongoose.model('Product', productSchema);
