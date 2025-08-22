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
        
        // 2. Monitor for keyboard shortcuts (developer tools detection) - Less aggressive
        let devToolsAttempts = 0;
        document.addEventListener('keydown', function(e) {
            const suspiciousKeys = [
                'F12'
                // Removed other keys as they're too common in normal usage
            ];

            if (suspiciousKeys.includes(e.key)) {
                devToolsAttempts++;
                if (devToolsAttempts > 3) { // Only alert after multiple attempts
                    logSecurityEvent('dev_tools_attempt', {
                        key: e.key,
                        attempts: devToolsAttempts,
                        timestamp: new Date().toISOString()
                    });
                    devToolsAttempts = 0; // Reset counter
                }
            }
        });
        
        // 3. Monitor for console access attempts (less sensitive)
        let devtools = {
            open: false,
            alertSent: false
        };

        setInterval(function() {
            const heightDiff = window.outerHeight - window.innerHeight;
            const widthDiff = window.outerWidth - window.innerWidth;

            // More conservative detection - larger threshold
            if (heightDiff > 300 || widthDiff > 300) {
                if (!devtools.open && !devtools.alertSent) {
                    devtools.open = true;
                    devtools.alertSent = true;
                    logSecurityEvent('dev_tools_opened', {
                        heightDiff: heightDiff,
                        widthDiff: widthDiff,
                        timestamp: new Date().toISOString()
                    });

                    // Reset alert flag after 30 seconds
                    setTimeout(function() {
                        devtools.alertSent = false;
                    }, 30000);
                }
            } else {
                devtools.open = false;
            }
        }, 2000); // Check less frequently
        
        // 4. Monitor for form tampering (improved detection)
        const forms = document.querySelectorAll('form');
        forms.forEach(function(form) {
            const originalFormStructure = {
                fieldCount: form.querySelectorAll('input, select, textarea').length,
                formAction: form.action,
                formMethod: form.method,
                formName: form.name
            };

            // Only check for structural changes, not content changes
            setInterval(function() {
                const currentStructure = {
                    fieldCount: form.querySelectorAll('input, select, textarea').length,
                    formAction: form.action,
                    formMethod: form.method,
                    formName: form.name
                };

                // Only alert if form structure actually changed (not just values)
                if (JSON.stringify(currentStructure) !== JSON.stringify(originalFormStructure)) {
                    logSecurityEvent('form_tampering', {
                        formName: form.name || 'unknown',
                        change: 'structure_modified',
                        timestamp: new Date().toISOString()
                    });
                    // Update baseline to prevent repeated alerts
                    originalFormStructure = currentStructure;
                }
            }, 5000); // Check less frequently
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
        
        // Only log significant security events to reduce noise
        const significantEvents = ['csp_violation', 'resource_load_error', 'form_tampering'];
        if (significantEvents.includes(eventType)) {
            console.warn('Security Event:', eventType, data);
        } else {
            console.log('Security Monitor:', eventType, data);
        }
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
