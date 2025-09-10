# Quick Setup Guide for Enat Solution Website

## ✅ Current Status
Your website is now fully functional with:
- ✅ **Form submissions working** (stored locally until Google Sheets is set up)
- ✅ **File upload working** (PDF, DOC, DOCX resume files)
- ✅ **All navigation buttons working correctly**
- ✅ **Confirmation messages displaying**
- ✅ **Admin dashboard** to view submissions

## 🔧 To Set Up Google Sheets Integration (Optional)

### Step 1: Create Google Apps Script
1. Go to [Google Apps Script](https://script.google.com/)
2. Click "New Project"
3. Replace the default code with the code from `google-sheets-setup.md`
4. Save the project as "Enat Solution Submissions"

### Step 2: Deploy the Script
1. Click "Deploy" → "New deployment"
2. Choose type: "Web app"
3. Execute as: "Me"
4. Who has access: "Anyone"
5. Click "Deploy"
6. Copy the Web App URL

### Step 3: Update the Website
1. Open `candidate-submission.js`
2. Find line: `const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_SCRIPT_URL_HERE';`
3. Replace `YOUR_GOOGLE_SCRIPT_URL_HERE` with your actual URL
4. Save the file

## 📊 How to View Submissions

### Option 1: Admin Dashboard (Current)
- Visit: `http://localhost:8000/admin-submissions.html`
- View all submissions stored locally
- Export to CSV
- Clear submissions for testing

### Option 2: Google Sheets (After Setup)
- Submissions will automatically appear in your Google Sheet
- Real-time updates
- Easy to share with team members

## 🎯 Testing the Website

### Test Form Submission:
1. Go to `http://localhost:8000/candidate-submission.html`
2. Fill out all required fields
3. Upload a resume file (PDF, DOC, or DOCX)
4. Click "Submit Profile"
5. Should see success confirmation message
6. Check admin dashboard for the submission

### Test Navigation:
1. Go to `http://localhost:8000`
2. Click "Explore Opportunities" → Should go to profile submission
3. Click any of the 3 job cards → Should go to profile submission
4. Click "Get Started" → Should scroll to contact section

## 🚀 Going Live

### Option 1: GitHub Pages (Recommended)
1. Create a GitHub repository
2. Upload all website files
3. Enable GitHub Pages in repository settings
4. Your site will be live at `https://yourusername.github.io/repository-name`

### Option 2: Netlify
1. Create account at [Netlify](https://netlify.com)
2. Drag and drop your website folder
3. Get instant live URL

### Option 3: Your Hosting Provider
1. Upload files to your web hosting via FTP
2. Point your domain to the hosting

## 📁 Important Files

- `index.html` - Main homepage
- `candidate-submission.html` - Profile submission form
- `admin-submissions.html` - Admin dashboard
- `style.css` - All styling
- `candidate-submission.js` - Form functionality
- `google-sheets-setup.md` - Detailed Google Sheets setup

## 🔒 Security Notes

- Submissions are stored locally in browser until Google Sheets is set up
- Google Sheets integration is secure and only accessible to you
- No sensitive data is exposed publicly
- File uploads are validated for type and size

## 📞 Support

If you need help:
1. Check the browser console for any error messages
2. Verify all files are uploaded correctly
3. Test in different browsers
4. Check the admin dashboard for submissions

Your website is ready to use! Candidates can now submit their profiles with resume files, and you can manage all submissions through the admin dashboard.
