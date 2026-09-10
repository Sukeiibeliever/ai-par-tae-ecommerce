(function () {
    var CATEGORY_ICONS = {
        sneakers: 'fa-shoe-prints',
        tees: 'fa-shirt',
        pants: 'fa-person',
        jackets: 'fa-vest',
        accessories: 'fa-bag-shopping'
    };

    var STATUS_STEPS = ['Pending', 'Accepted', 'In Transit', 'Delivered'];
    var cachedOrders = [];
    var renderOrderPage = null;

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function formatPrice(price) {
        return Number(price || 0).toLocaleString() + ' MMK';
    }

    function formatDate(dateString) {
        var date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return dateString;
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    }


    function formatDateTime(dateString) {
        var date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return '';
        return date.toLocaleString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    }

    function getCategoryIcon(category) {
        return CATEGORY_ICONS[category] || 'fa-tag';
    }

    function isLoggedIn() {
        return window.NaNbApi && typeof NaNbApi.isLoggedIn === 'function' && NaNbApi.isLoggedIn();
    }

    function normalizeStatus(status) {
        var value = String(status || '').toLowerCase();
        if (value.indexOf('cancel') !== -1) return 'Cancelled';
        if (value.indexOf('deliver') !== -1 || value.indexOf('arriv') !== -1) return 'Delivered';
        if (value.indexOf('transit') !== -1 || value.indexOf('dispatch') !== -1 || value.indexOf('ship') !== -1) return 'In Transit';
        if (value.indexOf('accept') !== -1 || value.indexOf('confirm') !== -1 || value.indexOf('process') !== -1 || value.indexOf('auth') !== -1) return 'Accepted';
        return 'Pending';
    }

    function getStatusMessage(order) {
        var normalized = normalizeStatus(order && order.status);
        if (normalized === 'Pending') {
            return 'Your order is waiting for admin acceptance.';
        }
        if (normalized === 'Accepted') {
            return 'Your order has been accepted and is being prepared for delivery.';
        }
        if (normalized === 'In Transit') {
            return 'Your order is on the way with our dispatch team.';
        }
        if (normalized === 'Delivered') {
            return 'Your order has arrived. Thank you for shopping with NaNb.';
        }
        return (order && order.cancellationMessage) || 'Your order is cancelled. Please check your payment method and payment status.';
    }

    function renderArrivalInfo(order) {
        if (!order) return '';
        var normalized = normalizeStatus(order.status);
        if (normalized === 'Cancelled') {
            var cancelledAt = order.cancelledAt ? formatDateTime(order.cancelledAt) : '';
            var paymentMethod = order.payment && order.payment.method ? String(order.payment.method) : '';
            var cancelledInfo = cancelledAt ? '<br><strong>Cancelled:</strong> ' + escapeHtml(cancelledAt) : '';
            if (paymentMethod) cancelledInfo += '<br><strong>Payment method:</strong> ' + escapeHtml(paymentMethod) + ' — please check it again.';
            return cancelledInfo;
        }
        if (normalized === 'Accepted' || normalized === 'In Transit') {
            var eta = order.estimatedArrivalAt ? formatDateTime(order.estimatedArrivalAt) : '';
            return eta ? '<br><strong>Estimated arrival:</strong> ' + escapeHtml(eta) : '';
        }
        return '';
    }

    function getStatusStepIndex(status) {
        var normalized = normalizeStatus(status);
        if (normalized === 'Cancelled') return -1;
        return STATUS_STEPS.indexOf(normalized);
    }

    function renderStatusBadges(status) {
        var activeIndex = getStatusStepIndex(status);
        var labels = [
            { key: 'Pending', icon: 'fa-hourglass-start', label: 'Pending' },
            { key: 'Accepted', icon: 'fa-circle-check', label: 'Accepted' },
            { key: 'In Transit', icon: 'fa-truck-fast', label: 'Dispatched (In Transit)' },
            { key: 'Delivered', icon: 'fa-circle-check', label: 'Arrived' }
        ];

        if (activeIndex === -1) {
            return '<span class="badge border py-2 px-3 bg-danger-subtle text-danger fw-bold" style="font-size: 12px;">Cancelled</span>';
        }

        return labels.map(function (step, index) {
            var isActive = index === activeIndex;
            var className = isActive
                ? 'badge border py-2 px-3 bg-dark text-white fw-bold shadow-sm'
                : 'badge border py-2 px-3 text-muted opacity-50';
            var style = isActive ? 'font-size: 12px;' : 'font-size: 12px; background: #e9ecef;';
            var iconClass = step.key === 'In Transit' && isActive ? ' text-warning' : '';
            return (
                '<span class="' + className + '" style="' + style + '">' +
                    '<i class="fa-solid ' + step.icon + ' me-1' + iconClass + '"></i> ' + step.label +
                '</span>'
            );
        }).join('');
    }

    function renderPortfolioStatus(status, estimatedArrivalAt) {
        var normalized = normalizeStatus(status);
        if (normalized === 'Cancelled') {
            return '<span class="badge bg-danger-subtle text-danger border border-danger border-opacity-25" style="font-size: 11px;">Cancelled</span>';
        }
        if (normalized === 'Delivered') {
            return '<span class="badge bg-success-subtle text-success border border-success border-opacity-25" style="font-size: 11px;">Arrived</span>';
        }
        if (normalized === 'Accepted') {
            var eta = estimatedArrivalAt ? formatDateTime(estimatedArrivalAt) : '';
            return '<span class="badge bg-info-subtle text-info border border-info border-opacity-25" style="font-size: 11px;">Accepted</span>' +
                (eta ? '<div class="small text-muted mt-1">ETA: ' + escapeHtml(eta) + '</div>' : '');
        }
        if (normalized === 'In Transit') {
            var transitEta = estimatedArrivalAt ? formatDateTime(estimatedArrivalAt) : '';
            return '<span class="badge bg-warning-subtle text-warning border border-warning border-opacity-25" style="font-size: 11px;">In Transit</span>' +
                (transitEta ? '<div class="small text-muted mt-1">ETA: ' + escapeHtml(transitEta) + '</div>' : '');
        }
        return '<span class="badge bg-warning-subtle text-warning border border-warning border-opacity-25" style="font-size: 11px;">' + escapeHtml(status) + '</span>';
    }

    function renderPortfolioRow(order) {
        var icon = getCategoryIcon(order.category);
        var gradeHtml = order.grade
            ? '<span class="badge bg-light text-dark border" style="font-size: 11px; font-weight: 700;">' + escapeHtml(order.grade) + '</span>'
            : '<span class="text-muted small">—</span>';

        return (
            '<tr class="order-portfolio-row" data-order-id="' + escapeHtml(order.orderId) + '" tabindex="0" role="button">' +
                '<td class="ps-4 py-3 small text-muted">' + formatDate(order.updatedAt) + '</td>' +
                '<td class="fw-bold small text-dark">#' + escapeHtml(order.orderId) + '</td>' +
                '<td>' +
                    '<div class="d-flex align-items-center gap-2">' +
                        '<i class="fa-solid ' + icon + ' text-muted opacity-50" style="font-size: 12px;"></i>' +
                        '<span class="fw-semibold text-dark" style="font-size: 13px;">' + escapeHtml(order.item) + '</span>' +
                    '</div>' +
                '</td>' +
                '<td class="small fw-bold text-dark">' + formatPrice(order.price) + '</td>' +
                '<td>' + renderPortfolioStatus(order.status, order.estimatedArrivalAt) + '</td>' +
                '<td class="pe-4 text-end">' + gradeHtml + '</td>' +
            '</tr>'
        );
    }

    function renderOrderMobileCard(order) {
        var icon = getCategoryIcon(order.category);
        var gradeHtml = order.grade
            ? '<span class="badge bg-light text-dark border">' + escapeHtml(order.grade) + '</span>'
            : '<span class="text-muted small">—</span>';

        return (
            '<article class="order-mobile-card order-portfolio-row" data-order-id="' + escapeHtml(order.orderId) + '" tabindex="0" role="button">' +
                '<div class="order-mobile-card-top">' +
                    '<span class="order-mobile-date">' + formatDate(order.updatedAt) + '</span>' +
                    '<span class="order-mobile-id">#' + escapeHtml(order.orderId) + '</span>' +
                '</div>' +
                '<div class="order-mobile-card-item">' +
                    '<i class="fa-solid ' + icon + ' text-muted"></i>' +
                    '<span class="fw-semibold text-dark">' + escapeHtml(order.item) + '</span>' +
                '</div>' +
                '<div class="order-mobile-card-meta">' +
                    '<span class="order-mobile-price">' + formatPrice(order.price) + '</span>' +
                    renderPortfolioStatus(order.status, order.estimatedArrivalAt) +
                '</div>' +
                '<div class="order-mobile-card-grade">' +
                    '<span class="small text-muted text-uppercase">Grade</span>' +
                    gradeHtml +
                '</div>' +
            '</article>'
        );
    }

    function renderOrderEmptyPanel(type) {
        if (type === 'login') {
            return (
                '<div class="page-empty-panel-inner">' +
                    '<i class="fa-solid fa-truck-fast"></i>' +
                    '<h5>Login required</h5>' +
                    '<p>Login to view your order history and track purchases.</p>' +
                    '<a href="#" class="btn btn-dark btn-sm" data-auth-open="loginModal">Login</a>' +
                '</div>'
            );
        }
        return (
            '<div class="page-empty-panel-inner">' +
                '<i class="fa-solid fa-box-open"></i>' +
                '<h5>No orders yet</h5>' +
                '<p>Complete checkout to see your first order here.</p>' +
                '<a href="products.html" class="btn btn-dark btn-sm">Shop Drops</a>' +
            '</div>'
        );
    }

    function renderActiveOrder(order) {
        var orderIdEl = document.getElementById('activeOrderId');
        var brandEl = document.getElementById('activeOrderBrand');
        var itemEl = document.getElementById('activeOrderItem');
        var detailEl = document.getElementById('activeOrderDetail');
        var iconEl = document.getElementById('activeOrderIcon');
        var badgesEl = document.getElementById('orderStatusBadges');
        var messageEl = document.getElementById('activeOrderStatusMessage');
        var gradeEl = document.getElementById('activeOrderGrade');

        if (!orderIdEl) return;

        if (!order) {
            orderIdEl.textContent = '—';
            if (brandEl) brandEl.textContent = '—';
            if (itemEl) itemEl.textContent = 'No active order';
            if (detailEl) detailEl.textContent = 'Login to view your order tracking.';
            if (iconEl) iconEl.className = 'fa-solid fa-box-open fa-2x text-muted opacity-50';
            if (badgesEl) badgesEl.innerHTML = '';
            if (messageEl) {
                messageEl.innerHTML = '<i class="fa-solid fa-circle-info me-1"></i> Login to view and track your orders.';
            }
            if (gradeEl) gradeEl.textContent = '—';
            return;
        }

        orderIdEl.textContent = '#' + order.orderId;
        brandEl.textContent = order.brand || 'NaNb Select';
        itemEl.textContent = order.item;
        detailEl.textContent = order.detail || 'Verified purchase from NaNb vault.';
        iconEl.className = 'fa-solid ' + getCategoryIcon(order.category) + ' fa-2x text-muted';
        badgesEl.innerHTML = renderStatusBadges(order.status);
        messageEl.innerHTML = '<i class="fa-solid fa-circle-info me-1"></i> ' + escapeHtml(getStatusMessage(order)) + renderArrivalInfo(order);
        if (gradeEl) {
            gradeEl.textContent = order.grade || '100% Passed (Genuine)';
        }
    }

    function renderPortfolio(orders, loggedIn) {
        var tbody = document.getElementById('orderPortfolioBody');
        var emptyPanel = document.getElementById('orderPortfolioEmptyPanel');
        var mobileList = document.getElementById('orderMobileList');
        var tableWrap = document.querySelector('.order-table-wrap');

        if (!loggedIn) {
            if (emptyPanel) {
                emptyPanel.innerHTML = renderOrderEmptyPanel('login');
                emptyPanel.classList.remove('d-none');
            }
            if (tableWrap) tableWrap.classList.add('d-none');
            if (mobileList) {
                mobileList.innerHTML = '';
                mobileList.classList.add('d-none');
            }
            if (tbody) tbody.innerHTML = '';
            return;
        }

        if (!orders.length) {
            if (emptyPanel) {
                emptyPanel.innerHTML = renderOrderEmptyPanel('empty');
                emptyPanel.classList.remove('d-none');
            }
            if (tableWrap) tableWrap.classList.add('d-none');
            if (mobileList) {
                mobileList.innerHTML = '';
                mobileList.classList.add('d-none');
            }
            if (tbody) tbody.innerHTML = '';
            return;
        }

        if (emptyPanel) {
            emptyPanel.innerHTML = '';
            emptyPanel.classList.add('d-none');
        }
        if (tableWrap) tableWrap.classList.remove('d-none');
        if (tbody) tbody.innerHTML = orders.map(renderPortfolioRow).join('');
        if (mobileList) {
            mobileList.innerHTML = orders.map(renderOrderMobileCard).join('');
            mobileList.classList.remove('d-none');
        }
    }

    function updateOrderCount(orders) {
        var countEl = document.querySelector('[data-order-portfolio-count]');
        if (!countEl) return;
        var count = orders.length;
        countEl.textContent = count + (count === 1 ? ' order archived' : ' orders archived');
    }

    async function loadOrders() {
        if (!isLoggedIn()) return [];

        if (typeof NaNbApi !== 'undefined' && typeof NaNbApi.loadOrders === 'function') {
            try {
                return await NaNbApi.loadOrders();
            } catch (error) {
                console.warn('Secure order API unavailable.', error);
                return [];
            }
        }

        return [];
    }

    function pickDefaultOrder(orders) {
        var lastOrderId = null;
        if (window.NaNbApi && typeof NaNbApi.getUserLastOrderId === 'function') {
            lastOrderId = NaNbApi.getUserLastOrderId();
        }

        if (lastOrderId) {
            var lastOrder = orders.find(function (order) {
                return order.orderId.toUpperCase() === lastOrderId.toUpperCase();
            });
            if (lastOrder) return lastOrder;
        }

        return orders.find(function (order) {
            return normalizeStatus(order.status) === 'In Transit';
        }) || orders[0] || null;
    }

    async function trackOrderById(orderId, resultBox) {
        if (!isLoggedIn()) {
            if (resultBox) {
                resultBox.innerHTML =
                    '<div class="alert alert-info border-0 mb-0">' +
                        'Login to track your orders.' +
                    '</div>';
            }
            if (window.NaNbAuth && typeof NaNbAuth.promptLogin === 'function') {
                NaNbAuth.promptLogin('Login required to track orders.');
            }
            renderActiveOrder(null);
            return null;
        }

        if (resultBox) {
            resultBox.innerHTML = '<p class="text-muted mb-0">Searching order...</p>';
        }

        try {
            var data;
            if (typeof NaNbApi !== 'undefined') {
                data = await NaNbApi.trackOrder(orderId);
            } else {
                var match = cachedOrders.find(function (order) {
                    return order.orderId.toUpperCase() === orderId.toUpperCase();
                });
                if (!match) throw new Error('Order not found');
                data = { order: match };
            }

            renderActiveOrder(data.order);
            if (resultBox) {
                var normalized = normalizeStatus(data.order.status);
                var alertClass = normalized === 'Cancelled' ? 'alert-danger' : 'alert-success';
                var extra = '';
                if ((normalized === 'Accepted' || normalized === 'In Transit') && data.order.estimatedArrivalAt) {
                    extra = '<br><span class="small"><strong>Estimated arrival:</strong> ' + escapeHtml(formatDateTime(data.order.estimatedArrivalAt)) + '</span>';
                } else if (normalized === 'Cancelled') {
                    extra = '<br><span class="small">' + escapeHtml(getStatusMessage(data.order)) + '</span>';
                }
                resultBox.innerHTML =
                    '<div class="alert ' + alertClass + ' border-0 mb-0">' +
                        '<strong>Order Found:</strong> ' + escapeHtml(data.order.orderId) + '<br>' +
                        '<span class="small">Status: ' + escapeHtml(data.order.status) + '</span><br>' +
                        '<span class="small">Item: ' + escapeHtml(data.order.item) + '</span>' + extra +
                    '</div>';
            }
            return data.order;
        } catch (error) {
            if (resultBox) {
                resultBox.innerHTML =
                    '<div class="alert alert-warning border-0 mb-0">' +
                        'Order not found in your account. Check your order ID from checkout.' +
                    '</div>';
            }
            return null;
        }
    }

    window.NaNbOrders = {
        refresh: function () {
            if (renderOrderPage) renderOrderPage();
            if (window.NaNbAuth && typeof NaNbAuth.bindTriggers === 'function') {
                NaNbAuth.bindTriggers();
            }
        }
    };

    document.addEventListener('DOMContentLoaded', async function () {
        if (/order\.html/i.test(window.location.pathname) || window.location.href.indexOf('order.html') !== -1) {
            document.body.classList.add('order-page-active');
        }

        var form = document.getElementById('orderTrackForm');
        var resultBox = document.getElementById('orderTrackResult');
        var orderIdInput = document.getElementById('orderIdInput');
        var portfolioBody = document.getElementById('orderPortfolioBody');
        if (!form || !resultBox) return;

        renderOrderPage = async function () {
            var loggedIn = isLoggedIn();

            if (!loggedIn) {
                cachedOrders = [];
                renderPortfolio([], false);
                updateOrderCount([]);
                renderActiveOrder(null);
                if (orderIdInput) orderIdInput.value = '';
                resultBox.innerHTML = '';
                if (window.NaNbAuth && typeof NaNbAuth.bindTriggers === 'function') {
                    NaNbAuth.bindTriggers();
                }
                return;
            }

            cachedOrders = await loadOrders();
            renderPortfolio(cachedOrders, true);
            updateOrderCount(cachedOrders);
            var selectedOrderId = orderIdInput && orderIdInput.value ? orderIdInput.value.trim() : '';
            if (selectedOrderId) {
                var selectedOrder = cachedOrders.find(function (order) {
                    return String(order.orderId || '').toUpperCase() === selectedOrderId.toUpperCase();
                });
                renderActiveOrder(selectedOrder || pickDefaultOrder(cachedOrders));
            } else {
                renderActiveOrder(pickDefaultOrder(cachedOrders));
            }
            if (window.NaNbAuth && typeof NaNbAuth.bindTriggers === 'function') {
                NaNbAuth.bindTriggers();
            }
        };

        await renderOrderPage();

        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            if (!isLoggedIn()) {
                if (window.NaNbAuth && typeof NaNbAuth.promptLogin === 'function') {
                    NaNbAuth.promptLogin('Login required to track orders.');
                }
                return;
            }
            var orderId = orderIdInput ? orderIdInput.value.trim() : '';
            if (!orderId) return;
            await trackOrderById(orderId, resultBox);
        });

        if (portfolioBody) {
            portfolioBody.addEventListener('click', async function (event) {
                if (!isLoggedIn()) return;
                var row = event.target.closest('[data-order-id]');
                if (!row) return;
                var orderId = row.getAttribute('data-order-id');
                if (orderIdInput) orderIdInput.value = orderId;
                await trackOrderById(orderId, resultBox);
            });
        }

        var mobileList = document.getElementById('orderMobileList');
        if (mobileList) {
            mobileList.addEventListener('click', async function (event) {
                if (!isLoggedIn()) return;
                var row = event.target.closest('[data-order-id]');
                if (!row) return;
                var orderId = row.getAttribute('data-order-id');
                if (orderIdInput) orderIdInput.value = orderId;
                await trackOrderById(orderId, resultBox);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        var params = new URLSearchParams(window.location.search);
        var queryOrderId = params.get('order_id');
        if (queryOrderId && isLoggedIn()) {
            orderIdInput.value = queryOrderId;
            await trackOrderById(queryOrderId, resultBox);
        }

        window.setInterval(function () {
            if (document.visibilityState === 'visible' && isLoggedIn() && renderOrderPage) {
                renderOrderPage();
            }
        }, 15000);
    });

    window.addEventListener('nanb:auth-changed', function () {
        if (renderOrderPage) renderOrderPage();
    });

    window.addEventListener('nanb:orders-updated', function () {
        if (renderOrderPage) renderOrderPage();
    });

    window.addEventListener('nanb:lang-changed', function () {
        if (renderOrderPage) renderOrderPage();
        if (window.NaNbI18n) NaNbI18n.apply(document);
    });
})();
