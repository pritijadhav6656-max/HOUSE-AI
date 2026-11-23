const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateJwtToken = (userId, role) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not configured.');
  }
  return jwt.sign({ id: userId, role }, secret, {
    expiresIn: '7d',
  });
};

const generatePasswordResetToken = () => {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expireDate = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  return { rawToken, hashedToken, expireDate };
};

const hashResetToken = (rawToken) => {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
};

module.exports = {
  generateJwtToken,
  generatePasswordResetToken,
  hashResetToken,
};
