const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * authMiddleware — verifies JWT from httpOnly cookie or Authorization header.
 * On success, attaches the full user document (minus passwordHash) to req.user.
 */
const authMiddleware = async (req, res, next) => {
  try {
    // 1. Extract token from cookie or Bearer header
    let token = req.cookies?.token;
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    }

    // 2. Verify & decode
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Fetch user (ensure they still exist and are active)
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists.' });
    }
    if (user.status !== 'Active') {
      return res.status(401).json({ success: false, message: 'Account has been deactivated.' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }
    next(err);
  }
};

module.exports = authMiddleware;
