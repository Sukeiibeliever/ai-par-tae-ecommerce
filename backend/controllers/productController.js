const Product = require('../models/Product');
const { signToken } = require('../utils/token');

function buildProductQuery(filters = {}) {
    const query = {};

    if (filters.category) query.category = filters.category;
    if (filters.brand) query.brandSlug = filters.brand;
    if (filters.section === 'promotions') query.sections = 'promotions';
    if (filters.section === 'local') query.isLocal = true;
    if (filters.search) query.$text = { $search: String(filters.search).trim() };

    const priceLimits = [];
    if (filters.maxPrice && Number.isFinite(Number(filters.maxPrice))) priceLimits.push(Number(filters.maxPrice));
    if (filters.section === 'budget') priceLimits.push(200000);

    if (priceLimits.length) {
        query.price = { $lte: Math.min(...priceLimits) };
    }

    return query;
}

function buildProductSort(sortKey) {
    if (sortKey === 'price_low') return { price: 1 };
    if (sortKey === 'price_high') return { price: -1 };
    if (sortKey === 'newest') return { createdAt: -1 };
    return { popularity: -1, id: 1 };
}

function publicProduct(product) {
    if (!product) return product;
    const copy = { ...product };
    if (Array.isArray(copy.inventory) && copy.inventory.length) {
        copy.instock_size = copy.inventory.filter((slot) => Number(slot.quantity) > 0).map((slot) => slot.size);
        copy.stock = copy.inventory.reduce((sum, slot) => sum + Math.max(0, Number(slot.quantity) || 0), 0);
    }
    delete copy.inventory;
    return copy;
}

exports.getProducts = async (req, res) => {
    try {
        const { category, brand, sort, maxPrice, section, search } = req.query;
        const products = await Product.find(buildProductQuery({ category, brand, maxPrice, section, search }))
            .sort(buildProductSort(sort || 'popular'))
            .lean();

        res.json({ success: true, count: products.length, products: products.map(publicProduct) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to load products' });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const productId = Number(req.params.id);
        const product = Number.isNaN(productId) ? null : await Product.findOne({ id: productId }).lean();

        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        res.json({ success: true, product: publicProduct(product) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to load product' });
    }
};

exports.bargain = async (req, res) => {
    try {
        const productId = Number(req.params.id);
        const offer = Math.round(Number(req.body && req.body.offer));
        if (!Number.isFinite(productId) || !Number.isFinite(offer) || offer <= 0) {
            return res.status(400).json({ success: false, message: 'Enter a valid offer amount' });
        }

        const product = await Product.findOne({ id: productId }).lean();
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        const original = Number(product.price);
        const minimum = Math.round(original * 0.90);
        const counter = Math.round(original * 0.92);
        const discountPercent = ((original - offer) / original) * 100;

        let status;
        let finalPrice;
        if (offer >= minimum && offer <= original) {
            status = 'approved';
            finalPrice = offer;
        } else if (offer > original) {
            status = 'approved';
            finalPrice = original;
        } else if (discountPercent <= 20) {
            status = 'counter';
            finalPrice = counter;
        } else {
            status = 'rejected';
            finalPrice = counter;
        }

        const dealToken = status === 'rejected' ? null : signToken({
            type: 'bargain',
            productId: product.id,
            finalPrice,
            originalPrice: original
        }, 15 * 60);

        res.json({
            success: true,
            status,
            finalPrice,
            originalPrice: original,
            dealToken,
            expiresInMinutes: dealToken ? 15 : 0
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Bargaining service unavailable' });
    }
};
