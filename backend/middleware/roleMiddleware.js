/**
 * roleMiddleware — factory that returns middleware restricting access to
 * the supplied list of roles.  Must be used AFTER authMiddleware so that
 * req.user is populated.
 *
 * Usage:  router.post('/', authMiddleware, roleMiddleware('Admin', 'AssetManager'), handler)
 */
const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${allowedRoles.join(', ')}`,
      });
    }
    next();
  };
};

module.exports = roleMiddleware;
