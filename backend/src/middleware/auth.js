const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bridgeable_dev_secret');

    // Try to find user in DB, fall back to decoded token data
    try {
      const user = await User.findById(decoded.userId);
      if (user) {
        req.user = user;
      } else {
        req.user = { _id: decoded.userId, name: decoded.name, email: decoded.email };
      }
    } catch (dbError) {
      // Database unavailable, use token data
      req.user = { _id: decoded.userId, name: decoded.name, email: decoded.email };
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = auth;
