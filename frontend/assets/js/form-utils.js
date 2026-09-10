var NaNbForms = (function () {
    var EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    function t(key, fallback) {
        return window.NaNbI18n && typeof NaNbI18n.t === 'function' ? NaNbI18n.t(key, fallback) : (fallback || key);
    }

    function isValidEmail(email) {
        return EMAIL_PATTERN.test(String(email || '').trim());
    }

    function validateEmailField(input) {
        if (!input) return false;
        var value = input.value.trim();
        if (!value) {
            input.setCustomValidity(t('contact.emailInvalid', 'Email is required.'));
            return false;
        }
        if (!isValidEmail(value)) {
            input.setCustomValidity(t('contact.emailInvalid', 'Please enter a valid email address.'));
            return false;
        }
        input.setCustomValidity('');
        return true;
    }

    function validateFormEmails(form) {
        var valid = true;
        form.querySelectorAll('input[type="email"], [data-validate-email]').forEach(function (input) {
            if (!validateEmailField(input)) valid = false;
        });
        return valid;
    }

    function bindEmailField(input) {
        if (!input || input.dataset.emailBound === 'true') return;
        input.dataset.emailBound = 'true';
        input.addEventListener('input', function () {
            if (input.value.trim()) validateEmailField(input);
            else input.setCustomValidity('');
        });
        input.addEventListener('blur', function () {
            if (input.value.trim()) validateEmailField(input);
        });
    }

    function initEmailFields(root) {
        (root || document).querySelectorAll('input[type="email"], [data-validate-email]').forEach(bindEmailField);
    }

    function initPasswordToggles(root) {
        (root || document).querySelectorAll('.auth-password-wrap').forEach(function (wrap) {
            if (wrap.dataset.toggleBound === 'true') return;
            wrap.dataset.toggleBound = 'true';

            var input = wrap.querySelector('input');
            var button = wrap.querySelector('[data-password-toggle]');
            if (!input || !button) return;

            button.addEventListener('click', function () {
                var show = input.type === 'password';
                input.type = show ? 'text' : 'password';
                button.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
                button.setAttribute('aria-pressed', show ? 'true' : 'false');

                var icon = button.querySelector('i');
                if (icon) {
                    icon.classList.toggle('fa-eye', !show);
                    icon.classList.toggle('fa-eye-slash', show);
                }
            });
        });
    }

    function initContactForm() {
        var form = document.getElementById('contactForm');
        if (!form || form.dataset.contactBound === 'true') return;
        form.dataset.contactBound = 'true';

        var messageBox = form.querySelector('[data-contact-message]');

        function showContactMessage(text, type) {
            if (!messageBox) return;
            messageBox.textContent = text;
            messageBox.className = 'contact-form-message contact-form-message--' + (type || 'error');
            messageBox.classList.remove('d-none');
        }

        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            if (window.NaNbHumanCheck && !NaNbHumanCheck.validate(form)) {
                showContactMessage(t('human.fail'), 'error');
                return;
            }
            validateFormEmails(form);

            if (!form.checkValidity()) {
                form.classList.add('was-validated');
                showContactMessage(t('contact.fixFields'), 'error');
                return;
            }

            var submitBtn = form.querySelector('[type="submit"]');
            var data = new FormData(form);
            try {
                if (!window.NaNbApi || typeof NaNbApi.sendContact !== 'function') {
                    throw new Error('Contact service is unavailable.');
                }
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>' + t('contact.submit');
                }

                var response = await NaNbApi.sendContact({
                    name: data.get('contact_name'),
                    email: data.get('contact_email'),
                    subject: data.get('contact_subject'),
                    message: data.get('contact_message')
                });

                showContactMessage(response.message || t('contact.success'), 'success');
                form.reset();
                form.classList.remove('was-validated');
                if (window.NaNbHumanCheck) NaNbHumanCheck.refreshChallenge(form);
            } catch (error) {
                showContactMessage(error.message || 'Could not send message right now.', 'error');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane me-2"></i>' + t('contact.submit');
                }
            }
        });
    }

    function init(root) {
        initEmailFields(root);
        initPasswordToggles(root);
        initContactForm();
    }

    document.addEventListener('DOMContentLoaded', function () {
        init(document);
    });

    return {
        isValidEmail: isValidEmail,
        validateEmailField: validateEmailField,
        validateFormEmails: validateFormEmails,
        initEmailFields: initEmailFields,
        initPasswordToggles: initPasswordToggles,
        initContactForm: initContactForm,
        init: init
    };
})();
