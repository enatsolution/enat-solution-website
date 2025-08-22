// Advanced Security Monitoring for Enat Solution
(function() {
    'use strict';
    
    // Security event tracking
    const securityEvents = [];
    
    // Monitor for suspicious activity
    function initSecurityMonitoring() {
        
        // 1. Monitor for rapid clicking (bot detection)
        let clickCount = 0;
        let clickTimer = null;
        
        document.addEventListener('click', function(e) {
            clickCount++;
            
            if (clickTimer) clearTimeout(clickTimer);
            
            clickTimer = setTimeout(function() {
                if (clickCount > 20) {
                    logSecurityEvent('suspicious_clicking', {
                        count: clickCount,
                        timestamp: new Date().toISOString()
                    });
                }
                clickCount = 0;
            }, 1000);
        });
        
        // 2. Monitor for keyboard shortcuts (developer tools detection)
        document.addEventListener('keydown', function(e) {
            const suspiciousKeys = [
                'F12',
                'I', // Ctrl+Shift+I
                'J', // Ctrl+Shift+J
                'C', // Ctrl+Shift+C
                'U'  // Ctrl+U
            ];
            
            if (suspiciousKeys.includes(e.key) && (e.ctrlKey || e.metaKey)) {
                logSecurityEvent('dev_tools_attempt', {
                    key: e.key,
                    ctrlKey: e.ctrlKey,
                    shiftKey: e.shiftKey,
                    timestamp: new Date().toISOString()
                });
            }
        });
        
        // 3. Monitor for console access attempts
        let devtools = {
            open: false,
            orientation: null
        };
        
        setInterval(function() {
            if (window.outerHeight - window.innerHeight > 200 || 
                window.outerWidth - window.innerWidth > 200) {
                if (!devtools.open) {
                    devtools.open = true;
                    logSecurityEvent('dev_tools_opened', {
                        timestamp: new Date().toISOString()
                    });
                }
            } else {
                devtools.open = false;
            }
        }, 500);
        
        // 4. Monitor for form tampering
        const forms = document.querySelectorAll('form');
        forms.forEach(function(form) {
            const originalHTML = form.innerHTML;
            
            setInterval(function() {
                if (form.innerHTML !== originalHTML) {
                    logSecurityEvent('form_tampering', {
                        formName: form.name || 'unknown',
                        timestamp: new Date().toISOString()
                    });
                }
            }, 2000);
        });
        
        // 5. Monitor for URL manipulation
        let originalURL = window.location.href;
        setInterval(function() {
            if (window.location.href !== originalURL) {
                logSecurityEvent('url_change', {
                    from: originalURL,
                    to: window.location.href,
                    timestamp: new Date().toISOString()
                });
                originalURL = window.location.href;
            }
        }, 1000);
        
        // 6. Monitor for CSP violations
        document.addEventListener('securitypolicyviolation', function(e) {
            logSecurityEvent('csp_violation', {
                violatedDirective: e.violatedDirective,
                blockedURI: e.blockedURI,
                documentURI: e.documentURI,
                timestamp: new Date().toISOString()
            });
        });
        
        // 7. Monitor for network errors (potential attacks)
        window.addEventListener('error', function(e) {
            if (e.target && e.target.src) {
                logSecurityEvent('resource_load_error', {
                    source: e.target.src,
                    type: e.target.tagName,
                    timestamp: new Date().toISOString()
                });
            }
        });
    }
    
    // Log security events
    function logSecurityEvent(eventType, data) {
        const event = {
            type: eventType,
            data: data,
            userAgent: navigator.userAgent.substring(0, 100),
            url: window.location.href,
            timestamp: new Date().toISOString()
        };
        
        securityEvents.push(event);
        
        // Keep only last 50 events to prevent memory issues
        if (securityEvents.length > 50) {
            securityEvents.shift();
        }
        
        // In production, you might want to send this to a security monitoring service
        console.warn('Security Event:', eventType, data);
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSecurityMonitoring);
    } else {
        initSecurityMonitoring();
    }
    
    // Expose security events for debugging (remove in production)
    window.getSecurityEvents = function() {
        return securityEvents;
    };
    
})();
