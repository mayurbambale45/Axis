// Basic in-memory rate limiter for auth routes
const loginAttempts = new Map();

const rateLimiter = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;

  if (!loginAttempts.has(ip)) {
    loginAttempts.set(ip, { count: 1, resetTime: now + windowMs });
    return next();
  }

  const record = loginAttempts.get(ip);
  
  if (now > record.resetTime) {
    // Reset window
    loginAttempts.set(ip, { count: 1, resetTime: now + windowMs });
    return next();
  }

  if (record.count >= maxAttempts) {
    return res.status(429).json({ 
      message: 'Too many login attempts from this IP, please try again after 15 minutes.' 
    });
  }

  record.count += 1;
  next();
};

module.exports = rateLimiter;
