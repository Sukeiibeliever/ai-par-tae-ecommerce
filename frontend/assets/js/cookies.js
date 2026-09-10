(function () {
    var CONSENT_KEY = 'nanb_cookie_consent';

    function getConsent() {
        try { return localStorage.getItem(CONSENT_KEY); } catch (error) { return null; }
    }

    function setConsent(value) {
        try {
            if (value) {
                localStorage.setItem(CONSENT_KEY, value);
            } else {
                localStorage.removeItem(CONSENT_KEY);
            }
        } catch (error) {}
    }

    function isUserLoggedIn() {
        return window.NaNbApi && typeof NaNbApi.isLoggedIn === 'function' && NaNbApi.isLoggedIn();
    }

    function hideBanner() {
        var banner = document.getElementById('nanbCookieBanner');
        if (banner) banner.classList.remove('is-visible');
    }

    function removeBanner() {
        var banner = document.getElementById('nanbCookieBanner');
        if (banner) banner.remove();
    }

    function closeBanner(value) {
        setConsent(value);
        hideBanner();
    }

    function showBanner() {
        if (isUserLoggedIn()) {
            hideBanner();
            return;
        }

        if (getConsent()) return;
        if (document.getElementById('nanbCookieBanner')) {
            document.getElementById('nanbCookieBanner').classList.add('is-visible');
            return;
        }

        document.body.insertAdjacentHTML('beforeend',
            '<div class="nanb-cookie-banner is-visible" id="nanbCookieBanner" role="dialog" aria-live="polite" aria-label="Cookie notice">' +
                '<div class="nanb-cookie-icon"><i class="fa-solid fa-cookie-bite"></i></div>' +
                '<div class="nanb-cookie-copy">' +
                    '<strong>NaNb uses cookies/local storage</strong>' +
                    '<p>We save cart, wishlist, order tracking and cookie choices on your browser so the shop works smoothly.</p>' +
                    '<a href="cookies.html">Read Cookie Policy</a>' +
                '</div>' +
                '<div class="nanb-cookie-actions">' +
                    '<button type="button" class="nanb-cookie-btn ghost" data-cookie-choice="rejected">Reject</button>' +
                    '<button type="button" class="nanb-cookie-btn" data-cookie-choice="accepted">Accept</button>' +
                '</div>' +
            '</div>'
        );

        document.getElementById('nanbCookieBanner').addEventListener('click', function (event) {
            var choice = event.target.closest('[data-cookie-choice]');
            if (!choice) return;
            closeBanner(choice.getAttribute('data-cookie-choice'));
        });
    }

    function handleAuthChange() {
        if (isUserLoggedIn()) {
            hideBanner();
            return;
        }

        setConsent(null);
        removeBanner();
        showBanner();
    }

    document.addEventListener('DOMContentLoaded', function () {
        if (isUserLoggedIn()) {
            hideBanner();
            return;
        }
        showBanner();
    });

    window.addEventListener('nanb:auth-changed', handleAuthChange);

    window.NaNbCookies = {
        getConsent: getConsent,
        setConsent: setConsent,
        showBanner: showBanner,
        hideBanner: hideBanner
    };
})();
