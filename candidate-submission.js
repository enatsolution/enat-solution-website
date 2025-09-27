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
            
            // For localhost testing - just show success
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                console.log('Localhost testing mode - simulating successful submission');
                console.log('Form data:', data);

                setTimeout(() => {
                    showSuccessMessage();
                    candidateForm.reset();
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }, 1500);
            } else {
                // For production - use native form submission to Netlify
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                candidateForm.submit();
            }
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
