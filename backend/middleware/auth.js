// backend/middleware/auth.js
const passport = require('passport');

const auth = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Authentication error' });
    }
    if (!user) {
      return res.status(401).json({
        success: false,
        message: info?.message || 'Unauthorized - Invalid or expired token',
      });
    }
    req.user = user;
    next();
  })(req, res, next);
};

module.exports = auth;