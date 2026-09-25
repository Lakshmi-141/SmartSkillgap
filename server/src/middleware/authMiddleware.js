const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_smart_skillgap_2026';
      const decoded = jwt.verify(token, secret);

      // Get user from the token, exclude password
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found or account no longer exists'
        });
      }

      return next();
    } catch (error) {
      console.error('[AuthMiddleware] Verification failed:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed or expired'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided'
    });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    return next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Not authorized as an admin'
    });
  }
};

module.exports = { protect, admin };
