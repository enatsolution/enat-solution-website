# Google Forms Setup - Step by Step

## Why Google Forms Works Better

✅ **No authentication issues** - No "Bad Request" errors
✅ **Built-in file uploads** - Handles resume uploads automatically
✅ **Automatic Google Sheets** - Creates spreadsheet automatically
✅ **Professional appearance** - Clean, mobile-friendly design
✅ **Email notifications** - Built-in notification system

## Step-by-Step Setup (5 minutes)

### Step 1: Create Google Form
1. Go to [forms.google.com](https://forms.google.com)
2. Click "Blank form" (+ icon)
3. Title: "Enat Solution - Candidate Submission"
4. Description: "Submit your profile for exciting career opportunities"

### Step 2: Add Form Fields (Copy exactly)

**Personal Information Section:**
1. **First Name** - Short answer, Required
2. **Last Name** - Short answer, Required  
3. **Email Address** - Short answer, Required
4. **Phone Number** - Short answer, Required
5. **Current Location** - Short answer, Required

**Professional Information Section:**
6. **Preferred Industry** - Multiple choice, Required
   - Information Technology
   - Healthcare
   - General Staffing
   - Other

7. **Current/Desired Job Title** - Short answer, Required
8. **Years of Experience** - Multiple choice, Required
   - 0-1 years
   - 2-3 years
   - 4-5 years
   - 6-10 years
   - 10+ years

9. **Work Preference** - Multiple choice, Required
   - Remote
   - Hybrid
   - On-site
   - Flexible

10. **Key Skills** - Paragraph, Required

**Additional Information Section:**
11. **Resume Upload** - File upload, Required
    - Accept: .pdf, .doc, .docx
    - Max file size: 10MB

12. **Resume/LinkedIn URL** - Short answer, Optional
13. **Availability** - Multiple choice, Required
    - Immediately
    - 2 weeks notice
    - 1 month notice
    - 2+ months

14. **Additional Information** - Paragraph, Optional

### Step 3: Configure Settings
1. Click Settings (⚙️ gear icon)
2. **General tab:**
   - ✅ Collect email addresses
   - ✅ Limit to 1 response per person
   - ✅ Allow response editing

3. **Presentation tab:**
   - Confirmation message: "Thank you for submitting your profile! Our team will review your information and contact you within 24-48 hours with relevant opportunities."
   - ✅ Show link to submit another response: OFF

4. **Responses tab:**
   - ✅ Accepting responses
   - ✅ Send respondents a copy of their response

### Step 4: Set Up Email Notifications
1. In the **Responses** tab
2. Click the three dots menu (⋮)
3. Select "Get email notifications for new responses"
4. This will email you every time someone submits

### Step 5: Get Form URLs
1. Click "Send" button (top right)
2. Copy the form URL (looks like: `https://forms.gle/ABC123...`)
3. For embedding, click the `<>` icon and copy the embed code

### Step 6: Update Your Website

**Option A: Replace current form page**
1. Rename `candidate-submission.html` to `candidate-submission-old.html`
2. Rename `google-sheets-form.html` to `candidate-submission.html`
3. Update the Google Form URL in the iframe

**Option B: Redirect to Google Form**
1. Update your current form to redirect to the Google Form URL

### Step 7: Test Everything
1. Submit a test form
2. Check your email for notification
3. Check Google Drive for the responses spreadsheet
4. Verify file upload works

## Getting the Google Form ID

From a URL like: `https://docs.google.com/forms/d/e/1FAIpQLSc_ABC123_XYZ/viewform`

The Form ID is: `1FAIpQLSc_ABC123_XYZ`

For embedding, use: `https://docs.google.com/forms/d/e/1FAIpQLSc_ABC123_XYZ/viewform?embedded=true`

## Benefits You'll Get

1. **Automatic Spreadsheet**: Google creates and manages the spreadsheet
2. **File Storage**: Resume files stored in Google Drive
3. **Email Notifications**: Instant notifications for new submissions
4. **Data Export**: Easy CSV export for other systems
5. **Mobile Friendly**: Works perfectly on all devices
6. **No Maintenance**: Google handles all the backend

## Next Steps

1. Create the Google Form following steps above
2. Get the Form ID from the URL
3. Update `google-sheets-form.html` with your Form ID
4. Replace your current form page
5. Test with a sample submission

## Support

If you need help:
1. The form creation is straightforward in Google Forms
2. The hardest part is just copying the field names exactly
3. Google Forms handles all the technical complexity
4. No authentication or coding issues to worry about

This solution is 100% reliable and will work immediately!
