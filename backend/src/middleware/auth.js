const { verifyAccessToken } = require('../utils/jwtUtils');

// Verify JWT token
function authenticateJWT(req, res, next) {
  try {
    // Get token from cookie or Authorization header
    const token = req.cookies?.accessToken || 
                  req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify token
    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Attach user info to request
    req.userId = decoded.userId;
    req.restaurantId = decoded.restaurantId;

    next();
  } catch (err) {
    console.error('Auth error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = authenticateJWT;
