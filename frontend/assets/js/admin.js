(function () {
    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function formatPrice(price) {
        return Number(price || 0).toLocaleString();
    }


    function formatDateTime(value) {
        var date = new Date(value);
        if (Number.isNaN(date.getTime())) return '';
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    }

    function renderOrderActions(order) {
        var status = String(order.status || 'Pending');
        var orderId = escapeHtml(order.orderId || '');
        var acceptButton = status === 'Pending'
            ? '<button type="button" class="btn btn-success btn-sm fw-bold" data-admin-order-action="accept" data-order-id="' + orderId + '"><i class="fa-solid fa-check me-1"></i>Accept</button>'
            : '';
        var deleteButton = status === 'Delivered'
            ? '<button type="button" class="btn btn-outline-secondary btn-sm" disabled title="Delivered orders cannot be cancelled"><i class="fa-solid fa-trash me-1"></i>Delete</button>'
            : '<button type="button" class="btn btn-outline-danger btn-sm" data-admin-order-action="delete" data-order-id="' + orderId + '"><i class="fa-solid fa-trash me-1"></i>Delete</button>';
        return '<div class="d-flex justify-content-end gap-2 flex-wrap">' + acceptButton + deleteButton + '</div>';
    }

    function isAdminLoggedIn() {
        return !!(window.NaNbApi && typeof NaNbApi.isAdminLoggedIn === 'function' && NaNbApi.isAdminLoggedIn());
    }

    function showLogin() {
        document.getElementById('adminLoginSection').classList.remove('d-none');
        document.getElementById('adminDashboardSection').classList.add('d-none');
        document.getElementById('adminLogoutBtn').classList.add('d-none');
        document.getElementById('adminBackBtn').classList.add('d-none');
    }

    function showDashboard() {
        document.getElementById('adminLoginSection').classList.add('d-none');
        document.getElementById('adminDashboardSection').classList.remove('d-none');
        document.getElementById('adminLogoutBtn').classList.remove('d-none');
        document.getElementById('adminBackBtn').classList.remove('d-none');
    }

    function renderEmptyRow(colspan, message) {
        return '<tr><td colspan="' + colspan + '" class="text-center text-muted py-4">' + escapeHtml(message) + '</td></tr>';
    }

    async function renderDashboard() {
        if (!window.NaNbApi || typeof NaNbApi.loadAdminDashboard !== 'function') {
            throw new Error('Admin API is unavailable.');
        }

        var data = await NaNbApi.loadAdminDashboard();
        var products = data.products || [];
        var users = data.users || [];
        var orders = data.orders || [];
        var subscribers = data.subscribers || [];

        document.getElementById('statProducts').textContent = products.length;
        document.getElementById('statUsers').textContent = users.length;
        document.getElementById('statOrders').textContent = orders.length;
        document.getElementById('statNewsletter').textContent = subscribers.length;

        document.getElementById('adminProductBadge').textContent = products.length + ' items';
        document.getElementById('adminOrderBadge').textContent = orders.length + ' orders';
        document.getElementById('adminUserBadge').textContent = users.length + ' users';
        document.getElementById('adminNewsletterBadge').textContent = subscribers.length + ' emails';

        var productsBody = document.getElementById('adminProductsBody');
        if (products.length) {
            productsBody.innerHTML = products.slice(0, 50).map(function (product) {
                return (
                    '<tr>' +
                        '<td class="ps-3 small text-muted">' + escapeHtml(product.id) + '</td>' +
                        '<td class="fw-semibold">' + escapeHtml(product.name) + '</td>' +
                        '<td>' + escapeHtml(product.brand || '—') + '</td>' +
                        '<td class="text-capitalize">' + escapeHtml(product.category || '—') + '</td>' +
                        '<td class="pe-3 text-end fw-bold">' + formatPrice(product.price) + '</td>' +
                    '</tr>'
                );
            }).join('');
            if (products.length > 50) {
                productsBody.innerHTML += renderEmptyRow(5, 'Showing first 50 of ' + products.length + ' products.');
            }
        } else {
            productsBody.innerHTML = renderEmptyRow(5, 'No products found.');
        }

        var ordersBody = document.getElementById('adminOrdersBody');
        if (orders.length) {
            ordersBody.innerHTML = orders.slice(0, 30).map(function (order) {
                var eta = order.estimatedArrivalAt ? formatDateTime(order.estimatedArrivalAt) : '';
                return (
                    '<tr>' +
                        '<td class="ps-3 fw-bold">#' + escapeHtml(order.orderId || '—') + '</td>' +
                        '<td class="small">' + escapeHtml(order.customerEmail || '—') + '</td>' +
                        '<td>' + escapeHtml(order.item || '—') + '</td>' +
                        '<td><span class="badge bg-light text-dark border">' + escapeHtml(order.status || 'Pending') + '</span>' +
                            (eta ? '<div class="small text-muted mt-1">ETA: ' + escapeHtml(eta) + '</div>' : '') +
                        '</td>' +
                        '<td class="fw-bold">' + formatPrice(order.price) + '</td>' +
                        '<td class="pe-3 text-end">' + renderOrderActions(order) + '</td>' +
                    '</tr>'
                );
            }).join('');
        } else {
            ordersBody.innerHTML = renderEmptyRow(6, 'No orders yet.');
        }

        var usersBody = document.getElementById('adminUsersBody');
        if (users.length) {
            usersBody.innerHTML = users.map(function (user) {
                return (
                    '<tr>' +
                        '<td class="ps-3 fw-semibold">' + escapeHtml(user.name || '—') + '</td>' +
                        '<td>' + escapeHtml(user.email || '—') + '</td>' +
                        '<td class="pe-3 text-end small text-muted">' + escapeHtml(user.role === 'admin' ? 'Admin' : 'Customer') + '</td>' +
                    '</tr>'
                );
            }).join('');
        } else {
            usersBody.innerHTML = renderEmptyRow(3, 'No registered users yet.');
        }

        var newsletterBody = document.getElementById('adminNewsletterBody');
        if (subscribers.length) {
            newsletterBody.innerHTML = subscribers.map(function (entry, index) {
                return (
                    '<tr>' +
                        '<td class="ps-3 text-muted">' + (index + 1) + '</td>' +
                        '<td class="pe-3">' + escapeHtml(entry.email || entry) + '</td>' +
                    '</tr>'
                );
            }).join('');
        } else {
            newsletterBody.innerHTML = renderEmptyRow(2, 'No newsletter subscribers yet.');
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        var loginForm = document.getElementById('adminLoginForm');
        var loginError = document.getElementById('adminLoginError');
        var logoutBtn = document.getElementById('adminLogoutBtn');
        var refreshBtn = document.getElementById('adminRefreshBtn');

        async function openDashboard() {
            try {
                showDashboard();
                await renderDashboard();
            } catch (error) {
                if (window.NaNbApi && typeof NaNbApi.adminLogout === 'function') NaNbApi.adminLogout();
                showLogin();
                loginError.textContent = error.message || 'Could not load admin dashboard.';
                loginError.classList.remove('d-none');
            }
        }

        if (isAdminLoggedIn()) openDashboard();
        else showLogin();

        loginForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            var username = document.getElementById('adminUsername').value.trim().toLowerCase();
            var password = document.getElementById('adminPassword').value;
            var submitBtn = loginForm.querySelector('[type="submit"]');
            loginError.classList.add('d-none');

            try {
                submitBtn.disabled = true;
                if (!window.NaNbApi || typeof NaNbApi.adminLogin !== 'function') throw new Error('Admin API is unavailable.');
                await NaNbApi.adminLogin(username, password);
                await openDashboard();
            } catch (error) {
                loginError.textContent = error.message || 'Invalid admin credentials.';
                loginError.classList.remove('d-none');
            } finally {
                submitBtn.disabled = false;
            }
        });

        logoutBtn.addEventListener('click', function () {
            if (window.NaNbApi && typeof NaNbApi.adminLogout === 'function') NaNbApi.adminLogout();
            loginForm.reset();
            showLogin();
        });

        var ordersBody = document.getElementById('adminOrdersBody');
        if (ordersBody) {
            ordersBody.addEventListener('click', async function (event) {
                var button = event.target.closest('[data-admin-order-action]');
                if (!button) return;

                var action = button.getAttribute('data-admin-order-action');
                var orderId = button.getAttribute('data-order-id');
                if (!orderId) return;

                if (action === 'delete') {
                    var confirmed = window.confirm('Delete this order from the admin list? The customer will see it as Cancelled and the reserved stock will be restored.');
                    if (!confirmed) return;
                }

                try {
                    button.disabled = true;
                    if (action === 'accept') {
                        if (!NaNbApi.acceptAdminOrder) throw new Error('Accept order API is unavailable.');
                        await NaNbApi.acceptAdminOrder(orderId);
                    } else if (action === 'delete') {
                        if (!NaNbApi.deleteAdminOrder) throw new Error('Delete order API is unavailable.');
                        await NaNbApi.deleteAdminOrder(orderId);
                    }
                    await renderDashboard();
                } catch (error) {
                    window.alert(error.message || 'Could not update this order.');
                    button.disabled = false;
                }
            });
        }

        refreshBtn.addEventListener('click', async function () {
            try {
                refreshBtn.disabled = true;
                await renderDashboard();
            } catch (error) {
                if (window.NaNbApi && typeof NaNbApi.adminLogout === 'function') NaNbApi.adminLogout();
                showLogin();
                loginError.textContent = error.message || 'Admin session expired.';
                loginError.classList.remove('d-none');
            } finally {
                refreshBtn.disabled = false;
            }
        });
    });

    window.NaNbAdmin = {
        isLoggedIn: isAdminLoggedIn,
        refresh: renderDashboard
    };
})();
