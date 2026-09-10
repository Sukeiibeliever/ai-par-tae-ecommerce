(function () {
    var STORAGE_KEY = 'nanb_cart';
    var ORDERS_KEY = 'nanb_orders';
    var APPRAISAL_FEE = 15000;
    var PROMO_CODES = {
        NA_BRAIN_2026: { type: 'percent', value: 10 },
        HYPE2026: { type: 'fixed', value: 50000 }
    };

    var CATEGORY_ICONS = {
        sneakers: 'fa-shoe-prints',
        tees: 'fa-shirt',
        pants: 'fa-person',
        jackets: 'fa-vest',
        accessories: 'fa-bag-shopping'
    };

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function formatPrice(price) {
        return Number(price || 0).toLocaleString() + ' MMK';
    }

    function getCategoryIcon(category) {
        return CATEGORY_ICONS[category] || 'fa-tag';
    }

    function getCartKey(item) {
        var dealPart = item.isNegotiatedDeal || item.dealPrice || item.negotiatedPrice ? 'deal-' + String(item.dealPrice || item.negotiatedPrice || item.price) : 'normal';
        return String(item.id) + '::' + String(item.selectedSize || '') + '::' + dealPart;
    }

    function resolveCartStorageKey() {
        if (window.NaNbApi && typeof NaNbApi.getUserCartKey === 'function') {
            return NaNbApi.getUserCartKey();
        }
        return null;
    }

    function readCart() {
        var storageKey = resolveCartStorageKey();
        if (!storageKey) return [];

        try {
            var saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
            return Array.isArray(saved) ? saved : [];
        } catch (error) {
            return [];
        }
    }

    function writeCart(cart) {
        var storageKey = resolveCartStorageKey();
        if (!storageKey) {
            window.dispatchEvent(new CustomEvent('nanb:cart-updated', { detail: [] }));
            return;
        }

        localStorage.setItem(storageKey, JSON.stringify(cart));
        window.dispatchEvent(new CustomEvent('nanb:cart-updated', { detail: cart }));
    }

    function showCartToast(message, type) {
        var oldToast = document.getElementById('nanbCartToast');
        if (oldToast) oldToast.remove();

        document.body.insertAdjacentHTML('beforeend',
            '<div class="nanb-cart-toast nanb-cart-toast--' + (type || 'success') + '" id="nanbCartToast" role="status">' +
                '<i class="fa-solid ' + (type === 'error' ? 'fa-circle-exclamation' : 'fa-cart-plus') + '"></i>' +
                '<span>' + escapeHtml(message || 'Added to cart') + '</span>' +
            '</div>'
        );

        var toast = document.getElementById('nanbCartToast');
        requestAnimationFrame(function () {
            if (toast) toast.classList.add('is-visible');
        });

        setTimeout(function () {
            if (!toast) return;
            toast.classList.remove('is-visible');
            setTimeout(function () { if (toast.parentNode) toast.remove(); }, 250);
        }, 2400);
    }

    function clearCart() {
        writeCart([]);
    }

    function addItem(product, qty) {
        if (window.NaNbApi && !NaNbApi.requireLogin('Login required to add items to your cart.')) {
            return readCart();
        }

        var amount = qty || 1;
        var cart = readCart();
        var incomingKey = getCartKey(product);
        var existing = cart.find(function (item) { return getCartKey(item) === incomingKey; });

        if (existing) {
            existing.qty += amount;
        } else {
            cart.push({
                id: product.id,
                qty: amount,
                name: product.name,
                brand: product.brand,
                category: product.category,
                price: product.dealPrice || product.negotiatedPrice || product.price,
                originalPrice: product.originalPrice || product.price,
                dealPrice: product.dealPrice || product.negotiatedPrice || 0,
                negotiatedPrice: product.negotiatedPrice || product.dealPrice || 0,
                isNegotiatedDeal: !!(product.isNegotiatedDeal || product.dealPrice || product.negotiatedPrice),
                dealToken: product.dealToken || '',
                image: product.image || '',
                selectedSize: product.selectedSize || ''
            });
        }
        writeCart(cart);
        showCartToast(existing ? 'Cart quantity updated' : 'Added to cart successfully');
        return cart;
    }

    function removeItem(cartKey) {
        var cart = readCart().filter(function (item) { return getCartKey(item) !== String(cartKey); });
        writeCart(cart);
        return cart;
    }

    function updateQty(cartKey, qty) {
        var nextQty = Math.max(1, qty);
        var cart = readCart().map(function (item) {
            if (getCartKey(item) === String(cartKey)) item.qty = nextQty;
            return item;
        });
        writeCart(cart);
        return cart;
    }

    function getCount() {
        return readCart().reduce(function (total, item) { return total + Number(item.qty || 0); }, 0);
    }

    async function loadCatalogFromJson() {
        var paths = ['assets/js/Products.json', 'Products.json', './Products.json'];
        for (var i = 0; i < paths.length; i++) {
            try {
                var response = await fetch(paths[i], { cache: 'no-store' });
                if (!response.ok) continue;
                var raw = await response.json();
                if (!Array.isArray(raw) || !raw.length) continue;
                return raw.map(normalizeCatalogProduct);
            } catch (error) {}
        }
        return [];
    }

    function normalizeCatalogProduct(product) {
        var brands = Array.isArray(product.brand)
            ? product.brand
            : String(product.brand || 'NaNb').split(',').map(function (part) { return part.trim(); });
        var price = Number(String(product.price || '0').replace(/[^0-9.]/g, '')) || 0;
        var image = product.image || '';
        if (image && String(image).indexOf('/') === -1) {
            image = 'assets/images/' + image;
        }

        return {
            id: String(product.id),
            name: product.name,
            brand: brands.join(', '),
            category: String(product.category || 'sneakers').toLowerCase(),
            price: price,
            image: image,
            instock_size: Array.isArray(product.instock_size) ? product.instock_size : []
        };
    }

    async function loadCatalog() {
        var jsonCatalog = await loadCatalogFromJson();
        if (jsonCatalog.length) return jsonCatalog;

        if (typeof NaNbApi !== 'undefined') {
            try {
                var apiProducts = await NaNbApi.loadProducts();
                return (apiProducts || []).map(function (product) {
                    return normalizeCatalogProduct(Object.assign({}, product, { id: product.id }));
                });
            } catch (error) {
                console.warn('Could not load products for cart.', error);
            }
        }

        if (typeof NaNbProductTransform !== 'undefined') {
            var response = await fetch('assets/js/Products.json');
            if (response.ok) {
                return NaNbProductTransform.transformProducts(await response.json()).map(function (product) {
                    return normalizeCatalogProduct(Object.assign({}, product, { id: String(product.id) }));
                });
            }
        }

        return [];
    }

    function sameId(a, b) {
        return String(a).replace(/^0+/, '') === String(b).replace(/^0+/, '');
    }

    function mergeCartWithCatalog(cart, catalog) {
        return cart.map(function (item) {
            var product = catalog.find(function (entry) { return sameId(entry.id, item.id); });
            if (!product) {
                return {
                    id: item.id,
                    qty: item.qty || 1,
                    name: item.name || 'Product #' + item.id,
                    brand: item.brand || 'NaNb',
                    category: item.category || 'sneakers',
                    price: item.price || 0,
                    originalPrice: item.originalPrice || item.price || 0,
                    dealPrice: item.dealPrice || item.negotiatedPrice || 0,
                    negotiatedPrice: item.negotiatedPrice || item.dealPrice || 0,
                    isNegotiatedDeal: !!(item.isNegotiatedDeal || item.dealPrice || item.negotiatedPrice),
                    dealToken: item.dealToken || '',
                    image: item.image || '',
                    selectedSize: item.selectedSize || ''
                };
            }
            return {
                id: String(item.id),
                qty: item.qty || 1,
                name: product.name,
                brand: product.brand,
                category: product.category,
                price: item.isNegotiatedDeal ? (item.dealPrice || item.negotiatedPrice || item.price) : product.price,
                originalPrice: item.originalPrice || product.price,
                dealPrice: item.dealPrice || item.negotiatedPrice || 0,
                negotiatedPrice: item.negotiatedPrice || item.dealPrice || 0,
                isNegotiatedDeal: !!(item.isNegotiatedDeal || item.dealPrice || item.negotiatedPrice),
                dealToken: item.dealToken || '',
                image: product.image || item.image || '',
                selectedSize: item.selectedSize || ''
            };
        });
    }

    function renderCartItem(item) {
        var icon = getCategoryIcon(item.category);
        var cartKey = getCartKey(item);
        var imageHtml = item.image
            ? '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.name) + '" class="cart-item-image" onerror="this.classList.add(\'is-broken\')">'
            : '';

        return (
            '<div class="card border-0 shadow-sm p-4 mb-3 rounded position-relative bg-white cart-item-card" data-cart-key="' + escapeHtml(cartKey) + '">' +
                '<div class="row align-items-center g-3">' +
                    '<div class="col-auto"><div class="cart-item-thumb bg-light rounded text-center">' +
                        imageHtml + '<div class="cart-item-thumb-fallback' + (item.image ? '' : ' is-visible') + '"><i class="fa-solid ' + icon + ' fa-2x text-muted opacity-70"></i></div>' +
                    '</div></div>' +
                    '<div class="col-md">' +
                        '<span class="badge bg-dark mb-1 text-uppercase tracking-wider" style="font-size:9px;font-weight:700;">' + escapeHtml(item.brand) + '</span>' +
                        '<h5 class="fw-bold text-dark m-0">' + escapeHtml(item.name) + '</h5>' +
                        '<span class="small text-muted d-block mt-1">' + (item.isNegotiatedDeal ? '<span class="text-decoration-line-through me-1">' + formatPrice(item.originalPrice) + '</span> <strong class="text-success">' + formatPrice(item.price) + '</strong> each <span class="bargain-deal-note">DEAL PRICE</span>' : formatPrice(item.price) + ' each') + '</span>' +
                        (item.selectedSize ? '<span class="cart-size-badge"><i class="fa-solid fa-ruler-combined me-1"></i> Size: ' + escapeHtml(item.selectedSize) + '</span>' : '') +
                    '</div>' +
                    '<div class="col-6 col-md-auto"><div class="d-flex align-items-center border border-2 border-dark rounded cart-qty-control">' +
                        '<button type="button" class="btn btn-sm btn-link text-dark text-decoration-none fw-bold px-3" data-cart-action="decrement" data-cart-key="' + escapeHtml(cartKey) + '">-</button>' +
                        '<input type="text" class="form-control text-center border-0 p-0 fw-bold bg-transparent cart-qty-input" value="' + item.qty + '" readonly style="font-size:14px;">' +
                        '<button type="button" class="btn btn-sm btn-link text-dark text-decoration-none fw-bold px-3" data-cart-action="increment" data-cart-key="' + escapeHtml(cartKey) + '">+</button>' +
                    '</div></div>' +
                    '<div class="col-6 col-md-auto text-end"><span class="small text-muted d-block" style="font-size:11px;text-transform:uppercase;">Total Base</span>' +
                        '<span class="fw-extrabold text-dark font-monospace fs-6 cart-line-total">' + formatPrice(item.price * item.qty) + '</span></div>' +
                '</div>' +
                '<button type="button" class="btn btn-sm text-danger position-absolute top-0 end-0 m-2 border-0 bg-transparent cart-remove-btn" title="Remove Item" data-cart-action="remove" data-cart-key="' + escapeHtml(cartKey) + '"><i class="fa-solid fa-xmark"></i></button>' +
            '</div>'
        );
    }

    function calculateTotals(cart, promoCode) {
        var subtotal = cart.reduce(function (total, item) { return total + Number(item.price || 0) * Number(item.qty || 1); }, 0);
        var discount = 0;
        if (promoCode && PROMO_CODES[promoCode]) {
            var promo = PROMO_CODES[promoCode];
            discount = promo.type === 'percent' ? Math.round(subtotal * promo.value / 100) : Math.min(subtotal, promo.value);
        }
        return {
            subtotal: subtotal,
            discount: discount,
            grandTotal: Math.max(0, subtotal - discount + APPRAISAL_FEE),
            hypeIndex: cart.length ? (4.2 + cart.length * 0.3).toFixed(1) : '0.0'
        };
    }

    function updateCartBadge() {
        var count = getCount();

        document.querySelectorAll('[data-cart-count]').forEach(function (el) {
            el.textContent = count;
            el.classList.toggle('d-none', count === 0);
        });

        var portfolioCount = document.querySelector('[data-cart-portfolio-count]');
        if (portfolioCount) {
            portfolioCount.textContent = count + (count === 1 ? ' item in cart' : ' items in cart');
        }

        document.querySelectorAll('a[href="cart.html"]').forEach(function (link) {
            link.classList.add('nav-cart-link');
            if (!link.querySelector('[data-cart-count]')) {
                link.insertAdjacentHTML(
                    'beforeend',
                    '<span class="nav-cart-count" data-cart-count>0</span>'
                );
            }
            var badge = link.querySelector('[data-cart-count]');
            if (badge) {
                badge.textContent = count;
                badge.classList.toggle('d-none', count === 0);
            }
        });
    }

    function openCheckoutModal(items, totals, appliedPromo) {
        if (window.NaNbApi && !NaNbApi.requireLogin('Login required to complete checkout.')) {
            return;
        }

        var oldModal = document.getElementById('nanbCheckoutModal');
        if (oldModal) oldModal.remove();

        var itemSummary = items.map(function (item) {
            return '<li><span>' + escapeHtml(item.name) + (item.selectedSize ? ' / ' + escapeHtml(item.selectedSize) : '') + '</span><strong>x' + item.qty + '</strong></li>';
        }).join('');

        document.body.insertAdjacentHTML('beforeend',
            '<div class="nanb-checkout-modal is-open" id="nanbCheckoutModal" role="dialog" aria-modal="true">' +
                '<div class="nanb-checkout-backdrop" data-checkout-close></div>' +
                '<div class="nanb-checkout-dialog">' +
                    '<button type="button" class="nanb-checkout-close" data-checkout-close aria-label="Close checkout"><i class="fa-solid fa-xmark"></i></button>' +
                    '<div class="nanb-checkout-head"><span><i class="fa-solid fa-shield-halved"></i> Secure checkout</span><h3>Finalize Your Drop</h3><p>Fill payment and delivery details. After placing order, you will jump to order tracking.</p></div>' +
                    '<form id="nanbCheckoutForm" class="nanb-checkout-form">' +
                        '<div class="nanb-checkout-grid"><label>Full Name<input required name="name" type="text" placeholder="Your name"></label><label>Phone<input required name="phone" type="tel" placeholder="09xxxxxxxxx"></label></div>' +
                        '<label>Delivery Address<textarea required name="address" rows="3" placeholder="Street, township, city"></textarea></label>' +
                        '<div class="nanb-checkout-grid"><label>Payment Method<select required name="payment"><option value="KPay">KPay</option><option value="Wave Money">Wave Money</option><option value="COD">Cash on Delivery</option><option value="Bank Transfer">Bank Transfer</option></select></label><label>Transaction / Note<input name="paymentNote" type="text" placeholder="Payment ID or note"></label></div>' +
                        '<div class="nanb-checkout-summary"><h6>Order Summary</h6><ul>' + itemSummary + '</ul><div><span>Grand Total</span><strong>' + formatPrice(totals.grandTotal) + '</strong></div></div>' +
                        '<button type="submit" class="nanb-place-order-btn">Place Order <i class="fa-solid fa-arrow-right"></i></button>' +
                    '</form>' +
                '</div>' +
            '</div>'
        );

        var modal = document.getElementById('nanbCheckoutModal');
        modal.addEventListener('click', function (event) {
            if (event.target.closest('[data-checkout-close]')) modal.remove();
        });

        document.getElementById('nanbCheckoutForm').addEventListener('submit', async function (event) {
            event.preventDefault();
            var form = event.currentTarget;
            var data = new FormData(form);
            var submitBtn = form.querySelector('.nanb-place-order-btn');

            if (!window.NaNbApi || typeof NaNbApi.checkoutCart !== 'function') {
                showCartToast('Secure checkout service is unavailable.', 'error');
                return;
            }

            var payload = {
                items: items.map(function (item) {
                    return {
                        id: item.id,
                        qty: item.qty,
                        selectedSize: item.selectedSize || '',
                        negotiated: !!item.isNegotiatedDeal,
                        dealToken: item.dealToken || ''
                    };
                }),
                customer: {
                    name: data.get('name'),
                    phone: data.get('phone'),
                    address: data.get('address')
                },
                payment: {
                    method: data.get('payment'),
                    note: data.get('paymentNote') || ''
                },
                promoCode: appliedPromo || ''
            };

            try {
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Creating Order';
                }
                var response = await NaNbApi.checkoutCart(payload);
                if (!response || !response.order || !response.order.orderId) {
                    throw new Error('Order could not be created');
                }
                var orderId = response.order.orderId;
                clearCart();
                if (submitBtn) submitBtn.innerHTML = '<i class="fa-solid fa-circle-check me-2"></i> Order Created';
                setTimeout(function () {
                    window.location.href = 'order.html?order_id=' + encodeURIComponent(orderId);
                }, 700);
            } catch (error) {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'Place Order <i class="fa-solid fa-arrow-right"></i>';
                }
                showCartToast(error.message || 'Checkout failed. Please try again.', 'error');
            }
        });
    }

    function updateCheckoutAccess(items) {
        var checkoutBtn = document.getElementById('cartCheckoutBtn');
        var loginNotice = document.getElementById('cartLoginNotice');
        var loggedIn = window.NaNbApi && typeof NaNbApi.isLoggedIn === 'function' && NaNbApi.isLoggedIn();
        var hasItems = items && items.length > 0;

        if (loginNotice) {
            loginNotice.classList.toggle('d-none', loggedIn);
        }

        if (checkoutBtn) {
            checkoutBtn.disabled = !hasItems || !loggedIn;
            checkoutBtn.classList.toggle('is-disabled', !hasItems || !loggedIn);
        }
    }

    window.NaNbCart = {
        read: readCart,
        add: addItem,
        remove: removeItem,
        updateQty: updateQty,
        getCartKey: getCartKey,
        getCount: getCount,
        clear: clearCart,
        showToast: showCartToast,
        refresh: function () {
            updateCartBadge();
            if (renderCartPage) renderCartPage();
            if (window.NaNbAuth && typeof NaNbAuth.bindTriggers === 'function') {
                NaNbAuth.bindTriggers();
            }
        }
    };

    var renderCartPage = null;

    document.addEventListener('DOMContentLoaded', async function () {
        if (/cart\.html/i.test(window.location.pathname) || window.location.href.indexOf('cart.html') !== -1) {
            document.body.classList.add('cart-page-active');
        }

        updateCartBadge();
        var itemsList = document.getElementById('cartItemsList');
        if (!itemsList) return;

        var promoInput = document.getElementById('promoInput');
        var promoMessage = document.getElementById('promoMessage');
        var appliedPromo = '';

        renderCartPage = async function () {
            var loggedIn = window.NaNbApi && typeof NaNbApi.isLoggedIn === 'function' && NaNbApi.isLoggedIn();
            var catalog = await loadCatalog();
            var items = loggedIn ? mergeCartWithCatalog(readCart(), catalog) : [];

            if (!loggedIn) {
                itemsList.innerHTML = '<div id="cartEmptyState" class="card border-0 shadow-sm p-5 text-center bg-white"><i class="fa-solid fa-cart-shopping fa-3x text-muted opacity-50 mb-3"></i><p class="text-muted mb-3">Login to view and manage your cart.</p><a href="#" class="btn btn-dark" data-auth-open="loginModal">Login</a></div>';
            } else if (!items.length) {
                itemsList.innerHTML = '<div id="cartEmptyState" class="card border-0 shadow-sm p-5 text-center bg-white"><i class="fa-solid fa-cart-shopping fa-3x text-muted opacity-50 mb-3"></i><p class="text-muted mb-3">Your acquisition cart is empty.</p><a href="products.html" class="btn btn-dark">Browse Drops</a></div>';
            } else {
                itemsList.innerHTML = items.map(renderCartItem).join('') + '<div class="alert alert-dark border-0 p-4 d-flex align-items-center gap-3 shadow-sm rounded-3 cart-roi-banner"><div class="fs-2 text-warning"><i class="fa-solid fa-chart-line"></i></div><div><h6 class="fw-bold m-0 text-warning" style="letter-spacing:.5px;">ESTIMATED RE-MARKET HYPE PORTFOLIO INDEX</h6><p class="small m-0 text-white-50 mt-1">Based on global index algorithms, the deadstock compounding value of these items is projected to surge <span class="text-success fw-bold" id="portfolioIndex">+' + calculateTotals(items, appliedPromo).hypeIndex + '%</span> next season. Hold or Rock safely.</p></div></div>';
            }

            var totals = calculateTotals(items, appliedPromo);
            document.getElementById('cartSubtotal').textContent = formatPrice(totals.subtotal);
            document.getElementById('cartDiscountRow').classList.toggle('d-none', totals.discount === 0);
            document.getElementById('cartDiscount').textContent = '- ' + formatPrice(totals.discount);
            document.getElementById('cartAppraisalFee').textContent = '+ ' + formatPrice(APPRAISAL_FEE);
            document.getElementById('cartGrandTotal').textContent = formatPrice(totals.grandTotal);
            var checkoutBtn = document.getElementById('cartCheckoutBtn');
            if (checkoutBtn) {
                checkoutBtn.disabled = !items.length;
                checkoutBtn.classList.toggle('is-disabled', !items.length);
            }
            updateCheckoutAccess(items);
            updateCartBadge();
            if (window.NaNbAuth && typeof NaNbAuth.bindTriggers === 'function') {
                NaNbAuth.bindTriggers();
            }
        };

        itemsList.addEventListener('click', function (event) {
            var button = event.target.closest('[data-cart-action]');
            if (!button) return;
            var cartKey = button.getAttribute('data-cart-key');
            var action = button.getAttribute('data-cart-action');
            var current = readCart().find(function (item) { return getCartKey(item) === String(cartKey); });
            if (!current) return;
            if (action === 'remove') removeItem(cartKey);
            if (action === 'increment') updateQty(cartKey, Number(current.qty || 1) + 1);
            if (action === 'decrement') {
                if (Number(current.qty || 1) <= 1) removeItem(cartKey);
                else updateQty(cartKey, Number(current.qty || 1) - 1);
            }
            renderCartPage();
        });

        var promoBtn = document.getElementById('promoApplyBtn');
        if (promoBtn) {
            promoBtn.addEventListener('click', function () {
                var code = (promoInput.value || '').trim().toUpperCase();
                if (!code) {
                    promoMessage.textContent = 'Enter a voucher code.';
                    promoMessage.className = 'small text-danger mt-2 mb-0';
                    return;
                }
                if (!PROMO_CODES[code]) {
                    appliedPromo = '';
                    promoMessage.textContent = 'Invalid voucher code.';
                    promoMessage.className = 'small text-danger mt-2 mb-0';
                } else {
                    appliedPromo = code;
                    promoMessage.textContent = 'Voucher applied successfully.';
                    promoMessage.className = 'small text-success mt-2 mb-0';
                }
                renderCartPage();
            });
        }

        var checkoutBtn = document.getElementById('cartCheckoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', async function () {
                if (window.NaNbApi && !NaNbApi.requireLogin('Login required to complete checkout.')) {
                    return;
                }
                var currentCart = readCart();
                if (!currentCart.length) return;
                var catalog = await loadCatalog();
                var items = mergeCartWithCatalog(currentCart, catalog);
                openCheckoutModal(items, calculateTotals(items, appliedPromo), appliedPromo);
            });
        }

        await renderCartPage();
    });

    window.addEventListener('nanb:cart-updated', function () {
        updateCartBadge();
        if (renderCartPage) renderCartPage();
    });

    window.addEventListener('nanb:auth-changed', function () {
        updateCartBadge();
        if (renderCartPage) renderCartPage();
        else if (window.NaNbAuth && typeof NaNbAuth.bindTriggers === 'function') {
            NaNbAuth.bindTriggers();
        }
    });
})();
