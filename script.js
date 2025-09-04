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

// Contact form submission - Enhanced for Netlify
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
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;

            // Update timestamp on submission
            if (timestampField) {
                timestampField.value = new Date().toISOString();
            }

            // Show loading state
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            // Log for debugging
            console.log('Form submitted at:', new Date().toISOString());

            // Let Netlify handle the form submission naturally
            // Don't prevent default - let the form submit normally
            setTimeout(() => {
                // Reset button in case of any issues
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 5000);
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