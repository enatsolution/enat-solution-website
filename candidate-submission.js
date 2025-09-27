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
    const message = document.createElement('div');
    message.className = 'success-message';
    message.innerHTML = `
        <div class="message-content">
            <div class="success-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h3>Profile Submitted Successfully!</h3>
            <p>Thank you for submitting your profile. Our team will review your information and contact you within 24-48 hours with relevant opportunities.</p>
            <button class="success-btn" onclick="this.closest('.success-message').remove()">
                <i class="fas fa-check"></i> OK
            </button>
        </div>
    `;

    // Add styles with professional gradient background
    message.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(16, 185, 129, 0.9));
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 20px;
        animation: fadeIn 0.3s ease-out;
    `;

    message.querySelector('.message-content').style.cssText = `
        background: linear-gradient(145deg, #ffffff, #f8fafc);
        padding: 3rem 2.5rem;
        border-radius: 20px;
        text-align: center;
        max-width: 520px;
        width: 100%;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
        position: relative;
        overflow: hidden;
    `;

    message.querySelector('.success-icon').style.cssText = `
        width: 80px;
        height: 80px;
        background: linear-gradient(135deg, #10b981, #059669);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1.5rem;
        box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
    `;

    message.querySelector('i').style.cssText = `
        font-size: 2.5rem;
        color: white;
    `;

    message.querySelector('h3').style.cssText = `
        color: #1e293b;
        margin-bottom: 1rem;
        font-size: 1.5rem;
        font-weight: 600;
    `;

    message.querySelector('p').style.cssText = `
        color: #64748b;
        line-height: 1.6;
        margin-bottom: 2rem;
        font-size: 1rem;
    `;

    message.querySelector('.success-btn').style.cssText = `
        background: linear-gradient(135deg, #3b82f6, #2563eb);
        color: white;
        border: none;
        padding: 12px 30px;
        border-radius: 10px;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
        display: inline-flex;
        align-items: center;
        gap: 8px;
    `;

    // Add hover effect to button
    message.querySelector('.success-btn').addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
    });

    message.querySelector('.success-btn').addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
    });

    document.body.appendChild(message);

    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
}

function showErrorMessage(errorText) {
    alert(`Submission Error: ${errorText}\n\nPlease try again or contact us directly at info@enatsolution.com`);
}

function showValidationErrors(errors) {
    const errorMessage = 'Please fix the following errors:\n\n' + errors.join('\n');
    alert(errorMessage);
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
