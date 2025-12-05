const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (user) => {
  const secret = 'candidate-profile-search-jwt-secret-2024';
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    secret,
    { expiresIn: '24h' }
  );
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    const secret = 'candidate-profile-search-jwt-secret-2024';
    return jwt.verify(token, secret);
  } catch (err) {
    return null;
  }
};

// Extract token from Authorization header
const extractToken = (authHeader) => {
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  return parts[1];
};

module.exports = {
  generateToken,
  verifyToken,
  extractToken
};
