# Google Sheets Integration Setup

## Step 1: Create Google Apps Script

1. Go to [Google Apps Script](https://script.google.com/)
2. Click "New Project"
3. Replace the default code with the following:

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

## Step 2: Deploy the Script

1. Click "Deploy" → "New deployment"
2. Choose type: "Web app"
3. Description: "Enat Solution Candidate Submissions"
4. Execute as: "Me"
5. Who has access: "Anyone"
6. Click "Deploy"
7. **IMPORTANT**: You may need to authorize the script - click "Authorize access" and grant permissions
8. Copy the Web App URL (it will look like: `https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec`)

## Step 3: Update the JavaScript File

1. Open `candidate-submission.js`
2. Find the line: `const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_SCRIPT_URL_HERE';`
3. Replace `YOUR_GOOGLE_SCRIPT_URL_HERE` with your actual Web App URL

## Step 4: Test the Integration

1. Go to your candidate submission page
2. Fill out the form completely
3. Submit the form
4. Check your Google Sheet - you should see the new submission

## Google Sheet Structure

The script will automatically create these columns in your sheet:

| Column | Field |
|--------|-------|
| A | Submission Date |
| B | Submission Time |
| C | First Name |
| D | Last Name |
| E | Email |
| F | Phone |
| G | Location |
| H | Industry |
| I | Job Title |
| J | Experience |
| K | Work Type |
| L | Skills |
| M | Resume/LinkedIn |
| N | Availability |
| O | Additional Info |

## Troubleshooting

### If submissions aren't appearing:
1. Check the Google Apps Script execution log
2. Verify the Sheet ID is correct
3. Ensure the script has permission to access the sheet
4. Check browser console for JavaScript errors

### If you get permission errors:
1. Run the script manually once in Google Apps Script
2. Grant necessary permissions
3. Redeploy the web app

### To view submission logs:
1. Go to Google Apps Script
2. Click "Executions" to see logs
3. Check for any error messages

## Security Notes

- The web app is set to "Anyone" access for form submissions
- Consider adding additional validation in the script
- Monitor submissions regularly for spam or invalid data
- You can add email notifications when new submissions arrive
