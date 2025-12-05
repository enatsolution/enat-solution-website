// Authentication middleware
const requireAuth = (req, res, next) => {
  if (req.session && req.session.authenticated) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized', message: 'Please login to access this resource' });
};

module.exports = { requireAuth };

