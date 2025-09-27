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
            const data = {};
            
            // Convert FormData to object
            for (let [key, value] of formData.entries()) {
                data[key] = value;
            }
            
            // Add timestamp
            data.submissionDate = new Date().toISOString();
            data.submissionTime = new Date().toLocaleString();
            
            // Validate form data
            if (!validateCandidateForm(data)) {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                return;
            }
            
            // Submit to Google Sheets
            submitToGoogleSheets(data)
                .then(response => {
                    if (response.success) {
                        // Success - show confirmation
                        showSuccessMessage();
                        candidateForm.reset();
                    } else {
                        throw new Error(response.message || 'Submission failed');
                    }
                })
                .catch(error => {
                    console.error('Submission error:', error);
                    showErrorMessage(error.message);
                })
                .finally(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                });
        });
    }
});

// Validation function
function validateCandidateForm(data) {
    const errors = [];
    
    // Required field validation
    const requiredFields = {
        firstName: 'First Name',
        lastName: 'Last Name',
        email: 'Email Address',
        phone: 'Phone Number',
        location: 'Current Location',
        industry: 'Preferred Industry',
        jobTitle: 'Job Title',
        experience: 'Years of Experience',
        workType: 'Work Preference',
        skills: 'Key Skills',
        availability: 'Availability'
    };
    
    for (let [field, label] of Object.entries(requiredFields)) {
        if (!data[field] || data[field].trim() === '') {
            errors.push(`${label} is required`);
        }
    }
    
    // Email validation
    if (data.email && !isValidEmail(data.email)) {
        errors.push('Please enter a valid email address');
    }
    
    // Phone validation
    if (data.phone && !isValidPhone(data.phone)) {
        errors.push('Please enter a valid phone number');
    }
    
    // URL validation for resume link
    if (data.resumeLink && data.resumeLink.trim() !== '' && !isValidURL(data.resumeLink)) {
        errors.push('Please enter a valid URL for resume/LinkedIn');
    }
    
    if (errors.length > 0) {
        showValidationErrors(errors);
        return false;
    }
    
    return true;
}

// Helper validation functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length >= 7 && cleanPhone.length <= 15;
}

function isValidURL(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

// Google Sheets submission function
async function submitToGoogleSheets(data) {
    // Google Apps Script Web App URL - You'll need to replace this with your actual URL
    const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_SCRIPT_URL_HERE';
    
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Google Sheets submission error:', error);
        throw error;
    }
}

// UI feedback functions
function showSuccessMessage() {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'success-modal-overlay';

    modal.innerHTML = `
        <div class="success-modal">
            <div class="success-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h2>Application Submitted Successfully!</h2>
            <p>Thank you for submitting your profile to Enat Solution. Our recruitment team will review your information and contact you within 24-48 hours with relevant opportunities that match your skills and preferences.</p>
            <div class="next-steps">
                <h4>What happens next?</h4>
                <ul>
                    <li>✓ Profile review within 24 hours</li>
                    <li>✓ Skills assessment and matching</li>
                    <li>✓ Direct contact for suitable positions</li>
                </ul>
            </div>
            <button class="success-btn" onclick="this.closest('.success-modal-overlay').remove()">
                <i class="fas fa-check"></i> OK
            </button>
        </div>
    `;

    // Add comprehensive styles
    const style = document.createElement('style');
    style.textContent = `
        .success-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.1));
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 20px;
            animation: fadeIn 0.3s ease-out;
        }

        .success-modal {
            background: white;
            border-radius: 20px;
            padding: 3rem 2.5rem;
            max-width: 550px;
            width: 100%;
            text-align: center;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
            border: 1px solid rgba(255, 255, 255, 0.2);
            position: relative;
            animation: slideUp 0.4s ease-out;
        }

        .success-icon {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #10b981, #059669);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            animation: bounceIn 0.6s ease-out 0.2s both;
        }

        .success-icon i {
            font-size: 2.5rem;
            color: white;
        }

        .success-modal h2 {
            color: #1e293b;
            font-size: 1.75rem;
            font-weight: 700;
            margin-bottom: 1rem;
            line-height: 1.3;
        }

        .success-modal > p {
            color: #64748b;
            font-size: 1.1rem;
            line-height: 1.6;
            margin-bottom: 2rem;
        }

        .next-steps {
            background: linear-gradient(135deg, #f8fafc, #f1f5f9);
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 2rem;
            border-left: 4px solid #10b981;
        }

        .next-steps h4 {
            color: #1e293b;
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 1rem;
        }

        .next-steps ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .next-steps li {
            color: #475569;
            padding: 0.5rem 0;
            font-size: 0.95rem;
            display: flex;
            align-items: center;
        }

        .success-btn {
            background: linear-gradient(135deg, #3b82f6, #2563eb);
            color: white;
            border: none;
            padding: 1rem 2rem;
            border-radius: 12px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
        }

        .success-btn:hover {
            background: linear-gradient(135deg, #2563eb, #1d4ed8);
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(30px) scale(0.95);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }

        @keyframes bounceIn {
            from {
                opacity: 0;
                transform: scale(0.3);
            }
            50% {
                opacity: 1;
                transform: scale(1.1);
            }
            to {
                opacity: 1;
                transform: scale(1);
            }
        }

        @media (max-width: 768px) {
            .success-modal {
                padding: 2rem 1.5rem;
                margin: 1rem;
            }

            .success-modal h2 {
                font-size: 1.5rem;
            }

            .success-modal > p {
                font-size: 1rem;
            }
        }
    `;

    document.head.appendChild(style);
    document.body.appendChild(modal);

    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (modal.parentNode) {
            modal.remove();
            style.remove();
        }
    }, 10000);
}

function showErrorMessage(errorText) {
    alert(`Submission Error: ${errorText}\n\nPlease try again or contact us directly at info@enatsolution.com`);
}



// Mobile menu toggle for candidate submission page
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
