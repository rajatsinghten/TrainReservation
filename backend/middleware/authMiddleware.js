const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'trainreservation-secret-key-123');

      // Get user from the token
      req.user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Not authorized, user not found' 
        });
      }

      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized, token failed' 
      });
    }
  }

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authorized, no token' 
    });
  }
};

module.exports = { protect }; 