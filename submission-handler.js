// COMPLETELY FRESH CANDIDATE SUBMISSION - NO GOOGLE SHEETS - NETLIFY ONLY
// ALL USER REQUIREMENTS IMPLEMENTED
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('candidateForm');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            // Show loading state
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            submitBtn.disabled = true;
            
            // Get form data
            const formData = new FormData(form);
            
            // Simple validation for required fields
            const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'location', 'industry', 'jobTitle', 'experience', 'workType', 'skills', 'availability', 'resume'];
            
            for (const field of requiredFields) {
                const value = formData.get(field);
                if (!value || (typeof value === 'string' && value.trim() === '')) {
                    alert(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`);
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    return;
                }
            }
            
            // Submit directly to Netlify - NO GOOGLE SHEETS
            fetch('/', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (response.ok) {
                    showSuccessModal();
                    form.reset();
                } else {
                    throw new Error('Submission failed');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('There was an error submitting your form. Please try again or contact us directly at info@enatsolution.com');
            })
            .finally(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            });
        });
    }
});

// Success modal function - NO TIMEOUT, ONLY OK BUTTON, NO TIMEFRAME MENTIONED
function showSuccessModal() {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 20px;
    `;
    
    modal.innerHTML = `
        <div style="
            background: white;
            border-radius: 15px;
            padding: 3rem 2rem;
            max-width: 500px;
            width: 100%;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        ">
            <div style="
                width: 80px;
                height: 80px;
                background: linear-gradient(135deg, #10b981, #059669);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 1.5rem;
            ">
                <i class="fas fa-check" style="font-size: 2rem; color: white;"></i>
            </div>
            <h2 style="color: #1e293b; font-size: 1.75rem; margin-bottom: 1rem;">
                Application Submitted Successfully!
            </h2>
            <p style="color: #64748b; font-size: 1.1rem; line-height: 1.6; margin-bottom: 2rem;">
                Thank you for submitting your profile to Enat Solution. Our recruitment team will review your information and contact you.
            </p>
            <button id="okBtn" style="
                background: linear-gradient(135deg, #3b82f6, #2563eb);
                color: white;
                border: none;
                padding: 1rem 2rem;
                border-radius: 10px;
                font-size: 1.1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                OK
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // OK button click handler - RESPONSIVE
    const okBtn = modal.querySelector('#okBtn');
    okBtn.addEventListener('click', function() {
        modal.remove();
    });
}

// Mobile menu toggle (if needed)
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}
