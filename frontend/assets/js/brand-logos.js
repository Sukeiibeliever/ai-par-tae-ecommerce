var NaNbBrandLogos = (function () {
    var LOGO_MAP = {
        nike: 'https://cdn.simpleicons.org/nike/111111',
        adidas: 'https://cdn.simpleicons.org/adidas/111111',
        jordan: 'https://cdn.simpleicons.org/nike/111111',
        'new-balance': 'https://cdn.simpleicons.org/newbalance/111111',
        asics: 'assets/images/asics.png',
        yeezy: 'https://cdn.simpleicons.org/adidas/111111',
        'local-brand': 'assets/images/NaNb.svg',
        'nike-sb': 'https://cdn.simpleicons.org/nike/111111',
    };

    function getUrl(slug) {
        return LOGO_MAP[String(slug || '').toLowerCase()] || null;
    }

    function getInitials(label) {
        return String(label || '')
            .split(/\s+/)
            .map(function (part) { return part[0]; })
            .join('')
            .slice(0, 3)
            .toUpperCase();
    }

    return {
        getUrl: getUrl,
        getInitials: getInitials
    };
})();
