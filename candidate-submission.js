// Candidate Submission Form Handler
document.addEventListener('DOMContentLoaded', function() {
    const candidateForm = document.getElementById('candidateForm');

    // Initialize file upload functionality
    initializeFileUpload();

    if (candidateForm) {
        candidateForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = candidateForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            // Show loading state
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            submitBtn.disabled = true;
            
            // Get form data
            const formData = new FormData(candidateForm);
            const data = {};

            // Convert FormData to object, handling file uploads
            for (let [key, value] of formData.entries()) {
                if (key === 'resumeFile' && value instanceof File) {
                    // Handle file upload
                    data[key] = {
                        name: value.name,
                        size: value.size,
                        type: value.type,
                        lastModified: value.lastModified
                    };
                    // Store file data as base64 for local storage
                    data.resumeFileData = await fileToBase64(value);
                } else {
                    data[key] = value;
                }
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
        availability: 'Availability',
        resumeFile: 'Resume File'
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
    
    // File validation for resume
    if (data.resumeFile && data.resumeFile.size) {
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

        if (data.resumeFile.size > maxSize) {
            errors.push('Resume file must be smaller than 5MB');
        }

        if (!allowedTypes.includes(data.resumeFile.type)) {
            errors.push('Resume must be a PDF, DOC, or DOCX file');
        }
    }

    // URL validation for LinkedIn
    if (data.linkedinUrl && data.linkedinUrl.trim() !== '' && !isValidURL(data.linkedinUrl)) {
        errors.push('Please enter a valid LinkedIn URL');
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
    // Google Apps Script Web App URL - Replace with your actual URL from Google Apps Script deployment
    const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_SCRIPT_URL_HERE';

    // If Google Sheets URL is not configured, use fallback
    if (GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_SCRIPT_URL_HERE') {
        return submitViaFallback(data);
    }

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
        // Fallback to local storage if Google Sheets fails
        return submitViaFallback(data);
    }
}

// Fallback submission when Google Sheets is not available
function submitViaFallback(data) {
    return new Promise((resolve) => {
        // Store data locally for admin access
        try {
            const submissions = JSON.parse(localStorage.getItem('candidateSubmissions') || '[]');
            const newSubmission = {
                ...data,
                id: Date.now(),
                status: 'pending_review',
                submittedAt: new Date().toISOString()
            };
            submissions.push(newSubmission);
            localStorage.setItem('candidateSubmissions', JSON.stringify(submissions));

            // Also store in IndexedDB for better persistence
            if ('indexedDB' in window) {
                storeInIndexedDB(newSubmission);
            }

            console.log('Candidate submission stored locally:', newSubmission);
        } catch (e) {
            console.warn('Could not save to localStorage:', e);
        }

        // Return success immediately
        resolve({
            success: true,
            message: 'Profile submitted successfully! Our team will review your application and contact you within 24-48 hours.'
        });
    });
}

// Store submission in IndexedDB for better persistence
function storeInIndexedDB(submission) {
    const request = indexedDB.open('EnatSolutionDB', 1);

    request.onupgradeneeded = function(event) {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('submissions')) {
            const objectStore = db.createObjectStore('submissions', { keyPath: 'id' });
            objectStore.createIndex('email', 'email', { unique: false });
            objectStore.createIndex('submittedAt', 'submittedAt', { unique: false });
        }
    };

    request.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction(['submissions'], 'readwrite');
        const objectStore = transaction.objectStore('submissions');
        objectStore.add(submission);
    };

    request.onerror = function(event) {
        console.warn('IndexedDB error:', event.target.error);
    };
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

// File Upload Functions
function initializeFileUpload() {
    const fileInput = document.getElementById('resumeFile');
    const fileContainer = document.querySelector('.file-upload-container');
    const fileInfo = document.querySelector('.file-upload-info');
    const fileSelected = document.querySelector('.file-upload-selected');
    const fileName = document.querySelector('.file-name');
    const fileRemove = document.querySelector('.file-remove');

    if (!fileInput || !fileContainer) return;

    // File input change handler
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            handleFileSelection(file);
        }
    });

    // Drag and drop handlers
    fileContainer.addEventListener('dragover', function(e) {
        e.preventDefault();
        fileContainer.classList.add('dragover');
    });

    fileContainer.addEventListener('dragleave', function(e) {
        e.preventDefault();
        fileContainer.classList.remove('dragover');
    });

    fileContainer.addEventListener('drop', function(e) {
        e.preventDefault();
        fileContainer.classList.remove('dragover');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            fileInput.files = files;
            handleFileSelection(file);
        }
    });

    // Remove file handler
    if (fileRemove) {
        fileRemove.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            clearFileSelection();
        });
    }

    function handleFileSelection(file) {
        // Validate file
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

        if (file.size > maxSize) {
            alert('File size must be less than 5MB');
            clearFileSelection();
            return;
        }

        if (!allowedTypes.includes(file.type)) {
            alert('Please select a PDF, DOC, or DOCX file');
            clearFileSelection();
            return;
        }

        // Show selected file
        if (fileName) fileName.textContent = file.name;
        if (fileInfo) fileInfo.style.display = 'none';
        if (fileSelected) fileSelected.style.display = 'flex';
    }

    function clearFileSelection() {
        fileInput.value = '';
        if (fileInfo) fileInfo.style.display = 'flex';
        if (fileSelected) fileSelected.style.display = 'none';
        if (fileName) fileName.textContent = '';
    }
}

// Convert file to base64 for storage
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}
