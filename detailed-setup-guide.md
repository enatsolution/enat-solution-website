# 📋 DETAILED Google Sheets Integration Setup Guide

## 🎯 Overview
This guide will help you connect your candidate submission form to your Google Sheet so that when someone submits their profile, it automatically appears in your spreadsheet.

## ⚠️ Prerequisites
- You must be logged into the same Google account that owns the Google Sheet
- Your Google Sheet URL: https://docs.google.com/spreadsheets/d/1Ioequ2XKtxmt9pUMH-3d_PVZO9b_AFi-F-QkRtKMbWA/edit?gid=0#gid=0

---

## 📝 STEP 1: Prepare Your Google Sheet

### 1.1 Open Your Google Sheet
1. **Click this link**: https://docs.google.com/spreadsheets/d/1Ioequ2XKtxmt9pUMH-3d_PVZO9b_AFi-F-QkRtKMbWA/edit?gid=0#gid=0
2. **Make sure you're logged in** to the correct Google account
3. **Verify you can edit** the sheet (you should see editing tools)

### 1.2 Prepare the Sheet (Optional)
- The script will automatically create headers, but you can prepare them manually if you prefer
- **Leave the sheet empty** - the script will handle everything

---

## 🔧 STEP 2: Create Google Apps Script

### 2.1 Open Google Apps Script
1. **Open a new tab** in your browser
2. **Go to**: https://script.google.com/
3. **Make sure you're logged into the same Google account** as your sheet
4. **You should see the Google Apps Script dashboard**

### 2.2 Create New Project
1. **Click the "New Project" button** (usually a blue button with a "+" icon)
2. **Wait for the project to load** - you'll see a code editor
3. **You'll see default code** that says `function myFunction() {}`

### 2.3 Replace the Default Code
1. **Select ALL the default code** (Ctrl+A or Cmd+A)
2. **Delete it completely**
3. **Copy and paste the following code exactly**:

