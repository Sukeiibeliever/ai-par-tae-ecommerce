(function () {
    var STORAGE_KEY = 'nanb_wishlist';

    var CATEGORY_ICONS = {
        sneakers: 'fa-shoe-prints',
        tees: 'fa-shirt',
        pants: 'fa-person',
        jackets: 'fa-vest',
        accessories: 'fa-bag-shopping'
    };

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function formatPrice(price) {
        return Number(price || 0).toLocaleString() + ' MMK';
    }

    function getCategoryIcon(category) {
        return CATEGORY_ICONS[category] || 'fa-tag';
    }

    function sameId(a, b) {
        return String(a).replace(/^0+/, '') === String(b).replace(/^0+/, '');
    }

    function resolveWishlistStorageKey() {
        if (window.NaNbApi && typeof NaNbApi.getUserWishlistKey === 'function') {
            return NaNbApi.getUserWishlistKey();
        }
        return null;
    }

    function readWishlist() {
        var storageKey = resolveWishlistStorageKey();
        if (!storageKey) return [];

        try {
            var saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
            return Array.isArray(saved) ? saved : [];
        } catch (error) {
            return [];
        }
    }

    function writeWishlist(items) {
        var storageKey = resolveWishlistStorageKey();
        if (!storageKey) {
            window.dispatchEvent(new CustomEvent('nanb:wishlist-updated', { detail: [] }));
            return;
        }

        localStorage.setItem(storageKey, JSON.stringify(items));
        window.dispatchEvent(new CustomEvent('nanb:wishlist-updated', { detail: items }));
    }

    async function syncWishlistFromServer() {
        if (!window.NaNbApi || !NaNbApi.isLoggedIn() || typeof NaNbApi.loadWishlist !== 'function') return readWishlist();
        try {
            var local = readWishlist();
            var remote = await NaNbApi.loadWishlist();

            if ((!remote || !remote.length) && local.length && typeof NaNbApi.addWishlistItem === 'function') {
                for (var i = 0; i < local.length; i++) {
                    await NaNbApi.addWishlistItem(local[i].id, local[i].alertEnabled !== false);
                }
                remote = await NaNbApi.loadWishlist();
            }

            var merged = (remote || []).map(function (entry) {
                var id = entry.productId != null ? entry.productId : entry.id;
                var cached = local.find(function (item) { return sameId(item.id, id); }) || {};
                return Object.assign({}, cached, {
                    id: String(id),
                    alertEnabled: entry.alertEnabled !== false
                });
            });
            writeWishlist(merged);
            return merged;
        } catch (error) {
            console.warn('Could not sync wishlist with account.', error);
            return readWishlist();
        }
    }

    function isInWishlist(productId) {
        return readWishlist().some(function (item) {
            return sameId(item.id, productId);
        });
    }

    function addItem(product) {
        if (window.NaNbApi && !NaNbApi.requireLogin('Login required to save items to your wishlist.')) {
            return readWishlist();
        }
        if (isInWishlist(product.id)) return readWishlist();

        var items = readWishlist();
        items.push({
            id: product.id,
            name: product.name,
            brand: product.brand,
            category: product.category,
            price: product.price,
            image: product.image || '',
            alertEnabled: true
        });
        writeWishlist(items);
        if (window.NaNbApi && typeof NaNbApi.addWishlistItem === 'function') {
            NaNbApi.addWishlistItem(product.id, true).catch(function (error) { console.warn('Wishlist sync failed.', error); });
        }
        return items;
    }

    function removeItem(productId) {
        if (window.NaNbApi && !NaNbApi.isLoggedIn()) return readWishlist();
        var items = readWishlist().filter(function (item) {
            return !sameId(item.id, productId);
        });
        writeWishlist(items);
        if (window.NaNbApi && typeof NaNbApi.removeWishlistItem === 'function') {
            NaNbApi.removeWishlistItem(productId).catch(function (error) { console.warn('Wishlist sync failed.', error); });
        }
        return items;
    }

    function toggleItem(product) {
        if (window.NaNbApi && !NaNbApi.requireLogin('Login required to save items to your wishlist.')) {
            return readWishlist();
        }
        if (isInWishlist(product.id)) {
            return removeItem(product.id);
        }
        return addItem(product);
    }

    function setAlert(productId, enabled) {
        if (window.NaNbApi && !NaNbApi.isLoggedIn()) return readWishlist();
        var items = readWishlist().map(function (item) {
            if (sameId(item.id, productId)) item.alertEnabled = enabled;
            return item;
        });
        writeWishlist(items);
        if (window.NaNbApi && typeof NaNbApi.updateWishlistAlert === 'function') {
            NaNbApi.updateWishlistAlert(productId, enabled).catch(function (error) { console.warn('Wishlist alert sync failed.', error); });
        }
        return items;
    }

    function getCount() {
        return readWishlist().length;
    }

    function seedDemoWishlist() {
        writeWishlist([
            { id: '008', alertEnabled: true },
            { id: '002', alertEnabled: true }
        ]);
    }

    function getTrend(productId) {
        var trends = [-2.4, -1.1, 0.8, 1.6, 2.4, 3.1];
        var numericId = parseInt(String(productId).replace(/\D/g, ''), 10) || 0;
        var value = trends[numericId % trends.length];
        return {
            value: value,
            label: value >= 0 ? '+' + value.toFixed(1) + '%' : value.toFixed(1) + '%',
            isUp: value >= 0
        };
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
            rating: Number(product.rating || 0),
            instock_size: Array.isArray(product.instock_size) ? product.instock_size : []
        };
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

    function updateWishlistBadge() {
        var count = getCount();
        document.querySelectorAll('[data-wishlist-count]').forEach(function (el) {
            el.textContent = count;
            el.classList.toggle('d-none', count === 0);
        });

        var portfolioCount = document.querySelector('[data-wishlist-portfolio-count]');
        if (portfolioCount) {
            portfolioCount.textContent = count + (count === 1 ? ' item saved' : ' items saved');
        }

        document.querySelectorAll('a[href="wishlist.html"]').forEach(function (link) {
            link.classList.add('nav-wishlist-link');
            if (!link.querySelector('[data-wishlist-count]')) {
                link.insertAdjacentHTML(
                    'beforeend',
                    '<span class="nav-wishlist-count" data-wishlist-count>0</span>'
                );
            }
            var badge = link.querySelector('[data-wishlist-count]');
            if (badge) {
                badge.textContent = count;
                badge.classList.toggle('d-none', count === 0);
            }
        });
    }

    function syncWishlistButtons() {
        document.querySelectorAll('[data-wishlist-id]').forEach(function (btn) {
            var productId = btn.getAttribute('data-wishlist-id');
            var active = isInWishlist(productId);
            var icon = btn.querySelector('i');

            btn.classList.toggle('is-active', active);
            btn.setAttribute('aria-pressed', active ? 'true' : 'false');
            if (icon) {
                icon.classList.toggle('fa-solid', active);
                icon.classList.toggle('fa-regular', !active);
            }
        });
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
                console.warn('Could not load products for wishlist.', error);
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

    function mergeWithCatalog(wishlist, catalog) {
        return wishlist.map(function (item) {
            var product = catalog.find(function (entry) {
                return sameId(entry.id, item.id);
            });

            if (!product) {
                return {
                    id: item.id,
                    name: item.name || 'Product #' + item.id,
                    brand: item.brand || 'NaNb',
                    category: item.category || 'sneakers',
                    price: item.price || 0,
                    image: item.image || '',
                    alertEnabled: item.alertEnabled !== false
                };
            }

            return {
                id: String(product.id),
                name: product.name,
                brand: product.brand,
                category: product.category,
                price: product.price,
                image: product.image || item.image || '',
                instock_size: product.instock_size || [],
                alertEnabled: item.alertEnabled !== false
            };
        });
    }

    function renderWishlistRow(item) {
        var icon = getCategoryIcon(item.category);
        var trend = getTrend(item.id);
        var imageHtml = item.image
            ? '<img src="' + escapeHtml(item.image) + '" alt="" class="wishlist-item-image" onerror="this.classList.add(\'is-broken\')">'
            : '';
        var fallbackHtml = '<i class="fa-solid ' + icon + ' text-muted opacity-50"></i>';

        return (
            '<tr data-wishlist-row="' + item.id + '">' +
                '<td class="ps-4 py-4">' +
                    '<div class="d-flex align-items-center gap-3">' +
                        '<div class="wishlist-item-thumb bg-light rounded text-center">' +
                            imageHtml +
                            '<div class="wishlist-item-thumb-fallback' + (item.image ? '' : ' is-visible') + '">' + fallbackHtml + '</div>' +
                        '</div>' +
                        '<div>' +
                            '<span class="badge bg-secondary mb-1" style="font-size: 9px; font-weight: 800;">' + escapeHtml(item.brand).toUpperCase() + '</span>' +
                            '<h6 class="fw-bold text-dark m-0">' + escapeHtml(item.name) + '</h6>' +
                        '</div>' +
                    '</div>' +
                '</td>' +
                '<td class="fw-bold text-dark">' + formatPrice(item.price) + '</td>' +
                '<td>' +
                    '<span class="' + (trend.isUp ? 'text-success' : 'text-danger') + ' small fw-bold">' +
                        '<i class="fa-solid ' + (trend.isUp ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down') + ' me-1"></i> ' + trend.label +
                    '</span>' +
                '</td>' +
                '<td>' +
                    '<div class="form-check form-switch">' +
                        '<input class="form-check-input wishlist-alert-switch" type="checkbox" role="switch" id="alertSwitch' + item.id + '" data-wishlist-alert="' + item.id + '"' + (item.alertEnabled ? ' checked' : '') + '>' +
                        '<label class="form-check-label small text-muted" for="alertSwitch' + item.id + '">Notify Drop</label>' +
                    '</div>' +
                '</td>' +
                '<td class="pe-4 text-end">' +
                    '<div class="d-flex justify-content-end gap-2">' +
                        '<button type="button" class="btn btn-dark btn-sm fw-bold px-3 text-uppercase wishlist-cop-btn" data-wishlist-cop="' + item.id + '" style="font-size: 11px; background: var(--c-dark, #1a1a1a);">Insta-Cop</button>' +
                        '<button type="button" class="btn btn-outline-danger btn-sm px-2 wishlist-remove-btn" data-wishlist-remove="' + item.id + '" aria-label="Remove from wishlist"><i class="fa-regular fa-trash-can"></i></button>' +
                    '</div>' +
                '</td>' +
            '</tr>'
        );
    }

    function renderWishlistMobileCard(item) {
        var icon = getCategoryIcon(item.category);
        var trend = getTrend(item.id);
        var imageHtml = item.image
            ? '<img src="' + escapeHtml(item.image) + '" alt="" class="wishlist-item-image" onerror="this.classList.add(\'is-broken\')">'
            : '';
        var fallbackHtml = '<i class="fa-solid ' + icon + ' text-muted opacity-50"></i>';

        return (
            '<article class="wishlist-mobile-card" data-wishlist-row="' + item.id + '">' +
                '<div class="wishlist-mobile-card-head">' +
                    '<div class="wishlist-item-thumb bg-light rounded text-center">' +
                        imageHtml +
                        '<div class="wishlist-item-thumb-fallback' + (item.image ? '' : ' is-visible') + '">' + fallbackHtml + '</div>' +
                    '</div>' +
                    '<div class="wishlist-mobile-card-info">' +
                        '<span class="badge bg-secondary mb-1">' + escapeHtml(item.brand).toUpperCase() + '</span>' +
                        '<h6 class="fw-bold text-dark m-0">' + escapeHtml(item.name) + '</h6>' +
                        '<div class="wishlist-mobile-price">' + formatPrice(item.price) + '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="wishlist-mobile-card-meta">' +
                    '<span class="' + (trend.isUp ? 'text-success' : 'text-danger') + ' small fw-bold">' +
                        '<i class="fa-solid ' + (trend.isUp ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down') + ' me-1"></i>' + trend.label +
                    '</span>' +
                    '<div class="form-check form-switch m-0">' +
                        '<input class="form-check-input wishlist-alert-switch" type="checkbox" role="switch" id="alertSwitchMobile' + item.id + '" data-wishlist-alert="' + item.id + '"' + (item.alertEnabled ? ' checked' : '') + '>' +
                        '<label class="form-check-label small text-muted" for="alertSwitchMobile' + item.id + '">Notify</label>' +
                    '</div>' +
                '</div>' +
                '<div class="wishlist-mobile-card-actions">' +
                    '<button type="button" class="btn btn-dark btn-sm fw-bold flex-grow-1 text-uppercase wishlist-cop-btn" data-wishlist-cop="' + item.id + '">Insta-Cop</button>' +
                    '<button type="button" class="btn btn-outline-danger btn-sm wishlist-remove-btn" data-wishlist-remove="' + item.id + '" aria-label="Remove from wishlist"><i class="fa-regular fa-trash-can"></i></button>' +
                '</div>' +
            '</article>'
        );
    }

    function renderWishlistEmptyPanel(type) {
        if (type === 'login') {
            return (
                '<div class="page-empty-panel-inner">' +
                    '<i class="fa-regular fa-heart"></i>' +
                    '<h5>Login required</h5>' +
                    '<p>Login to view and manage your wishlist.</p>' +
                    '<a href="#" class="btn btn-dark btn-sm" data-auth-open="loginModal">Login</a>' +
                '</div>'
            );
        }
        return (
            '<div class="page-empty-panel-inner">' +
                '<i class="fa-regular fa-heart"></i>' +
                '<h5>Watchlist is empty</h5>' +
                '<p>Save drops to monitor prices and stock alerts.</p>' +
                '<a href="products.html" class="btn btn-dark btn-sm">Browse Drops</a>' +
            '</div>'
        );
    }

    window.NaNbWishlist = {
        read: readWishlist,
        add: addItem,
        remove: removeItem,
        toggle: toggleItem,
        isIn: isInWishlist,
        getCount: getCount,
        seedDemo: seedDemoWishlist,
        syncButtons: syncWishlistButtons,
        refresh: function () {
            updateWishlistBadge();
            syncWishlistButtons();
            if (renderWishlistPage) renderWishlistPage();
            if (window.NaNbAuth && typeof NaNbAuth.bindTriggers === 'function') {
                NaNbAuth.bindTriggers();
            }
        }
    };

    document.addEventListener('click', function (event) {
        var wishlistBtn = event.target.closest('[data-wishlist-id]');
        if (!wishlistBtn) return;

        event.preventDefault();
        event.stopPropagation();

        var productId = wishlistBtn.getAttribute('data-wishlist-id');
        var product = (window.NANB_PRODUCTS || []).find(function (item) {
            return sameId(item.id, productId);
        });

        if (!product) return;

        toggleItem(product);
        syncWishlistButtons();
    });

    var renderWishlistPage = null;

    document.addEventListener('DOMContentLoaded', async function () {
        if (/wishlist\.html/i.test(window.location.pathname) || window.location.href.indexOf('wishlist.html') !== -1) {
            document.body.classList.add('wishlist-page-active');
        }

        if (window.NaNbApi && NaNbApi.isLoggedIn()) {
            await syncWishlistFromServer();
        }
        updateWishlistBadge();
        syncWishlistButtons();

        var tableBody = document.getElementById('wishlistTableBody');
        if (!tableBody) return;

        var emptyPanel = document.getElementById('wishlistEmptyPanel');
        var mobileList = document.getElementById('wishlistMobileList');
        var tableWrap = document.querySelector('.wishlist-table-wrap');

        function bindWishlistActions(container) {
            if (!container || container.dataset.wishlistBound === '1') return;
            container.dataset.wishlistBound = '1';

            container.addEventListener('click', function (event) {
                var removeBtn = event.target.closest('[data-wishlist-remove]');
                if (removeBtn) {
                    removeItem(removeBtn.getAttribute('data-wishlist-remove'));
                    renderWishlistPage();
                    return;
                }

                var copBtn = event.target.closest('[data-wishlist-cop]');
                if (copBtn && typeof NaNbCart !== 'undefined') {
                    var copId = copBtn.getAttribute('data-wishlist-cop');

                    loadCatalog().then(function (catalog) {
                        var product = mergeWithCatalog(readWishlist(), catalog).find(function (item) {
                            return sameId(item.id, copId);
                        });

                        if (!product) return;

                        NaNbCart.add(Object.assign({}, product, {
                            selectedSize: (product.instock_size && product.instock_size[0]) || 'Free Size'
                        }), 1);
                        copBtn.textContent = 'Added!';
                        setTimeout(function () {
                            copBtn.textContent = 'Insta-Cop';
                        }, 1000);
                    });
                }
            });

            container.addEventListener('change', function (event) {
                var switchEl = event.target.closest('[data-wishlist-alert]');
                if (!switchEl) return;
                setAlert(switchEl.getAttribute('data-wishlist-alert'), switchEl.checked);
            });
        }

        renderWishlistPage = async function () {
            var loggedIn = window.NaNbApi && typeof NaNbApi.isLoggedIn === 'function' && NaNbApi.isLoggedIn();
            var wishlist = readWishlist();
            var catalog = await loadCatalog();
            var items = mergeWithCatalog(wishlist, catalog);

            if (!loggedIn) {
                if (emptyPanel) {
                    emptyPanel.innerHTML = renderWishlistEmptyPanel('login');
                    emptyPanel.classList.remove('d-none');
                }
                if (tableWrap) tableWrap.classList.add('d-none');
                if (mobileList) {
                    mobileList.innerHTML = '';
                    mobileList.classList.add('d-none');
                }
                tableBody.innerHTML = '';
            } else if (!items.length) {
                if (emptyPanel) {
                    emptyPanel.innerHTML = renderWishlistEmptyPanel('empty');
                    emptyPanel.classList.remove('d-none');
                }
                if (tableWrap) tableWrap.classList.add('d-none');
                if (mobileList) {
                    mobileList.innerHTML = '';
                    mobileList.classList.add('d-none');
                }
                tableBody.innerHTML = '';
            } else {
                if (emptyPanel) {
                    emptyPanel.innerHTML = '';
                    emptyPanel.classList.add('d-none');
                }
                if (tableWrap) tableWrap.classList.remove('d-none');
                tableBody.innerHTML = items.map(renderWishlistRow).join('');
                if (mobileList) {
                    mobileList.innerHTML = items.map(renderWishlistMobileCard).join('');
                    mobileList.classList.remove('d-none');
                }
            }

            updateWishlistBadge();
            syncWishlistButtons();
            if (window.NaNbAuth && typeof NaNbAuth.updateUI === 'function') {
                NaNbAuth.updateUI();
            }
            if (window.NaNbAuth && typeof NaNbAuth.bindTriggers === 'function') {
                NaNbAuth.bindTriggers();
            }
        };

        bindWishlistActions(tableBody);
        if (mobileList) bindWishlistActions(mobileList);

        await renderWishlistPage();
    });

    window.addEventListener('nanb:wishlist-updated', function () {
        updateWishlistBadge();
        syncWishlistButtons();
        if (renderWishlistPage) renderWishlistPage();
    });

    window.addEventListener('nanb:auth-changed', async function () {
        if (window.NaNbApi && NaNbApi.isLoggedIn()) {
            await syncWishlistFromServer();
        }
        updateWishlistBadge();
        syncWishlistButtons();
        if (renderWishlistPage) renderWishlistPage();
        if (window.NaNbAuth && typeof NaNbAuth.bindTriggers === 'function') {
            NaNbAuth.bindTriggers();
        }
    });
})();
