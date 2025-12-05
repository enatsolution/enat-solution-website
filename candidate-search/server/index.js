const express = require('express');
const cors = require('cors');
const session = require('express-session');
const config = require('./config');
const { requireAuth } = require('./middleware/auth');
const { findUserByEmail, verifyPassword, validatePassword, validateEmailDomain } = require('./db/users');
const githubRoutes = require('./routes/github');
const devtoRoutes = require('./routes/devto');
const jobspiderRoutes = require('./routes/jobspider');
const npiRoutes = require('./routes/npi');
const jobvertiseRoutes = require('./routes/jobvertise');
const postjobfreeRoutes = require('./routes/postjobfree');
const googleResumesRoutes = require('./routes/google-resumes');
const { generateToken } = require('./utils/jwt');

const app = express();
const PORT = config.PORT;

// CORS configuration for credentials
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Session configuration
app.use(session({
  secret: config.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Auth routes (public)
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  // Validate email is provided
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  // Validate email domain must be @enatsolution.com
  if (!validateEmailDomain(email)) {
    return res.status(401).json({
      success: false,
      message: 'Only @enatsolution.com email addresses are allowed'
    });
  }

  // Find user by email
  const user = findUserByEmail(email);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Verify password
  const isValidPassword = await verifyPassword(password, user.passwordHash);
  if (!isValidPassword) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Generate JWT token
  const token = generateToken(user);
  // Set session
  req.session.authenticated = true;
  req.session.userId = user.id;
  req.session.userEmail = user.email;
  req.session.userName = user.name;
  req.session.userRole = user.role;

  res.json({
    success: true,
    message: 'Login successful',
    token: token,
    user: {
      email: user.email,
      name: user.name,
      role: user.role
    }
  });
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Logout failed' });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

app.get('/api/auth/check', (req, res) => {
  if (req.session && req.session.authenticated) {
    res.json({
      authenticated: true,
      user: {
        email: req.session.userEmail,
        name: req.session.userName,
        role: req.session.userRole
      }
    });
  } else {
    res.json({ authenticated: false });
  }
});

// Protected routes - require authentication
app.use('/api/github', requireAuth, githubRoutes);
app.use('/api/devto', requireAuth, devtoRoutes);
app.use('/api/jobspider', requireAuth, jobspiderRoutes);
app.use('/api/npi', requireAuth, npiRoutes);
app.use('/api/jobvertise', requireAuth, jobvertiseRoutes);
app.use('/api/postjobfree', requireAuth, postjobfreeRoutes);
app.use('/api/google-resumes', requireAuth, googleResumesRoutes);
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Candidate Profile Search API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Login with your @enatsolution.com email and password');
});

