document.addEventListener('DOMContentLoaded', function () {
    var navbar = document.querySelector('.navbar-hype');

    if (navbar) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 80) {
                navbar.classList.add('navbar-scrolled');
            } else {
                navbar.classList.remove('navbar-scrolled');
            }
        });
    }

    document.querySelectorAll('.scroll-nav-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var targetId = btn.getAttribute('data-scroll-target');
            var itemSelector = btn.getAttribute('data-scroll-item') || '.product-column-card';
            var scrollEl = document.getElementById(targetId);
            if (!scrollEl) return;
            var card = scrollEl.querySelector(itemSelector);
            var gap = 20;
            var scrollAmount = card ? card.offsetWidth + gap : 260;
            scrollEl.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });
    });

    document.addEventListener('click', function (e) {
        var btn = e.target.closest('.product-column-wishlist');
        if (!btn || btn.hasAttribute('data-wishlist-id')) return;

        e.preventDefault();
        e.stopPropagation();

        var icon = btn.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-regular');
            icon.classList.toggle('fa-solid');
            btn.classList.toggle('is-active');
            btn.setAttribute('aria-pressed', btn.classList.contains('is-active') ? 'true' : 'false');
        }
    });

    var revealEls = document.querySelectorAll('.reveal-up');
    if (revealEls.length && 'IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        revealEls.forEach(function (el) { observer.observe(el); });
    } else {
        revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    }
});
document.getElementById("newsletterForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const input = e.target.querySelector('input[type="email"], input');
    const email = input ? input.value.trim() : '';
    const button = e.target.querySelector('[type="submit"]');

    try {
        if (!window.NaNbApi || typeof NaNbApi.subscribeNewsletter !== 'function') {
            throw new Error('Newsletter service is unavailable.');
        }
        if (button) button.disabled = true;
        const result = await NaNbApi.subscribeNewsletter(email);
        alert(result.message || (window.NaNbI18n ? NaNbI18n.t('newsletter.thanks') : "Thanks! You'll be notified about future drops."));
        e.target.reset();
    } catch (error) {
        alert(error.message || 'Could not subscribe right now.');
    } finally {
        if (button) button.disabled = false;
    }
});
