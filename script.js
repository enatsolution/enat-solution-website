// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Mobile menu toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Contact form submission - Netlify compatible
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.querySelector('.contact-form');
    const timestampField = document.getElementById('timestamp');
    const userAgentField = document.getElementById('user-agent');

    // Set initial values
    if (timestampField) {
        timestampField.value = new Date().toISOString();
    }

    if (userAgentField) {
        userAgentField.value = navigator.userAgent;
    }

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            const form = this;
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;

            // Get form fields for validation
            const nameField = form.querySelector('input[name="name"]');
            const emailField = form.querySelector('input[name="email"]');
            const phoneField = form.querySelector('input[name="phone"]');
            const messageField = form.querySelector('textarea[name="message"]');

            // Clear any previous error styling
            [nameField, emailField, phoneField, messageField].forEach(field => {
                if (field) {
                    field.style.borderColor = '';
                    field.style.backgroundColor = '';
                }
            });

            // Validation functions
            function showError(field, message) {
                field.style.borderColor = '#ef4444';
                field.style.backgroundColor = '#fef2f2';
                field.focus();

                // Show error message
                let errorDiv = field.parentNode.querySelector('.error-message');
                if (!errorDiv) {
                    errorDiv = document.createElement('div');
                    errorDiv.className = 'error-message';
                    errorDiv.style.color = '#ef4444';
                    errorDiv.style.fontSize = '0.875rem';
                    errorDiv.style.marginTop = '0.25rem';
                    field.parentNode.appendChild(errorDiv);
                }
                errorDiv.textContent = message;

                // Remove error message after 5 seconds
                setTimeout(() => {
                    if (errorDiv && errorDiv.parentNode) {
                        errorDiv.remove();
                    }
                    field.style.borderColor = '';
                    field.style.backgroundColor = '';
                }, 5000);

                return false;
            }

            function validateEmail(email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(email);
            }

            function validatePhone(phone) {
                // Remove all non-digit characters for validation
                const cleanPhone = phone.replace(/\D/g, '');
                // Check if it's between 7-15 digits (international standard)
                return cleanPhone.length >= 7 && cleanPhone.length <= 15;
            }

            // Perform validation
            if (nameField && nameField.value.trim().length < 2) {
                e.preventDefault();
                showError(nameField, 'Please enter a valid name (at least 2 characters)');
                return false;
            }

            if (emailField && !validateEmail(emailField.value.trim())) {
                e.preventDefault();
                showError(emailField, 'Please enter a valid email address (e.g., name@example.com)');
                return false;
            }

            if (phoneField && phoneField.value.trim() && !validatePhone(phoneField.value.trim())) {
                e.preventDefault();
                showError(phoneField, 'Please enter a valid phone number (7-15 digits)');
                return false;
            }

            if (messageField && messageField.value.trim().length < 10) {
                e.preventDefault();
                showError(messageField, 'Please enter a message with at least 10 characters');
                return false;
            }

            // If validation passes, proceed with submission
            // Update timestamp on submission
            if (timestampField) {
                timestampField.value = new Date().toISOString();
            }

            // Show loading state
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            // Let Netlify handle the form submission naturally
            // Don't prevent default - this allows Netlify to process the form and send emails

            // Reset button after a delay in case of any issues
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 10000);
        });
    }
});

// Add scroll effect to navbar
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(30, 58, 138, 0.95)';
    } else {
        navbar.style.background = '#1e3a8a';
    }
});

// Add animation on scroll for service cards
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

// Observe service cards and job cards for animation
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.service-card, .job-card');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
});