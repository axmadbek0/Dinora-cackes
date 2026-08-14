import rateLimit from 'express-rate-limit';

/**
 * Auth Rate Limiter for Login endpoints
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // Relaxed limit for login attempts
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Juda ko`p muvaffaqiyatsiz urinishlar! Iltimos, bir ozdan so`ng qaytadan urinib ko`ring.',
  },
});

/**
 * General API Rate Limiter
 * Relaxed limit to avoid blocking admin panel operations and live polling
 */
export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000, // Generous 10,000 requests limit per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for local development or authenticated admin requests
    const authHeader = req.headers.authorization;
    const isLocalhost = req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1';
    return Boolean(isLocalhost || authHeader);
  },
  message: {
    success: false,
    message: 'Serverga so`rovlar soni me`yordan oshdi! Iltimos, birozdan so`ng urining.',
  },
});
