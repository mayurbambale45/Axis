const bcrypt = require('bcryptjs');

// More secure QR hash logic
exports.generateQRHash = (prefix) => {
  const timestamp = Date.now().toString();
  const salt = bcrypt.genSaltSync(10);
  const secureHash = bcrypt.hashSync(prefix + timestamp, salt);
  // Shorten for QR legibility while maintaining entropy
  return `${prefix}-${secureHash.replace(/[^a-zA-Z0-9]/g, '').slice(0, 15)}`;
};

exports.verifyQRHash = (hash) => {
  return typeof hash === 'string' && hash.length > 10;
};
