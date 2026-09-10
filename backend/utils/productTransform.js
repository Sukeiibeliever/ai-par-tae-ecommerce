const config = require('../config');

function slugify(text) {
    return String(text || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '')
        .replace(/^-+|-+$/g, '');
}

function parsePrice(price) {
    if (typeof price === 'number') return price;
    return parseInt(String(price).replace(/[^\d]/g, ''), 10) || 0;
}

function parseId(id) {
    if (typeof id === 'number') return id;
    return parseInt(String(id), 10) || 0;
}

function transformProduct(raw) {
    const brands = Array.isArray(raw.brand) ? raw.brand : [raw.brand];
    const brand = String(brands.filter(Boolean)[0] || 'NaNb');
    const brandSlug = slugify(brands[0] || brand);
    const price = parsePrice(raw.price);
    const rating = Number(raw.rating) || 4;
    const sizes = Array.isArray(raw.instock_size) ? raw.instock_size.filter(Boolean).map(String) : [];
    const stockPerSize = config.defaultStockPerSize;
    const inventory = sizes.map((size) => ({ size, quantity: stockPerSize }));
    const hypeBrands = ['jordan', 'nike', 'adidas', 'yeezy', 'travisscott', 'supreme', 'bape'];
    const isLocal = price < 300000 && !hypeBrands.some((name) => slugify(brand).includes(name));

    return {
        id: parseId(raw.id),
        name: String(raw.name || '').trim(),
        brand,
        brandSlug,
        category: String(raw.category || 'sneakers').trim(),
        price,
        image: String(raw.image || '').includes('/') ? String(raw.image) : `assets/images/${raw.image}`,
        description: String(raw.description || ''),
        rating,
        color: String(raw.color || ''),
        keyword: Array.isArray(raw.keyword) ? raw.keyword.map(String) : [],
        instock_size: sizes,
        inventory,
        stock: inventory.reduce((sum, slot) => sum + slot.quantity, 0),
        sections: price >= 500000 && rating >= 4.8 ? ['grid', 'promotions'] : ['grid'],
        isLocal,
        popularity: Math.round(rating * 20),
        createdAt: new Date('2026-01-01')
    };
}

function transformProducts(products) {
    return products.map(transformProduct).filter((product) => product.id > 0 && product.name && product.price >= 0);
}

module.exports = { transformProduct, transformProducts };
