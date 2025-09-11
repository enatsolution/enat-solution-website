// Google Apps Script for handling form submissions
// This code goes in Google Apps Script (script.google.com)

function doPost(e) {
  try {
    // Get the active spreadsheet (or create one)
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet() || SpreadsheetApp.create('Enat Solution - Candidate Submissions');
    let sheet = spreadsheet.getSheetByName('Submissions');
    
    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = spreadsheet.insertSheet('Submissions');
      
      // Add headers
      const headers = [
        'Submission ID',
        'Submission Date',
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
        'Availability',
        'Resume Link',
        'Additional Info',
        'Resume File Name',
        'Resume File Size',
        'Status'
      ];
      
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      
      // Format headers
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground('#4285f4');
      headerRange.setFontColor('white');
      headerRange.setFontWeight('bold');
      
      // Freeze header row
      sheet.setFrozenRows(1);
    }
    
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    
    // Generate submission ID if not provided
    const submissionId = data.submissionId || 'SUB_' + new Date().getTime();
    
    // Prepare row data
    const rowData = [
      submissionId,
      new Date(data.submissionDate || new Date()),
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
      data.availability || '',
      data.resumeLink || '',
      data.additionalInfo || '',
      data.resumeFile ? data.resumeFile.name : '',
      data.resumeFile ? (data.resumeFile.size / 1024 / 1024).toFixed(2) + ' MB' : '',
      'New'
    ];
    
    // Add the data to the sheet
    sheet.appendRow(rowData);
    
    // Auto-resize columns
    sheet.autoResizeColumns(1, rowData.length);
    
    // Send email notification (optional)
    try {
      const emailSubject = `New Candidate Submission - ${data.firstName} ${data.lastName}`;
      const emailBody = `
        New candidate submission received:
        
        Name: ${data.firstName} ${data.lastName}
        Email: ${data.email}
        Phone: ${data.phone}
        Industry: ${data.industry}
        Job Title: ${data.jobTitle}
        Experience: ${data.experience}
        
        View all submissions: ${spreadsheet.getUrl()}
      `;
      
      // Replace with your email address
      const notificationEmail = 'your-email@example.com';
      MailApp.sendEmail(notificationEmail, emailSubject, emailBody);
    } catch (emailError) {
      console.log('Email notification failed:', emailError);
    }
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Submission received successfully',
        submissionId: submissionId,
        spreadsheetUrl: spreadsheet.getUrl()
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error processing submission:', error);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: 'Error processing submission: ' + error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Test function to verify the script works
function testSubmission() {
  const testData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '555-0123',
    location: 'New York, NY',
    industry: 'Information Technology',
    jobTitle: 'Software Developer',
    experience: '2-3',
    workType: 'Remote',
    skills: 'JavaScript, React, Node.js',
    availability: 'Immediately',
    resumeLink: 'https://linkedin.com/in/johndoe',
    additionalInfo: 'Looking for remote opportunities',
    submissionDate: new Date().toISOString()
  };
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  const result = doPost(mockEvent);
  console.log('Test result:', result.getContent());
}
