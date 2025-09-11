# Google Sheets Integration Setup

## Current Status
❌ **Not Connected**: The form is currently storing data locally in your browser for demonstration only.
✅ **Ready to Connect**: All code is prepared for Google Sheets integration.

## Quick Setup Steps

### Step 1: Create Google Apps Script
1. Go to [script.google.com](https://script.google.com)
2. Click "New Project"
3. Delete the default code
4. Copy and paste the code from `google-apps-script.js` file
5. Save the project (give it a name like "Enat Solution Form Handler")

### Step 2: Deploy as Web App
1. In Google Apps Script, click "Deploy" → "New Deployment"
2. Choose "Web app" as the type
3. Set these settings:
   - **Execute as**: Me
   - **Who has access**: Anyone
4. Click "Deploy"
5. **Copy the Web App URL** (it looks like: `https://script.google.com/macros/s/ABC123.../exec`)

### Step 3: Update Your Website
1. Open `candidate-submission.js`
2. Find line 130: `const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_SCRIPT_URL_HERE';`
3. Replace `YOUR_GOOGLE_SCRIPT_URL_HERE` with your Web App URL
4. Save the file

### Step 4: Test the Connection
1. Submit a test form on your website
2. Check your Google Drive for a new spreadsheet called "Enat Solution - Candidate Submissions"
3. Verify the data appears in the spreadsheet

## Alternative: Use Existing Google Sheet

If you already have a Google Sheet you want to use:

1. Open your Google Sheet
2. Go to Extensions → Apps Script
3. Paste the code from `google-apps-script.js`
4. Follow steps 2-4 above

## Email Notifications (Optional)

To receive email notifications for new submissions:

1. In the Google Apps Script code, find line 85:
   ```javascript
   const notificationEmail = 'your-email@example.com';
   ```
2. Replace `your-email@example.com` with your actual email address
3. Save and redeploy

## Troubleshooting

### Common Issues:

1. **"Script function not found"**
   - Make sure the function is named `doPost` (case-sensitive)

2. **"Permission denied"**
   - Run the script once manually to authorize permissions
   - Go to script.google.com → your project → Run

3. **"CORS error"**
   - Make sure "Who has access" is set to "Anyone"

4. **Data not appearing**
   - Check the Apps Script logs for errors
   - Verify the Web App URL is correct

### Testing:

1. **Test the script directly**:
   - In Google Apps Script, run the `testSubmission()` function
   - Check if a spreadsheet is created with test data

2. **Test the web app**:
   - Use a tool like Postman to send a POST request to your Web App URL
   - Or submit a form on your website

## Security Notes

- The Web App URL should be kept private
- Consider adding additional validation in the Apps Script
- For production use, implement proper authentication

## File Upload Limitation

**Important**: Google Apps Script cannot directly receive file uploads from HTML forms. For file uploads, you would need:

1. **Option A**: Upload files to Google Drive using Google Drive API
2. **Option B**: Use a file hosting service (like Cloudinary, AWS S3)
3. **Option C**: Convert files to base64 and store in Google Sheets (not recommended for large files)

Currently, the form captures file information (name, size, type) but doesn't upload the actual file.

## Next Steps

1. Follow the setup steps above
2. Test with a sample submission
3. Customize the spreadsheet columns if needed
4. Set up email notifications
5. Consider implementing file upload solution if needed

## Support

If you encounter issues:
1. Check the Google Apps Script execution logs
2. Verify all URLs and permissions
3. Test with the provided test function first
