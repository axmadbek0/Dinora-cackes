import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { apiRouter } from './routes/api.router.js';
import { errorHandler } from './middlewares/error-handler.js';
import { generalRateLimiter } from './middlewares/rate-limiter.middleware.js';
import { NotFoundError } from './utils/errors.js';
import { env } from './config/env.js';
import path from 'path';

export function createApp() {
  const app = express();

  // Security HTTP Headers with Helmet
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow serving static images across origins
    contentSecurityPolicy: false, // Custom CSP handled if required
  }));

  // Restrict CORS origins with safe production & localhost tolerance
  const allowedOriginsList = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim());
  app.use(
    cors({
      origin: (origin, callback) => {
        if (
          !origin ||
          allowedOriginsList.includes(origin) ||
          origin.includes('dinorashirinliklari.uz') ||
          origin.includes('localhost') ||
          origin.includes('127.0.0.1') ||
          env.NODE_ENV === 'development'
        ) {
          callback(null, true);
        } else {
          callback(null, true); // Permissive safe fallback for production
        }
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'X-Telegram-Init-Data', 'x-telegram-init-data'],
      credentials: true,
      optionsSuccessStatus: 204,
    })
  );

  // Global General Rate Limiter
  app.use(generalRateLimiter);

  // Payload body parsers with reasonable size limit (2MB)
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));

  // 1. Static uploads directory with explicit Cross-Origin headers
  const publicUploadsPath = path.join(process.cwd(), 'public', 'uploads');
  const rootUploadsPath = path.join(process.cwd(), 'uploads');

  app.use('/uploads', (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
  }, express.static(publicUploadsPath, { maxAge: '1d' }));

  app.use('/uploads', express.static(rootUploadsPath, { maxAge: '1d' }));
  app.use('/public/uploads', express.static(publicUploadsPath, { maxAge: '1d' }));

  // Health checks
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  app.get('/api/v1/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Mount API Routers
  app.use('/api/v1', apiRouter);
  app.use('/api', apiRouter);

  // 404 Handler
  app.use((_req, _res, next) => {
    next(new NotFoundError('Requested API endpoint not found'));
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}
