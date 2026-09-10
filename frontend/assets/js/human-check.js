var NaNbHumanCheck = (function () {
    function t(key, fallback) {
        if (window.NaNbI18n && typeof NaNbI18n.t === 'function') {
            return NaNbI18n.t(key, fallback);
        }
        return fallback || key;
    }

    function randomChallenge() {
        var a = Math.floor(Math.random() * 9) + 1;
        var b = Math.floor(Math.random() * 9) + 1;
        return { a: a, b: b, answer: a + b };
    }

    function buildMarkup(challenge) {
        return (
            '<div class="nanb-human-check" data-human-check-box>' +
                '<label class="nanb-human-check-label" data-i18n="human.label">Human verification</label>' +
                '<div class="nanb-human-check-row">' +
                    '<span class="nanb-human-check-question" aria-live="polite">' +
                        escapeHtml(String(challenge.a)) + ' + ' + escapeHtml(String(challenge.b)) + ' = ?' +
                    '</span>' +
                    '<input type="number" class="form-control nanb-human-check-input" data-human-check-input inputmode="numeric" autocomplete="off" required>' +
                    '<button type="button" class="nanb-human-check-refresh" data-human-check-refresh aria-label="Refresh challenge">' +
                        '<i class="fa-solid fa-rotate-right"></i>' +
                    '</button>' +
                '</div>' +
                '<div class="nanb-human-check-hint" data-i18n="human.hint">Solve the math problem to prove you are human.</div>' +
            '</div>'
        );
    }

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function refreshChallenge(form) {
        if (!form) return;
        var challenge = randomChallenge();
        form.dataset.humanAnswer = String(challenge.answer);
        var box = form.querySelector('[data-human-check-box]');
        if (!box) return;
        var question = box.querySelector('.nanb-human-check-question');
        var input = box.querySelector('[data-human-check-input]');
        if (question) {
            question.textContent = challenge.a + ' + ' + challenge.b + ' = ?';
        }
        if (input) {
            input.value = '';
            input.setCustomValidity('');
        }
    }

    function mountForm(form) {
        if (!form || form.dataset.humanCheckMounted === 'true') return;
        form.dataset.humanCheckMounted = 'true';

        var submitBtn = form.querySelector('[type="submit"]');
        if (!submitBtn) return;

        var challenge = randomChallenge();
        form.dataset.humanAnswer = String(challenge.answer);
        submitBtn.insertAdjacentHTML('beforebegin', buildMarkup(challenge));

        var refreshBtn = form.querySelector('[data-human-check-refresh]');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', function () {
                refreshChallenge(form);
            });
        }

        var input = form.querySelector('[data-human-check-input]');
        if (input) {
            input.addEventListener('input', function () {
                input.setCustomValidity('');
            });
        }

        if (window.NaNbI18n && typeof NaNbI18n.apply === 'function') {
            NaNbI18n.apply(form);
        }
    }

    function validate(form) {
        if (!form || !form.querySelector('[data-human-check-input]')) return true;

        var input = form.querySelector('[data-human-check-input]');
        var expected = parseInt(form.dataset.humanAnswer, 10);
        var given = parseInt(String(input.value || '').trim(), 10);

        if (!Number.isFinite(given) || given !== expected) {
            input.setCustomValidity(t('human.fail', 'Incorrect answer. Please try again.'));
            input.reportValidity();
            refreshChallenge(form);
            return false;
        }

        input.setCustomValidity('');
        return true;
    }

    function init(root) {
        (root || document).querySelectorAll('form[data-human-check]').forEach(mountForm);
    }

    document.addEventListener('DOMContentLoaded', function () {
        init(document);
    });

    window.addEventListener('nanb:lang-changed', function () {
        document.querySelectorAll('form[data-human-check] [data-human-check-box]').forEach(function (box) {
            if (window.NaNbI18n && typeof NaNbI18n.apply === 'function') {
                NaNbI18n.apply(box);
            }
        });
    });

    return {
        init: init,
        mountForm: mountForm,
        validate: validate,
        refreshChallenge: refreshChallenge
    };
})();
