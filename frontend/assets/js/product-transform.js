var NaNbProductTransform = (function () {
    function slugify(text) {
        return String(text)
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
        var brand = Array.isArray(raw.brand) ? raw.brand[0] : raw.brand;
        var brandSlug = slugify(brand);
        var price = parsePrice(raw.price);
        var rating = raw.rating || 4;
        var hypeBrands = ['jordan', 'nike', 'adidas', 'yeezy', 'travisscott', 'supreme', 'bape'];
        var isLocal = price < 300000 && !hypeBrands.some(function (name) {
            return brandSlug.indexOf(name) !== -1;
        });

        return {
            id: parseId(raw.id),
            name: raw.name,
            brand: brand,
            brandSlug: brandSlug,
            category: raw.category,
            price: price,
            image: raw.image.indexOf('/') !== -1 ? raw.image : 'assets/images/' + raw.image,
            description: raw.description || '',
            rating: rating,
            color: raw.color || '',
            keyword: Array.isArray(raw.keyword) ? raw.keyword.slice() : [],
            instock_size: Array.isArray(raw.instock_size) ? raw.instock_size.slice() : [],
            stock: Array.isArray(raw.instock_size) ? raw.instock_size.length * 5 : 0,
            sections: price >= 500000 && rating >= 4.8 ? ['grid', 'promotions'] : ['grid'],
            isLocal: isLocal,
            popularity: Math.round(rating * 20),
            createdAt: '2026-01-01'
        };
    }

    function transformProducts(products) {
        return products.map(transformProduct).filter(function (product) {
            return product.id > 0;
        });
    }

    return {
        transformProducts: transformProducts
    };
})();
