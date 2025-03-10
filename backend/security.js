/**
 * Security utilities for the portfolio API
 */

// Rate limiting to prevent abuse
const rateLimit = require('express-rate-limit');

// CORS configuration for API security
const corsOptions = {
  origin: function (origin, callback) {
    // Allow your portfolio domain and local development
    const allowedOrigins = [
      'https://your-portfolio-domain.com', 
      'http://localhost:5500',
      'http://127.0.0.1:5500'
    ];
    
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  maxAge: 86400 // 24 hours
};

// Create rate limiter
const createApiLimiter = () => rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many requests, please try again later.'
  }
});

// Headers for security
const securityHeaders = (req, res, next) => {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // XSS protection (though modern browsers rely more on CSP)
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  next();
};

module.exports = {
  corsOptions,
  createApiLimiter,
  securityHeaders
};
