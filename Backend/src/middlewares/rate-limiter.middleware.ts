import rateLimit from 'express-rate-limit';

/**
 * Strict Rate Limiter for Authentication / Login endpoints
 * 5 requests per 15 minutes window
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Juda ko`p muvaffaqiyatsiz urinishlar! Iltimos, 15 daqiqadan so`ng qaytadan urinib ko`ring.',
  },
});

/**
 * General API Rate Limiter
 * 100 requests per 15 minutes window per IP
 */
export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Serverga so`rovlar soni me`yordan oshdi! Iltimos, birozdan so`ng urining.',
  },
});
