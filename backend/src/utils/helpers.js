/**
 * Generate a unique meeting code in format BRG-XXXX-XX
 */
const generateMeetingCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let part1 = '';
  let part2 = '';

  for (let i = 0; i < 4; i++) {
    part1 += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  for (let i = 0; i < 2; i++) {
    part2 += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `BRG-${part1}-${part2}`;
};

/**
 * Generate JWT token
 */
const generateToken = (user) => {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { userId: user._id, name: user.name, email: user.email },
    process.env.JWT_SECRET || 'bridgeable_dev_secret',
    { expiresIn: '7d' }
  );
};

module.exports = { generateMeetingCode, generateToken };
