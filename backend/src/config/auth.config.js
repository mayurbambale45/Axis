module.exports = {
  secret: process.env.JWT_SECRET || 'super_secret_key_123',
  expiresIn: 86400 // 24 hours
};
