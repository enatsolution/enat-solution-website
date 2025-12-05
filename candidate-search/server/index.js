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

const app = express();
const PORT = config.PORT;

// CORS configuration for credentials
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:8000',
  'https://enatsolution.com',
  'https://www.enatsolution.com',
  process.env.FRONTEND_URL // For production deployment
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Session configuration
const isProduction = process.env.NODE_ENV === 'production';
app.use(session({
  secret: config.SESSION_SECRET,
  resave: false,
  saveUninitialized: true, // Changed to true to ensure session is created
  cookie: {
    secure: true, // Always true for cross-domain cookies (HTTPS required)
    httpOnly: false, // Temporarily disabled for debugging
    sameSite: 'none', // Required for cross-domain cookie sharing
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

  // Generate JWT token
  const token = generateToken(user);

  // Set session
  console.log('Session set:', {
    sessionID: req.sessionID,
    authenticated: req.session.authenticated,
    email: req.session.userEmail
  });
  req.session.authenticated = true;
  req.session.userId = user.id;
  req.session.userEmail = user.email;
  req.session.userName = user.name;
  req.session.userRole = user.role;

  res.json({
    success: true,
    message: 'Login successful',
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
  console.log('Auth check - SessionID:', req.sessionID, 'Authenticated:', req.session?.authenticated);
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








