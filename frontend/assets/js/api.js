var NaNbApi = (function () {
    var API_BASE = window.NANB_API_BASE || '';
    var SESSION_KEY = 'nanb_session';
    var ADMIN_SESSION_KEY = 'nanb_admin_session';
    var LEGACY_CART_KEY = 'nanb_cart';
    var LEGACY_WISHLIST_KEY = 'nanb_wishlist';
    var LEGACY_ORDERS_KEY = 'nanb_orders';
    var LEGACY_LAST_ORDER_ID_KEY = 'nanb_last_order_id';

    function buildUrl(path, params) {
        var url = API_BASE + path;
        if (params) {
            var qs = new URLSearchParams(params).toString();
            if (qs) url += '?' + qs;
        }
        return url;
    }

    function readJson(storage, key) {
        try {
            var raw = storage.getItem(key);
            return raw ? JSON.parse(raw) : null;
        } catch (error) {
            return null;
        }
    }

    function getSession() {
        return readJson(localStorage, SESSION_KEY) || readJson(sessionStorage, SESSION_KEY);
    }

    function getAdminSession() {
        return readJson(sessionStorage, ADMIN_SESSION_KEY);
    }

    function getToken(scope) {
        var session = scope === 'admin' ? getAdminSession() : getSession();
        return session && session.token ? session.token : '';
    }

    async function request(path, options) {
        options = options || {};
        var scope = options.authScope || 'user';
        var skipAuth = options.skipAuth === true;
        var headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers || {});
        var token = skipAuth ? '' : getToken(scope);
        if (token) headers.Authorization = 'Bearer ' + token;

        var fetchOptions = Object.assign({}, options, { headers: headers });
        delete fetchOptions.authScope;
        delete fetchOptions.skipAuth;

        var response;
        try {
            response = await fetch(buildUrl(path), fetchOptions);
        } catch (error) {
            throw new Error('Cannot connect to NaNb server. Start the backend and MongoDB first.');
        }

        var data = await response.json().catch(function () { return {}; });
        if (!response.ok) {
            if (response.status === 401) {
                if (scope === 'admin') clearAdminSession();
                else clearSession();
            }
            throw new Error(data.message || 'Request failed');
        }
        return data;
    }

    function normalizeUserEmail(email) {
        return String(email || '').toLowerCase().trim();
    }

    function userStorageSuffix(email) {
        return normalizeUserEmail(email).replace(/[^a-z0-9@._-]/g, '_');
    }

    function getCurrentUser() {
        var session = getSession();
        return session && session.user ? session.user : null;
    }

    function getUserCartKey(email) {
        var user = getCurrentUser();
        var normalized = normalizeUserEmail(email || (user && user.email));
        return normalized ? 'nanb_cart__' + userStorageSuffix(normalized) : null;
    }

    function getUserWishlistKey(email) {
        var user = getCurrentUser();
        var normalized = normalizeUserEmail(email || (user && user.email));
        return normalized ? 'nanb_wishlist__' + userStorageSuffix(normalized) : null;
    }

    function getUserOrdersKey(email) {
        var user = getCurrentUser();
        var normalized = normalizeUserEmail(email || (user && user.email));
        return normalized ? 'nanb_orders__' + userStorageSuffix(normalized) : null;
    }

    function getUserLastOrderIdKey(email) {
        var user = getCurrentUser();
        var normalized = normalizeUserEmail(email || (user && user.email));
        return normalized ? 'nanb_last_order_id__' + userStorageSuffix(normalized) : null;
    }

    function migrateLegacyShoppingData(email) {
        var cartKey = getUserCartKey(email);
        var wishlistKey = getUserWishlistKey(email);
        if (!cartKey || !wishlistKey) return;
        try {
            var legacyCart = localStorage.getItem(LEGACY_CART_KEY);
            if (legacyCart && !localStorage.getItem(cartKey)) localStorage.setItem(cartKey, legacyCart);
        } catch (error) {}
        try {
            var legacyWishlist = localStorage.getItem(LEGACY_WISHLIST_KEY);
            if (legacyWishlist && !localStorage.getItem(wishlistKey)) localStorage.setItem(wishlistKey, legacyWishlist);
        } catch (error) {}
        localStorage.removeItem(LEGACY_CART_KEY);
        localStorage.removeItem(LEGACY_WISHLIST_KEY);
        localStorage.removeItem(LEGACY_ORDERS_KEY);
        localStorage.removeItem(LEGACY_LAST_ORDER_ID_KEY);
    }

    function setSession(authResponse, remember) {
        var user = authResponse && authResponse.user ? authResponse.user : null;
        var token = authResponse && authResponse.token ? authResponse.token : '';
        if (!user || !token) throw new Error('Secure session token is missing');

        var payload = JSON.stringify({ user: user, token: token });
        localStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem(SESSION_KEY);
        if (remember) localStorage.setItem(SESSION_KEY, payload);
        else sessionStorage.setItem(SESSION_KEY, payload);

        migrateLegacyShoppingData(user.email);
        window.dispatchEvent(new CustomEvent('nanb:auth-changed', { detail: user }));
    }

    function clearSession() {
        localStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(LEGACY_ORDERS_KEY);
        localStorage.removeItem(LEGACY_LAST_ORDER_ID_KEY);
        window.dispatchEvent(new CustomEvent('nanb:cart-updated', { detail: [] }));
        window.dispatchEvent(new CustomEvent('nanb:wishlist-updated', { detail: [] }));
        window.dispatchEvent(new CustomEvent('nanb:orders-updated', { detail: [] }));
        window.dispatchEvent(new CustomEvent('nanb:auth-changed', { detail: null }));
    }

    function isLoggedIn() {
        var session = getSession();
        return !!(session && session.user && session.token);
    }

    function requireLogin(message) {
        if (isLoggedIn()) return true;
        window.dispatchEvent(new CustomEvent('nanb:auth-required', {
            detail: { message: message || 'Please login to continue.' }
        }));
        return false;
    }

    async function loadProductsFromJson() {
        var response = await fetch('assets/js/Products.json');
        if (!response.ok) throw new Error('Failed to load Products.json');
        var products = await response.json();
        return NaNbProductTransform.transformProducts(products);
    }

    async function loadProducts(params) {
        try {
            var response = await fetch(buildUrl('/api/products', params || {}));
            var data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to load products');
            return data.products || [];
        } catch (error) {
            console.warn('NaNb API unavailable, using Products.json for browsing only.', error);
            return loadProductsFromJson();
        }
    }

    async function login(payload) {
        return request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(payload),
            skipAuth: true
        });
    }

    async function signup(payload) {
        return request('/api/auth/signup', {
            method: 'POST',
            body: JSON.stringify(payload),
            skipAuth: true
        });
    }

    async function refreshCurrentUser() {
        var data = await request('/api/auth/me');
        var session = getSession();
        if (session && data.user) {
            session.user = data.user;
            var target = localStorage.getItem(SESSION_KEY) ? localStorage : sessionStorage;
            target.setItem(SESSION_KEY, JSON.stringify(session));
        }
        return data.user;
    }

    function getUserLastOrderId() {
        if (!isLoggedIn()) return null;
        var key = getUserLastOrderIdKey();
        return key ? localStorage.getItem(key) : null;
    }

    function setUserLastOrderId(orderId) {
        var key = getUserLastOrderIdKey();
        if (key && orderId) localStorage.setItem(key, orderId);
    }

    async function loadOrders() {
        if (!isLoggedIn()) return [];
        var data = await request('/api/orders');
        return data.orders || [];
    }

    async function trackOrder(orderId) {
        if (!isLoggedIn()) throw new Error('Login required to track orders');
        var normalizedId = String(orderId || '').trim();
        if (!normalizedId) throw new Error('Order not found');
        return request('/api/orders/' + encodeURIComponent(normalizedId));
    }

    async function checkoutCart(payload) {
        if (!isLoggedIn()) throw new Error('Login required to complete checkout');
        var data = await request('/api/orders/checkout', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        if (data.order && data.order.orderId) setUserLastOrderId(data.order.orderId);
        return data;
    }


    async function loadWishlist() {
        if (!isLoggedIn()) return [];
        var data = await request('/api/wishlist');
        return data.wishlist || [];
    }

    async function addWishlistItem(productId, alertEnabled) {
        return request('/api/wishlist/' + encodeURIComponent(productId), {
            method: 'POST',
            body: JSON.stringify({ alertEnabled: alertEnabled !== false })
        });
    }

    async function removeWishlistItem(productId) {
        return request('/api/wishlist/' + encodeURIComponent(productId), { method: 'DELETE' });
    }

    async function updateWishlistAlert(productId, alertEnabled) {
        return request('/api/wishlist/' + encodeURIComponent(productId) + '/alert', {
            method: 'PATCH',
            body: JSON.stringify({ alertEnabled: !!alertEnabled })
        });
    }

    async function bargain(productId, offer) {
        return request('/api/products/' + encodeURIComponent(productId) + '/bargain', {
            method: 'POST',
            body: JSON.stringify({ offer: offer }),
            skipAuth: true
        });
    }

    async function subscribeNewsletter(email) {
        return request('/api/newsletter', {
            method: 'POST',
            body: JSON.stringify({ email: email }),
            skipAuth: true
        });
    }

    async function sendContact(payload) {
        return request('/api/contact', {
            method: 'POST',
            body: JSON.stringify(payload),
            skipAuth: true
        });
    }

    function setAdminSession(authResponse) {
        if (!authResponse || !authResponse.user || !authResponse.token) throw new Error('Admin session token is missing');
        sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({ user: authResponse.user, token: authResponse.token }));
    }

    function clearAdminSession() {
        sessionStorage.removeItem(ADMIN_SESSION_KEY);
    }

    function isAdminLoggedIn() {
        var session = getAdminSession();
        return !!(session && session.token && session.user && session.user.role === 'admin');
    }

    async function adminLogin(username, password) {
        var data = await request('/api/admin/login', {
            method: 'POST',
            body: JSON.stringify({ username: username, password: password }),
            skipAuth: true
        });
        setAdminSession(data);
        return data;
    }

    async function loadAdminDashboard() {
        return request('/api/admin/dashboard', { authScope: 'admin' });
    }

    async function updateAdminOrderStatus(orderId, status) {
        return request('/api/admin/orders/' + encodeURIComponent(orderId) + '/status', {
            method: 'PATCH',
            body: JSON.stringify({ status: status }),
            authScope: 'admin'
        });
    }


    async function acceptAdminOrder(orderId) {
        return request('/api/admin/orders/' + encodeURIComponent(orderId) + '/accept', {
            method: 'PATCH',
            body: JSON.stringify({}),
            authScope: 'admin'
        });
    }

    async function deleteAdminOrder(orderId) {
        return request('/api/admin/orders/' + encodeURIComponent(orderId), {
            method: 'DELETE',
            authScope: 'admin'
        });
    }

    return {
        loadProducts: loadProducts,
        login: login,
        signup: signup,
        logout: clearSession,
        getCurrentUser: getCurrentUser,
        refreshCurrentUser: refreshCurrentUser,
        isLoggedIn: isLoggedIn,
        requireLogin: requireLogin,
        setSession: setSession,
        getUserCartKey: getUserCartKey,
        getUserWishlistKey: getUserWishlistKey,
        getUserOrdersKey: getUserOrdersKey,
        getUserLastOrderId: getUserLastOrderId,
        trackOrder: trackOrder,
        loadOrders: loadOrders,
        checkoutCart: checkoutCart,
        loadWishlist: loadWishlist,
        addWishlistItem: addWishlistItem,
        removeWishlistItem: removeWishlistItem,
        updateWishlistAlert: updateWishlistAlert,
        bargain: bargain,
        subscribeNewsletter: subscribeNewsletter,
        sendContact: sendContact,
        getLocalOrder: function () { return null; },
        getLocalOrders: function () { return []; },
        getLocalUsers: function () { return []; },
        saveLocalOrder: function () {},
        adminLogin: adminLogin,
        adminLogout: clearAdminSession,
        getAdminSession: getAdminSession,
        isAdminLoggedIn: isAdminLoggedIn,
        loadAdminDashboard: loadAdminDashboard,
        updateAdminOrderStatus: updateAdminOrderStatus,
        acceptAdminOrder: acceptAdminOrder,
        deleteAdminOrder: deleteAdminOrder
    };
})();
