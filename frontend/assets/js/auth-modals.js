(function () {
    var modalHTML = `
    <div class="modal fade auth-modal" id="loginModal" tabindex="-1" aria-labelledby="loginModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered auth-modal-dialog">
            <div class="modal-content auth-modal-content">
                <div class="modal-header auth-modal-header">
                    <div>
                        <span class="auth-modal-tag" data-i18n="auth.welcomeBack">Welcome Back</span>
                        <h2 class="auth-modal-title" id="loginModalLabel" data-i18n="auth.login">Login</h2>
                    </div>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body auth-modal-body">
                    <div class="auth-form-message d-none" data-auth-message></div>
                    <form id="loginForm" class="auth-form" data-human-check novalidate>
                        <div class="mb-3">
                            <label for="loginEmail" class="form-label" data-i18n="auth.email">Email</label>
                            <input type="email" class="form-control auth-input" id="loginEmail" name="email" placeholder="you@email.com" data-i18n-placeholder="auth.emailPlaceholder" data-validate-email required>
                            <div class="auth-field-feedback" data-i18n="contact.emailInvalid">Please enter a valid email address.</div>
                        </div>
                        <div class="mb-3">
                            <label for="loginPassword" class="form-label" data-i18n="auth.password">Password</label>
                            <div class="auth-password-wrap">
                                <input type="password" class="form-control auth-input" id="loginPassword" name="password" placeholder="Enter password" data-i18n-placeholder="auth.passwordPlaceholder" required>
                                <button type="button" class="auth-password-toggle" data-password-toggle aria-label="Show password" aria-pressed="false">
                                    <i class="fa-regular fa-eye"></i>
                                </button>
                            </div>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="rememberMe">
                                <label class="form-check-label auth-check-label" for="rememberMe" data-i18n="auth.remember">Remember me</label>
                            </div>
                            <a href="login.html" class="auth-link-small" data-i18n="auth.fullPage">Full page</a>
                        </div>
                        <button type="submit" class="btn btn-hype-primary w-100 auth-submit-btn" data-i18n="auth.login">Login</button>
                    </form>
                    <p class="auth-switch-text text-center mt-4 mb-0">
                        <span data-i18n="auth.noAccount">Don't have an account?</span>
                        <a href="signup.html" class="auth-switch-link" data-auth-switch="signupModal" data-i18n="auth.signUpLink">Sign up</a>
                    </p>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade auth-modal" id="signupModal" tabindex="-1" aria-labelledby="signupModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered auth-modal-dialog">
            <div class="modal-content auth-modal-content">
                <div class="modal-header auth-modal-header">
                    <div>
                        <span class="auth-modal-tag" data-i18n="auth.join">Join NaNb</span>
                        <h2 class="auth-modal-title" id="signupModalLabel" data-i18n="auth.signup">Sign Up</h2>
                    </div>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body auth-modal-body">
                    <div class="auth-form-message d-none" data-auth-message></div>
                    <form id="signupForm" class="auth-form" data-human-check novalidate>
                        <div class="mb-3">
                            <label for="signupName" class="form-label" data-i18n="auth.fullName">Full Name</label>
                            <input type="text" class="form-control auth-input" id="signupName" placeholder="Your name" data-i18n-placeholder="auth.namePlaceholder" required>
                        </div>
                        <div class="mb-3">
                            <label for="signupEmail" class="form-label" data-i18n="auth.email">Email</label>
                            <input type="email" class="form-control auth-input" id="signupEmail" name="email" placeholder="you@email.com" data-i18n-placeholder="auth.emailPlaceholder" data-validate-email required>
                            <div class="auth-field-feedback" data-i18n="contact.emailInvalid">Please enter a valid email address.</div>
                        </div>
                        <div class="mb-3">
                            <label for="signupPassword" class="form-label" data-i18n="auth.password">Password</label>
                            <div class="auth-password-wrap">
                                <input type="password" class="form-control auth-input" id="signupPassword" name="password" placeholder="Create password" data-i18n-placeholder="auth.createPassword" minlength="8" required>
                                <button type="button" class="auth-password-toggle" data-password-toggle aria-label="Show password" aria-pressed="false">
                                    <i class="fa-regular fa-eye"></i>
                                </button>
                            </div>
                        </div>
                        <div class="mb-4">
                            <label for="signupConfirm" class="form-label" data-i18n="auth.confirmPassword">Confirm Password</label>
                            <div class="auth-password-wrap">
                                <input type="password" class="form-control auth-input" id="signupConfirm" name="confirmPassword" placeholder="Confirm password" data-i18n-placeholder="auth.confirmPlaceholder" required>
                                <button type="button" class="auth-password-toggle" data-password-toggle aria-label="Show password" aria-pressed="false">
                                    <i class="fa-regular fa-eye"></i>
                                </button>
                            </div>
                        </div>
                        <button type="submit" class="btn btn-hype-primary w-100 auth-submit-btn" data-i18n="auth.createAccount">Create Account</button>
                    </form>
                    <p class="auth-switch-text text-center mt-4 mb-0">
                        <span data-i18n="auth.haveAccount">Already have an account?</span>
                        <a href="login.html" class="auth-switch-link" data-auth-switch="loginModal" data-i18n="auth.loginLink">Login</a>
                    </p>
                </div>
            </div>
        </div>
    </div>`;

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function injectModals() {
        if (document.getElementById('loginModal')) return;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    function openModal(id) {
        var el = document.getElementById(id);
        if (!el || !window.bootstrap) return;
        bootstrap.Modal.getOrCreateInstance(el).show();
    }

    function closeModal(id) {
        var el = document.getElementById(id);
        if (!el || !window.bootstrap) return;
        var modal = bootstrap.Modal.getInstance(el);
        if (modal) modal.hide();
    }

    function switchModal(fromId, toId) {
        var fromEl = document.getElementById(fromId);
        var toEl = document.getElementById(toId);
        if (!fromEl || !toEl || !window.bootstrap) return;

        var fromModal = bootstrap.Modal.getInstance(fromEl);
        if (fromModal) {
            fromEl.addEventListener('hidden.bs.modal', function handler() {
                fromEl.removeEventListener('hidden.bs.modal', handler);
                openModal(toId);
            });
            fromModal.hide();
        } else {
            openModal(toId);
        }
    }

    function getMessageBox(form) {
        if (!form) return null;
        var container = form.closest('.auth-page-card') || form.closest('.auth-modal-body');
        if (container) {
            return container.querySelector('[data-auth-message]');
        }
        return form.parentElement ? form.parentElement.querySelector('[data-auth-message]') : null;
    }

    function showMessage(form, message, type) {
        var box = getMessageBox(form);
        if (!box) return;
        box.textContent = message;
        box.className = 'auth-form-message auth-form-message--' + (type || 'error');
        box.classList.remove('d-none');
    }

    function clearMessage(form) {
        var box = getMessageBox(form);
        if (!box) return;
        box.textContent = '';
        box.className = 'auth-form-message d-none';
    }

    function setSubmitting(form, isSubmitting, defaultLabel) {
        var button = form.querySelector('[type="submit"]');
        if (!button) return;
        button.disabled = isSubmitting;
        if (isSubmitting) {
            button.dataset.defaultLabel = button.dataset.defaultLabel || button.textContent;
            button.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Please wait...';
        } else {
            button.textContent = defaultLabel || button.dataset.defaultLabel || 'Submit';
        }
    }

    function getRedirectTarget() {
        var params = new URLSearchParams(window.location.search);
        return params.get('redirect') || 'index.html';
    }

    function finishAuthSuccess(form, authResponse, remember, options) {
        var user = authResponse && authResponse.user ? authResponse.user : null;
        if (window.NaNbApi && user && authResponse.token) {
            NaNbApi.setSession(authResponse, remember);
        }
        updateAuthUI();
        form.reset();
        form.classList.remove('was-validated');

        if (options && options.modalId) {
            closeModal(options.modalId);
        }

        if (window.NaNbCart && typeof NaNbCart.refresh === 'function') {
            NaNbCart.refresh();
        }
        if (window.NaNbWishlist && typeof NaNbWishlist.refresh === 'function') {
            NaNbWishlist.refresh();
        }
        if (window.NaNbOrders && typeof NaNbOrders.refresh === 'function') {
            NaNbOrders.refresh();
        }

        if (options && options.redirect) {
            window.location.href = options.redirect;
            return;
        }

        if (document.body.classList.contains('auth-page')) {
            window.location.href = getRedirectTarget();
        }
    }

    function i18n(key, fallback) {
        return window.NaNbI18n && typeof NaNbI18n.t === 'function' ? NaNbI18n.t(key, fallback) : (fallback || key);
    }

    async function handleLogin(form, options) {
        clearMessage(form);
        if (window.NaNbHumanCheck && !NaNbHumanCheck.validate(form)) {
            showMessage(form, i18n('human.fail'), 'error');
            return;
        }
        if (window.NaNbForms) NaNbForms.validateFormEmails(form);
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            showMessage(form, i18n('auth.loginFail'), 'error');
            return;
        }

        var payload = {
            email: form.querySelector('[name="email"], #loginEmail, #loginPageEmail').value.trim(),
            password: form.querySelector('[name="password"], #loginPassword, #loginPagePassword').value
        };
        var rememberEl = form.querySelector('#rememberMe') || form.querySelector('#loginPageRemember');
        var remember = rememberEl ? rememberEl.checked : false;
        setSubmitting(form, true, i18n('auth.login'));

        try {
            if (!window.NaNbApi) {
                throw new Error(i18n('auth.serviceUnavailable'));
            }
            var response = await NaNbApi.login(payload);
            if (!response || !response.user) {
                throw new Error(response.message || i18n('auth.invalidCredentials'));
            }
            showMessage(form, response.message || i18n('auth.loginSuccess'), 'success');
            setTimeout(function () {
                finishAuthSuccess(form, response, remember, options);
            }, 350);
        } catch (error) {
            showMessage(form, error.message || i18n('auth.invalidCredentials'), 'error');
        } finally {
            setSubmitting(form, false, i18n('auth.login'));
        }
    }

    async function handleSignup(form, options) {
        clearMessage(form);
        if (window.NaNbHumanCheck && !NaNbHumanCheck.validate(form)) {
            showMessage(form, i18n('human.fail'), 'error');
            return;
        }
        if (window.NaNbForms) NaNbForms.validateFormEmails(form);
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            showMessage(form, i18n('auth.signupFail'), 'error');
            return;
        }

        var password = form.querySelector('[name="password"], #signupPassword, #signupPagePassword').value;
        var confirm = form.querySelector('[name="confirmPassword"], #signupConfirm, #signupPageConfirm').value;
        var confirmInput = form.querySelector('#signupConfirm, #signupPageConfirm');

        if (password !== confirm) {
            if (confirmInput) confirmInput.setCustomValidity('Passwords do not match');
            form.classList.add('was-validated');
            showMessage(form, i18n('auth.passwordMismatch'), 'error');
            return;
        }
        if (confirmInput) confirmInput.setCustomValidity('');

        var payload = {
            name: form.querySelector('[name="name"], #signupName, #signupPageName').value.trim(),
            email: form.querySelector('[name="email"], #signupEmail, #signupPageEmail').value.trim(),
            password: password
        };

        setSubmitting(form, true, i18n('auth.createAccount'));

        try {
            if (!window.NaNbApi) {
                throw new Error(i18n('auth.serviceUnavailable'));
            }
            var response = await NaNbApi.signup(payload);
            if (!response || !response.user) {
                throw new Error(response.message || i18n('auth.signupFail'));
            }
            showMessage(form, response.message || i18n('auth.signupSuccess'), 'success');
            setTimeout(function () {
                finishAuthSuccess(form, response, true, options);
            }, 350);
        } catch (error) {
            showMessage(form, error.message || 'Could not create account.', 'error');
        } finally {
            setSubmitting(form, false, i18n('auth.createAccount'));
        }
    }

    function bindAuthTriggers() {
        document.querySelectorAll('[data-auth-open]').forEach(function (trigger) {
            if (trigger.dataset.authBound === 'true') return;
            trigger.dataset.authBound = 'true';
            trigger.addEventListener('click', function (e) {
                e.preventDefault();
                openModal(trigger.getAttribute('data-auth-open'));
            });
        });

        document.querySelectorAll('[data-auth-switch]').forEach(function (link) {
            if (link.dataset.authSwitchBound === 'true') return;
            if (link.getAttribute('href') && link.getAttribute('href').indexOf('.html') !== -1) return;
            link.dataset.authSwitchBound = 'true';
            link.addEventListener('click', function (e) {
                e.preventDefault();
                var target = link.getAttribute('data-auth-switch');
                var current = link.closest('.auth-modal');
                switchModal(current ? current.id : '', target);
            });
        });

        document.querySelectorAll('[data-auth-logout]').forEach(function (button) {
            if (button.dataset.authLogoutBound === 'true') return;
            button.dataset.authLogoutBound = 'true';
            button.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                if (window.NaNbApi) NaNbApi.logout();
                closeProfileMenus();
                updateAuthUI();
                if (window.NaNbCart && typeof NaNbCart.refresh === 'function') {
                    NaNbCart.refresh();
                }
                if (window.NaNbWishlist && typeof NaNbWishlist.refresh === 'function') {
                    NaNbWishlist.refresh();
                }
                if (window.NaNbOrders && typeof NaNbOrders.refresh === 'function') {
                    NaNbOrders.refresh();
                }
            });
        });

        document.querySelectorAll('[data-auth-profile-toggle]').forEach(function (trigger) {
            if (trigger.dataset.authProfileBound === 'true') return;
            trigger.dataset.authProfileBound = 'true';
            trigger.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var menu = trigger.closest('.nav-profile-menu');
                if (!menu) return;
                var isOpen = menu.classList.contains('is-open');
                closeProfileMenus();
                if (!isOpen) {
                    menu.classList.add('is-open');
                    trigger.setAttribute('aria-expanded', 'true');
                }
            });
        });
    }

    function closeProfileMenus() {
        document.querySelectorAll('.nav-profile-menu.is-open').forEach(function (menu) {
            menu.classList.remove('is-open');
            var trigger = menu.querySelector('[data-auth-profile-toggle]');
            if (trigger) trigger.setAttribute('aria-expanded', 'false');
        });
    }

    function bindForms() {
        var loginForm = document.getElementById('loginForm');
        var signupForm = document.getElementById('signupForm');
        var loginPageForm = document.getElementById('loginPageForm');
        var signupPageForm = document.getElementById('signupPageForm');

        if (loginForm && loginForm.dataset.authBound !== 'true') {
            loginForm.dataset.authBound = 'true';
            loginForm.addEventListener('submit', function (e) {
                e.preventDefault();
                handleLogin(loginForm, { modalId: 'loginModal' });
            });
        }

        if (signupForm && signupForm.dataset.authBound !== 'true') {
            signupForm.dataset.authBound = 'true';
            signupForm.addEventListener('submit', function (e) {
                e.preventDefault();
                handleSignup(signupForm, { modalId: 'signupModal' });
            });
        }

        if (loginPageForm && loginPageForm.dataset.authBound !== 'true') {
            loginPageForm.dataset.authBound = 'true';
            loginPageForm.addEventListener('submit', function (e) {
                e.preventDefault();
                handleLogin(loginPageForm, { redirect: getRedirectTarget() });
            });
        }

        if (signupPageForm && signupPageForm.dataset.authBound !== 'true') {
            signupPageForm.dataset.authBound = 'true';
            signupPageForm.addEventListener('submit', function (e) {
                e.preventDefault();
                handleSignup(signupPageForm, { redirect: getRedirectTarget() });
            });
        }
    }

    function updateAuthUI() {
        var user = window.NaNbApi ? NaNbApi.getCurrentUser() : null;

        document.querySelectorAll('.nav-auth-buttons').forEach(function (nav) {
            if (user) {
                var firstName = escapeHtml(user.name.split(' ')[0].toUpperCase());
                var fullName = escapeHtml(user.name);
                var email = escapeHtml(user.email || '');
                nav.innerHTML =
                    '<div class="nav-profile-menu">' +
                        '<button type="button" class="nav-profile-trigger" data-auth-profile-toggle aria-expanded="false" aria-label="Account menu">' +
                            '<i class="fa-solid fa-user"></i>' +
                            '<span class="nav-profile-name">' + firstName + '</span>' +
                            '<i class="fa-solid fa-chevron-down nav-profile-caret"></i>' +
                        '</button>' +
                        '<div class="nav-profile-dropdown">' +
                            '<div class="nav-profile-dropdown-head">' +
                                '<strong>' + fullName + '</strong>' +
                                (email ? '<small>' + email + '</small>' : '') +
                            '</div>' +
                            '<button type="button" class="nav-profile-logout" data-auth-logout>' +
                                '<i class="fa-solid fa-right-from-bracket"></i> <span data-i18n="nav.logout">Logout</span>' +
                            '</button>' +
                        '</div>' +
                    '</div>';
            } else {
                nav.innerHTML =
                    '<a class="btn btn-nav-login" href="#" data-auth-open="loginModal">Login</a>' +
                    '<a class="btn btn-nav-signup" href="#" data-auth-open="signupModal">Signup</a>';
            }
        });

        bindAuthTriggers();
        if (window.NaNbI18n) NaNbI18n.apply(document);
    }

    function autoOpenFromPage() {
        var openTarget = document.documentElement.getAttribute('data-auth-open');
        if (openTarget === 'login') openModal('loginModal');
        if (openTarget === 'signup') openModal('signupModal');
    }

    function showAuthRequiredToast(message) {
        var oldToast = document.getElementById('nanbAuthToast');
        if (oldToast) oldToast.remove();

        document.body.insertAdjacentHTML('beforeend',
            '<div class="nanb-auth-toast" id="nanbAuthToast" role="alert">' +
                '<i class="fa-solid fa-user-lock"></i>' +
                '<span>' + escapeHtml(message || 'Please login to purchase items.') + '</span>' +
            '</div>'
        );

        var toast = document.getElementById('nanbAuthToast');
        requestAnimationFrame(function () {
            if (toast) toast.classList.add('is-visible');
        });

        setTimeout(function () {
            if (!toast) return;
            toast.classList.remove('is-visible');
            setTimeout(function () { if (toast.parentNode) toast.remove(); }, 250);
        }, 3200);
    }

    function promptLogin(message) {
        showAuthRequiredToast(message);
        openModal('loginModal');
    }

    document.addEventListener('DOMContentLoaded', function () {
        injectModals();
        if (window.NaNbHumanCheck) {
            NaNbHumanCheck.mountForm(document.getElementById('loginForm'));
            NaNbHumanCheck.mountForm(document.getElementById('signupForm'));
        }
        if (window.NaNbI18n) NaNbI18n.apply(document);
        if (window.NaNbForms) NaNbForms.init(document);
        bindForms();
        bindAuthTriggers();
        updateAuthUI();
        autoOpenFromPage();
    });

    window.addEventListener('nanb:lang-changed', function () {
        if (window.NaNbI18n) NaNbI18n.apply(document);
        updateAuthUI();
    });

    document.addEventListener('click', closeProfileMenus);
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeProfileMenus();
    });

    window.addEventListener('nanb:auth-changed', updateAuthUI);

    window.addEventListener('nanb:auth-required', function (event) {
        var message = event.detail && event.detail.message;
        promptLogin(message);
    });

    window.NaNbAuth = {
        updateUI: updateAuthUI,
        openLogin: function () { openModal('loginModal'); },
        openSignup: function () { openModal('signupModal'); },
        promptLogin: promptLogin,
        bindTriggers: bindAuthTriggers,
        isLoggedIn: function () {
            return window.NaNbApi && typeof NaNbApi.isLoggedIn === 'function' && NaNbApi.isLoggedIn();
        }
    };
})();
