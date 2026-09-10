const Product = require('../models/Product');
const User = require('../models/User');
const products = require('../data/products');

async function bootstrapData() {
    await User.updateMany(
        { role: { $exists: false } },
        { $set: { role: 'customer', wishlist: [] } }
    );
    await User.updateMany(
        { wishlist: { $exists: false } },
        { $set: { wishlist: [] } }
    );

    const existingProducts = await Product.find({}).lean();
    const byId = new Map(existingProducts.map((product) => [product.id, product]));
    const operations = [];

    for (const source of products) {
        const existing = byId.get(source.id);
        if (!existing) {
            operations.push({ insertOne: { document: source } });
            continue;
        }

        const patch = {};
        if (!existing.description && source.description) patch.description = source.description;
        if (!Number.isFinite(existing.rating)) patch.rating = source.rating;
        if (!existing.color && source.color) patch.color = source.color;
        if (!Array.isArray(existing.keyword) || !existing.keyword.length) patch.keyword = source.keyword;
        if (!Array.isArray(existing.instock_size) || !existing.instock_size.length) patch.instock_size = source.instock_size;
        if (!Array.isArray(existing.inventory) || !existing.inventory.length) {
            patch.inventory = source.inventory;
            patch.stock = source.stock;
        } else if (!Number.isFinite(existing.stock)) {
            patch.stock = existing.inventory.reduce((sum, slot) => sum + Math.max(0, Number(slot.quantity) || 0), 0);
        }

        if (Object.keys(patch).length) {
            operations.push({ updateOne: { filter: { id: source.id }, update: { $set: patch } } });
        }
    }

    if (operations.length) {
        await Product.bulkWrite(operations, { ordered: false });
        console.log(`Catalog bootstrap applied ${operations.length} compatibility updates.`);
    }
}

module.exports = bootstrapData;
