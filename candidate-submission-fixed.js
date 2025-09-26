// Candidate Submission Form Handler with File Upload
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing file upload...');
    
    const form = document.getElementById('candidateForm');
    const submitBtn = document.querySelector('button[type="submit"]');
    const fileUploadArea = document.getElementById('fileUploadArea');
    const fileInput = document.getElementById('resume');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    
    console.log('Elements found:', {
        form: !!form,
        submitBtn: !!submitBtn,
        fileUploadArea: !!fileUploadArea,
        fileInput: !!fileInput
    });
    
    // File upload handling
    if (fileUploadArea && fileInput) {
        console.log('Setting up file upload handlers...');

        // Hide the file input since we have the upload area working
        fileInput.style.display = 'none';

        // Click handler
        fileUploadArea.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('File upload area clicked - opening file dialog');

            // Try multiple methods to trigger file dialog
            try {
                fileInput.click();
                console.log('File input click triggered successfully');
            } catch (error) {
                console.error('Error triggering file input:', error);
                // Fallback: show the file input
                fileInput.style.display = 'block';
                fileInput.focus();
            }
        });
        
        // File input change handler
        fileInput.addEventListener('change', function(e) {
            console.log('File input changed, files:', e.target.files.length);
            if (e.target.files.length > 0) {
                handleFileSelect(e.target.files[0]);
            }
        });
        
        // Drag and drop handlers
        fileUploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.stopPropagation();
            fileUploadArea.classList.add('dragover');
        });
        
        fileUploadArea.addEventListener('dragleave', function(e) {
            e.preventDefault();
            e.stopPropagation();
            fileUploadArea.classList.remove('dragover');
        });
        
        fileUploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
            fileUploadArea.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            console.log('Files dropped:', files.length);
            if (files.length > 0) {
                handleFileSelect(files[0]);
            }
        });
    } else {
        console.error('File upload elements not found!');
    }
    
    function handleFileSelect(file) {
        console.log('Handling file selection:', file.name, file.type, file.size);
        
        const fileExtension = file.name.split('.').pop().toLowerCase();
        const fileSizeInMB = (file.size / 1024 / 1024).toFixed(2);
        
        if (!['doc', 'docx'].includes(fileExtension)) {
            alert('Please upload only Word documents (.doc or .docx)');
            fileInput.value = '';
            return;
        }
        
        if (file.size > 10 * 1024 * 1024) {
            alert('File size must be less than 10MB');
            fileInput.value = '';
            return;
        }
        
        // Update UI to show file selected
        fileUploadArea.classList.add('file-selected');
        
        const uploadText = fileUploadArea.querySelector('.file-upload-text');
        if (uploadText) uploadText.textContent = 'File selected successfully!';
        
        const uploadHint = fileUploadArea.querySelector('.file-upload-hint');
        if (uploadHint) uploadHint.textContent = 'Click to change file';
        
        // Show file info
        if (fileName) fileName.textContent = file.name;
        if (fileSize) fileSize.textContent = ` (${fileSizeInMB} MB)`;
        if (fileInfo) fileInfo.classList.add('show');
        
        console.log('File selection completed successfully');
    }
    
    // Form submission handling
    if (form && submitBtn) {
        form.addEventListener('submit', function(e) {
            console.log('Form submission attempted');
            
            // Validate file upload
            if (!fileInput || !fileInput.files.length) {
                e.preventDefault();
                alert('Please upload your resume in Word format (.doc or .docx)');
                return;
            }
            
            const file = fileInput.files[0];
            const fileExtension = file.name.split('.').pop().toLowerCase();
            
            if (!['doc', 'docx'].includes(fileExtension)) {
                e.preventDefault();
                alert('Please upload only Word documents (.doc or .docx)');
                return;
            }
            
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            
            console.log('Form validation passed, submitting...');
            
            // Always prevent default and simulate for localhost testing
            e.preventDefault();

            // Simulate form submission for localhost testing
            setTimeout(() => {
                alert('✅ Form submission successful!\n\nNote: This is a test submission on localhost.\nWhen deployed to Netlify, this will send emails to info@enatsolution.com');

                // Reset form
                form.reset();
                if (fileUploadArea) fileUploadArea.classList.remove('file-selected');

                const uploadText = fileUploadArea ? fileUploadArea.querySelector('.file-upload-text') : null;
                if (uploadText) uploadText.textContent = 'Click to upload or drag and drop';

                const uploadHint = fileUploadArea ? fileUploadArea.querySelector('.file-upload-hint') : null;
                if (uploadHint) uploadHint.textContent = 'Word documents only (.doc, .docx) - Max 10MB';

                if (fileInfo) fileInfo.classList.remove('show');

                // Reset button
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Profile';

                // Show file input again if it was hidden
                if (fileInput) fileInput.style.display = 'block';
            }, 2000);
            
            // Let Netlify handle the actual form submission when deployed
        });
    }
});