```javascript
function doPost(e) {
  try {
    // Parse the JSON data
    const data = JSON.parse(e.postData.contents);
    
    // Open your Google Sheet by ID
    const SHEET_ID = '1Ioequ2XKtxmt9pUMH-3d_PVZO9b_AFi-F-QkRtKMbWA';
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
    
    // Prepare the row data
    const rowData = [
      data.submissionDate || new Date().toISOString(),
      data.submissionTime || new Date().toLocaleString(),
      data.firstName || '',
      data.lastName || '',
      data.email || '',
      data.phone || '',
      data.location || '',
      data.industry || '',
      data.jobTitle || '',
      data.experience || '',
      data.workType || '',
      data.skills || '',
      data.resumeLink || '',
      data.availability || '',
      data.additionalInfo || ''
    ];
    
    // Add headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      const headers = [
        'Submission Date',
        'Submission Time',
        'First Name',
        'Last Name',
        'Email',
        'Phone',
        'Location',
        'Industry',
        'Job Title',
        'Experience',
        'Work Type',
        'Skills',
        'Resume/LinkedIn',
        'Availability',
        'Additional Info'
      ];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      
      // Format headers
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#4285f4');
      headerRange.setFontColor('white');
    }
    
    // Add the new row
    sheet.appendRow(rowData);
    
    // Auto-resize columns
    sheet.autoResizeColumns(1, rowData.length);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Candidate profile submitted successfully'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error:', error);
    
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: 'Error submitting profile: ' + error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      message: 'Enat Solution Candidate Submission API is running'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

---

## 💾 STEP 3: Save Your Project

### 3.1 Save the Script
1. **Press Ctrl+S (or Cmd+S on Mac)** to save
2. **Give your project a name**: "Enat Solution Candidate Submissions"
3. **Click "Save"**

### 3.2 Verify the Code
- **Make sure there are no red error lines** in the code
- **The code should be properly formatted** with correct indentation
- **If you see errors**, double-check that you copied the code exactly

---

## 🚀 STEP 4: Deploy the Script as Web App

### 4.1 Start Deployment
1. **Click the "Deploy" button** (top right, looks like a rocket ship)
2. **Select "New deployment"** from the dropdown

### 4.2 Configure Deployment Settings
1. **Click the gear icon** next to "Select type"
2. **Choose "Web app"** from the dropdown
3. **Fill in the following settings**:
   - **Description**: "Enat Solution Candidate Submissions"
   - **Execute as**: "Me (your-email@gmail.com)"
   - **Who has access**: "Anyone"

### 4.3 Deploy
1. **Click "Deploy"** button
2. **You may see a permission warning** - this is normal
3. **Click "Authorize access"**
4. **Choose your Google account**
5. **Click "Advanced"** if you see a security warning
6. **Click "Go to Enat Solution Candidate Submissions (unsafe)"**
7. **Click "Allow"** to grant permissions

### 4.4 Copy the Web App URL
1. **After successful deployment**, you'll see a success message
2. **Copy the "Web app URL"** - it looks like:
   ```
   https://script.google.com/macros/s/AKfycbx...../exec
   ```
3. **Save this URL** - you'll need it in the next step

---

## 🔗 STEP 5: Connect the Form to Your Script

### 5.1 Update the JavaScript File
1. **Go back to your website files**
2. **Open the file**: `candidate-submission.js`
3. **Find line 35** that says:
   ```javascript
   const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_SCRIPT_URL_HERE';
   ```
4. **Replace `YOUR_GOOGLE_SCRIPT_URL_HERE`** with your actual Web App URL
5. **It should look like**:
   ```javascript
   const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx...../exec';
   ```
6. **Save the file**

---

## 🧪 STEP 6: Test the Integration

### 6.1 Upload Your Files
1. **Make sure all your files are uploaded** to your website:
   - `candidate-submission.html`
   - `candidate-submission.js` (with the updated URL)
   - `candidate-success.html`
   - Updated `style.css`

### 6.2 Test the Form
1. **Go to your website**: `yourdomain.com/candidate-submission.html`
2. **Fill out the form completely** with test data:
   - Use a real email address (yours)
   - Fill all required fields
   - Use realistic information
3. **Click "Submit Profile"**
4. **You should see**:
   - Loading state ("Submitting...")
   - Success message popup

### 6.3 Verify in Google Sheet
1. **Go back to your Google Sheet**
2. **Refresh the page** (F5 or Ctrl+R)
3. **You should see**:
   - Headers automatically created in row 1
   - Your test submission in row 2
   - All data properly formatted

---

## ✅ STEP 7: Verification Checklist

### Before Going Live:
- [ ] Google Apps Script is deployed and running
- [ ] Web App URL is correctly added to `candidate-submission.js`
- [ ] Test submission appears in Google Sheet
- [ ] Form validation works (try submitting with missing fields)
- [ ] Success message displays properly
- [ ] Mobile version works correctly

### If Everything Works:
- [ ] Remove test submission from Google Sheet
- [ ] Your candidate submission system is ready!
- [ ] Share the link: `yourdomain.com/candidate-submission.html`

---

## 🆘 TROUBLESHOOTING

### Problem: "Submission failed" error
**Solution:**
1. Check that the Web App URL is correct in `candidate-submission.js`
2. Make sure the Google Apps Script is deployed as "Anyone" access
3. Check browser console for detailed error messages (F12 → Console)

### Problem: Nothing happens when submitting
**Solution:**
1. Check browser console for JavaScript errors
2. Verify all files are uploaded correctly
3. Test the Google Apps Script URL directly in browser

### Problem: Submissions not appearing in Google Sheet
**Solution:**
1. Check Google Apps Script execution log (script.google.com → your project → Executions)
2. Verify the Sheet ID in the script matches your sheet
3. Make sure you have edit permissions on the sheet

### Problem: Permission denied errors
**Solution:**
1. Re-run the authorization process in Google Apps Script
2. Make sure you're logged into the correct Google account
3. Try deploying a new version of the script

### Need Help?
- Check the browser console (F12) for error messages
- Look at Google Apps Script execution logs
- Verify all URLs and IDs are correct

---

## 🎉 YOU'RE DONE!

Once you complete these steps, your candidate submission system will be fully operational. Candidates can submit their profiles, and you'll have all their information organized in your Google Sheet for easy review and follow-up.

**Need help?** Feel free to ask if you encounter any issues during setup!
