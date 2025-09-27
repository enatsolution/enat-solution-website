// Candidate Submission Form Handler
document.addEventListener('DOMContentLoaded', function() {
    const candidateForm = document.getElementById('candidateForm');
    
    if (candidateForm) {
        candidateForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitBtn = candidateForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            // Show loading state
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            submitBtn.disabled = true;
            
            // Get form data
            const formData = new FormData(candidateForm);

            // Validate required fields
            const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'location', 'industry', 'jobTitle', 'experience', 'workType', 'skills', 'availability', 'resume'];
            let isValid = true;

            for (const field of requiredFields) {
                const value = formData.get(field);
                if (!value || (typeof value === 'string' && value.trim() === '')) {
                    isValid = false;
                    const fieldElement = candidateForm.querySelector(`[name="${field}"]`);
                    if (fieldElement) {
                        fieldElement.focus();
                        alert(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`);
                    }
                    break;
                }
            }

            if (!isValid) {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                return;
            }
            
            // Submit directly to Netlify - NO GOOGLE SHEETS
            fetch('/', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (response.ok) {
                    showSuccessMessage();
                    candidateForm.reset();
                } else {
                    throw new Error('Network response was not ok');
                }
            })
            .catch(error => {
                console.error('Submission error:', error);
                alert('There was an error submitting your form. Please try again or contact us directly at info@enatsolution.com');
            })
            .finally(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            });
        });
    }
});

// UI feedback functions
function showSuccessMessage() {
    const message = document.createElement('div');
    message.className = 'success-message';
    message.innerHTML = `
        <div class="message-content">
            <i class="fas fa-check-circle"></i>
            <h3>Profile Submitted Successfully!</h3>
            <p>Thank you for submitting your profile. Our team will review your information and contact you within 24-48 hours with relevant opportunities.</p>
        </div>
    `;
    
    // Add styles
    message.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 20px;
    `;
    
    message.querySelector('.message-content').style.cssText = `
        background: white;
        padding: 2rem;
        border-radius: 12px;
        text-align: center;
        max-width: 500px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    `;
    
    message.querySelector('i').style.cssText = `
        font-size: 3rem;
        color: #10b981;
        margin-bottom: 1rem;
    `;
    
    message.querySelector('h3').style.cssText = `
        color: #1e293b;
        margin-bottom: 1rem;
    `;
    
    message.querySelector('p').style.cssText = `
        color: #64748b;
        line-height: 1.6;
    `;
    
    document.body.appendChild(message);
    
    // Remove message after 5 seconds or on click
    setTimeout(() => {
        if (message.parentNode) {
            message.remove();
        }
    }, 5000);
    
    message.addEventListener('click', () => {
        message.remove();
    });
}

// Mobile menu toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
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
}
