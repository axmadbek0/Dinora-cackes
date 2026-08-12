import { createApp } from './app.js';
import { createBot } from './bot/bot.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { prisma } from './config/database.js';

async function bootstrap() {
  logger.info('🚀 Starting Dinora Shirinliklari E-Commerce Backend & Telegram Bot...');

  // Initialize Express App
  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info(`🌐 REST API Server running on port ${env.PORT} in [${env.NODE_ENV}] mode`);
  });

  // Initialize GramMY Bot
  const bot = createBot();
  logger.info('🤖 Initializing Telegram Bot...');

  // Start GramMY Bot
  bot.start({
    onStart: (botInfo) => {
      logger.info(`✅ Telegram Bot @${botInfo.username} started successfully!`);
    },
  });

  // Graceful Shutdown Handler
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);

    // Stop HTTP Server
    server.close(() => {
      logger.info('HTTP Server closed.');
    });

    // Stop Bot
    await bot.stop();
    logger.info('Telegram Bot stopped.');

    // Disconnect Database Client
    await prisma.$disconnect();
    logger.info('Database connection closed.');

    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((error) => {
  logger.error('❌ Failed to start application: %o', error);
  process.exit(1);
});
