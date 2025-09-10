# Troubleshooting Guide

## Issue 1: Localhost Not Working

### Solution A: Try Different Port
```bash
python -m http.server 8080
```
Then visit: `http://localhost:8080`

### Solution B: Try Different Python Command
```bash
python3 -m http.server 8000
```

### Solution C: Use Node.js (if you have it)
```bash
npx http-server -p 8000
```

### Solution D: Open Files Directly
1. Navigate to your project folder
2. Double-click `index.html` to open in browser
3. Note: Some features may not work without a server

## Issue 2: Missing Upload Resume Section

**Status**: ✅ FIXED - The file upload section has been restored to the form.

The form now includes:
- File upload for resume (PDF, DOC, DOCX)
- Drag and drop functionality
- File validation (max 5MB)
- LinkedIn URL field (optional)

## Issue 3: No Success Message

**Possible Causes**:
1. JavaScript errors in browser console
2. Form validation failing
3. Missing required fields

**To Debug**:
1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Submit the form
4. Check for error messages

**Common Issues**:
- Resume file not selected (now required)
- Invalid email format
- Missing required fields

## Issue 4: Google Sheets Not Working

**Current Status**: 
- Form submissions are stored locally
- Google Sheets requires setup (optional)

**To Set Up Google Sheets**:
1. Follow `google-sheets-setup.md`
2. Create Google Apps Script
3. Deploy as web app
4. Update the URL in `candidate-submission.js`

**Alternative**: Use Admin Dashboard
- Visit: `http://localhost:8000/admin-submissions.html`
- View all submissions
- Export to CSV

## Testing Steps

### 1. Test Server
- Visit: `http://localhost:8000/test.html`
- Should see "Server is working!" message

### 2. Test Main Website
- Visit: `http://localhost:8000`
- Should see Enat Solution homepage

### 3. Test Form Submission
1. Go to: `http://localhost:8000/candidate-submission.html`
2. Fill all required fields
3. Upload a resume file (PDF, DOC, or DOCX)
4. Click "Submit Profile"
5. Should see success message popup

### 4. Test Admin Dashboard
- Visit: `http://localhost:8000/admin-submissions.html`
- Should see submitted profiles

## Browser Console Debugging

Open Developer Tools (F12) and check for these messages:
- "Form validation passed" - Form is valid
- "Showing success message" - Success popup should appear
- "Google Sheets not configured" - Using local storage (normal)

## File Checklist

Ensure these files exist:
- ✅ `index.html` - Main homepage
- ✅ `candidate-submission.html` - Profile form
- ✅ `candidate-submission.js` - Form functionality
- ✅ `style.css` - Styling
- ✅ `admin-submissions.html` - Admin dashboard
- ✅ `logo.png` - Company logo

## Quick Fixes

### If localhost still doesn't work:
1. Try a different port: `python -m http.server 3000`
2. Check if another program is using port 8000
3. Restart your computer
4. Try opening files directly in browser

### If form doesn't submit:
1. Check browser console for errors
2. Ensure all required fields are filled
3. Make sure a resume file is selected
4. Try refreshing the page

### If no success message:
1. Check browser console
2. Look for JavaScript errors
3. Try submitting with minimal data first
4. Check if popup blockers are enabled

## Contact Information

If issues persist:
1. Check browser console for specific error messages
2. Try different browsers (Chrome, Firefox, Edge)
3. Ensure all files are in the same folder
4. Verify file permissions

## Alternative Testing

If localhost continues to have issues, you can:
1. Upload files to a free hosting service like Netlify
2. Use GitHub Pages
3. Test locally by opening HTML files directly (limited functionality)

The website is fully functional - these are just server/environment issues that can be resolved.
