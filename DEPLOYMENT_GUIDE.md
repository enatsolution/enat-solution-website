# Enat Solution Website - Git Repository Deployment Guide

## Files Ready for Deployment
✅ index.html - Main website
✅ style.css - Styling
✅ script.js - JavaScript functionality
✅ thank-you.html - Form submission confirmation
✅ netlify.toml - Netlify configuration
✅ _redirects - URL redirects
✅ robots.txt - SEO configuration
✅ .gitignore - Git ignore file
✅ README.md - Project documentation

## Step-by-Step Git Repository Deployment

### 1. Create GitHub Repository
1. Go to https://github.com and sign up/login
2. Click "New repository"
3. Repository name: `enat-solution-website`
4. Description: "Professional recruitment agency website"
5. Set to Public
6. Don't initialize with README (we have one)
7. Click "Create repository"

### 2. Upload Files to GitHub
**Option A: GitHub Web Interface**
1. In your new repository, click "uploading an existing file"
2. Drag all your project files to the upload area
3. Commit message: "Initial website deployment"
4. Click "Commit changes"

**Option B: Git Command Line**
```bash
git init
git add .
git commit -m "Initial website deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/enat-solution-website.git
git push -u origin main
```

### 3. Deploy to Netlify from GitHub
1. Go to https://netlify.com and sign up/login
2. Click "Add new site" → "Import an existing project"
3. Choose "GitHub" and authorize Netlify
4. Select your `enat-solution-website` repository
5. Build settings:
   - Branch: `main`
   - Build command: (leave empty)
   - Publish directory: (leave empty or put `.`)
6. Click "Deploy site"

### 2. Set Up Custom Domain (enatsolution.com)
1. In Netlify dashboard → "Domain settings"
2. Click "Add custom domain"
3. Enter: enatsolution.com
4. Also add: www.enatsolution.com

### 3. Configure DNS at Namecheap
Login to Namecheap → Domain List → Manage enatsolution.com

#### Option A: Use Netlify DNS (Recommended)
1. In Netlify → Domain settings → "Set up Netlify DNS"
2. Copy the 4 nameservers provided
3. In Namecheap → Nameservers → Custom DNS
4. Replace with Netlify nameservers

#### Option B: Use CNAME Records
1. In Namecheap → Advanced DNS
2. Add these records:
   - Type: CNAME, Host: www, Value: [your-site].netlify.app
   - Type: A, Host: @, Value: 75.2.60.5

### 4. Configure Email (You already have Namecheap email ✅)
Since you already have email from Namecheap:
1. Ensure info@enatsolution.com is set up and working
2. Test by sending an email to info@enatsolution.com
3. Check that you can receive emails at this address

### 5. Configure Form Notifications
1. In Netlify → Forms → Settings
2. Add notification email: info@enatsolution.com
3. Test form submission

### 6. Enable HTTPS
1. In Netlify → Domain settings
2. HTTPS should auto-enable
3. Force HTTPS redirect

## DNS Records for Email (if using Google Workspace)
Add these MX records in Namecheap:
- Priority 1: ASPMX.L.GOOGLE.COM
- Priority 5: ALT1.ASPMX.L.GOOGLE.COM
- Priority 5: ALT2.ASPMX.L.GOOGLE.COM
- Priority 10: ALT3.ASPMX.L.GOOGLE.COM
- Priority 10: ALT4.ASPMX.L.GOOGLE.COM

## Testing Checklist
- [ ] Website loads at enatsolution.com
- [ ] www.enatsolution.com redirects properly
- [ ] Contact form submits successfully
- [ ] Email notifications work
- [ ] Mobile responsiveness
- [ ] All links work
- [ ] SSL certificate active

## Support Contacts
- Netlify Support: https://netlify.com/support
- Namecheap Support: https://namecheap.com/support
- Google Workspace: https://workspace.google.com/support
