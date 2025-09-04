// Security monitoring and form enhancement
(function() {
    'use strict';
    
    // Set timestamp and user agent for form security
    function setFormSecurity() {
        const timestampField = document.getElementById('timestamp');
        const userAgentField = document.getElementById('user-agent');
        
        if (timestampField) {
            timestampField.value = new Date().toISOString();
        }
        
        if (userAgentField) {
            userAgentField.value = navigator.userAgent.substring(0, 100);
        }
    }
    
    // CSP violation reporting - Silent logging to reduce console noise
    document.addEventListener('securitypolicyviolation', function(e) {
        // Only log critical violations, not routine ones
        if (e.violatedDirective && !e.violatedDirective.includes('script-src')) {
            console.warn('CSP Violation:', e.violatedDirective, e.blockedURI);
        }
        // In production, you might want to report this to your security monitoring service
    });
    
    // Initialize security features when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setFormSecurity);
    } else {
        setFormSecurity();
    }
    
    // Basic form validation enhancement
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            // Additional client-side validation can go here
            const name = contactForm.querySelector('input[name="name"]');
            const email = contactForm.querySelector('input[name="email"]');
            
            if (name && name.value.trim().length < 2) {
                e.preventDefault();
                name.focus();
                name.style.borderColor = '#ef4444';
                return false;
            }

            if (email && !email.value.includes('@')) {
                e.preventDefault();
                email.focus();
                email.style.borderColor = '#ef4444';
                return false;
            }
        });
    }
    
})();
