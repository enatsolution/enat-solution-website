# 🔍 Candidate Profile Search - Project Overview

## 📍 Location
```
C:\Users\iamgo\Documents\augment-projects\enat solution\candidate-search
```

---

## 🎯 Project Purpose

A web application to search for candidate profiles from multiple platforms:
- **GitHub** - Developer profiles
- **Dev.to** - Developer community
- **JobSpider** - Job listings
- **NPI** - Healthcare professionals
- **JobVertise** - Job board
- **PostJobFree** - Job listings
- **Google Resumes** - Resume search

---

## 🏗️ Project Structure

```
candidate-search/
├── server/                      ← Backend (Node.js + Express)
│   ├── index.js                 ← Main server file
│   ├── config.js                ← Configuration
│   ├── db/                      ← Database functions
│   │   └── users.js             ← User management
│   ├── middleware/              ← Express middleware
│   │   └── auth.js              ← Authentication
│   └── routes/                  ← API routes
│       ├── github.js
│       ├── devto.js
│       ├── jobspider.js
│       ├── npi.js
│       ├── jobvertise.js
│       ├── postjobfree.js
│       └── google-resumes.js
│
├── client/                      ← Frontend (React + Vite)
│   ├── src/                     ← React components
│   ├── public/                  ← Static files
│   ├── index.html               ← HTML template
│   ├── vite.config.js           ← Vite config
│   └── package.json             ← Dependencies
│
├── package.json                 ← Root dependencies
├── package-lock.json
└── Documentation files
```

---

## 🔧 Technology Stack

### Backend
- **Express.js** - Web framework
- **Node.js** - Runtime
- **Axios** - HTTP client
- **Puppeteer** - Web scraping
- **Cheerio** - HTML parsing
- **bcryptjs** - Password hashing
- **express-session** - Session management
- **CORS** - Cross-origin requests

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **Axios** - HTTP client

---

## 🔐 Authentication

**Login Requirements:**
- Email: Must be `@enatsolution.com` domain
- Password: Hashed with bcryptjs
- Session: 24-hour expiration

**Protected Routes:**
- All search endpoints require authentication
- Session-based authentication
- CORS enabled for localhost:5173

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout
- `GET /api/auth/check` - Check authentication status

### Search Endpoints (Protected)
- `GET/POST /api/github/*` - GitHub profile search
- `GET/POST /api/devto/*` - Dev.to search
- `GET/POST /api/jobspider/*` - JobSpider search
- `GET/POST /api/npi/*` - NPI search
- `GET/POST /api/jobvertise/*` - JobVertise search
- `GET/POST /api/postjobfree/*` - PostJobFree search
- `GET/POST /api/google-resumes/*` - Google Resumes search

### Health Check
- `GET /api/health` - API status

---

## 🚀 How to Run

### Install Dependencies
```bash
cd candidate-search
npm run install-all
```

### Start Development Server
```bash
npm run dev
```

This starts:
- Backend on port 3000 (or configured PORT)
- Frontend on port 5173

### Start Backend Only
```bash
npm run server
```

### Start Frontend Only
```bash
cd client
npm run dev
```

---

## 📝 Configuration

Edit `server/config.js` to configure:
- PORT - Server port
- SESSION_SECRET - Session encryption key
- Database settings
- API keys for external services

---

## 🔑 Key Features

✅ **Multi-Platform Search**
- Search across 7 different platforms
- Unified interface

✅ **Authentication**
- Email-based login
- Company domain restriction (@enatsolution.com)
- Session management

✅ **Web Scraping**
- Puppeteer for dynamic content
- Cheerio for HTML parsing
- Axios for HTTP requests

✅ **Resume Parsing**
- PDF support (pdfjs-dist)
- Resume extraction

✅ **Search APIs**
- SerpAPI integration
- Multiple search sources

---

## 📊 Data Files

Text files with sample data:
- `main_page.txt` - Main page HTML
- `login_page.txt` - Login page HTML
- `contact_page.txt` - Contact page HTML
- `jobspider_html.txt` - JobSpider sample
- `resume_detail.txt` - Resume sample

---

## 🔄 Development Workflow

1. **Backend Development**
   - Edit files in `server/`
   - Server auto-restarts with nodemon
   - Test with curl or Postman

2. **Frontend Development**
   - Edit files in `client/src/`
   - Vite hot-reload enabled
   - Changes reflect instantly

3. **Testing**
   - Login with @enatsolution.com email
   - Test search endpoints
   - Check console for errors

---

## 🆘 Troubleshooting

**Port already in use?**
- Change PORT in config.js

**Authentication fails?**
- Verify email is @enatsolution.com
- Check password is correct
- Clear browser cookies

**API errors?**
- Check backend is running
- Verify CORS settings
- Check API keys in config

---

## 📚 Next Steps

1. Review `server/index.js` - Main server logic
2. Check `server/routes/` - API endpoints
3. Review `client/src/` - Frontend components
4. Test API endpoints
5. Customize search logic

---

## 🎯 Current Status

✅ Backend structure complete
✅ Authentication system ready
✅ API routes defined
✅ Frontend framework ready
⏳ Search implementations in progress

---

**Ready to explore the code!** 🚀

