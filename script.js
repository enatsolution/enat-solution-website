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
            e.preventDefault(); // Prevent default to handle manually

            const form = this;
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;

            // Update timestamp on submission
            if (timestampField) {
                timestampField.value = new Date().toISOString();
            }

            // Show loading state
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            console.log('Form submission started at:', new Date().toISOString());

            // Get form data
            const formData = new FormData(form);

            // Log form data for debugging
            console.log('Form data being submitted:');
            for (let [key, value] of formData.entries()) {
                console.log(key + ': ' + value);
            }

            // Try submitting with fetch
            fetch('/', {
                method: 'POST',
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams(formData).toString()
            })
            .then(response => {
                console.log('Response received:', response.status, response.statusText);

                if (response.ok || response.status === 200) {
                    // Success - show immediate feedback
                    alert('✅ Message sent successfully! You will be redirected to the confirmation page.');

                    // Redirect to thank you page
                    setTimeout(() => {
                        window.location.href = 'thank-you.html';
                    }, 1500);
                } else {
                    throw new Error('Form submission failed with status: ' + response.status);
                }
            })
            .catch((error) => {
                console.error('Form submission error:', error);

                // Try alternative method - direct form submission
                alert('⚠️ Trying alternative submission method...');

                // Remove the event listener temporarily and submit naturally
                form.removeEventListener('submit', arguments.callee);
                form.submit();
            });
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