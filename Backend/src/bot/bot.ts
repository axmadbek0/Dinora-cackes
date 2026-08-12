import { Bot, session, MemorySessionStorage } from 'grammy';
import { BotContext, SessionData } from './context.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

import { startHandler } from './handlers/start.handler.js';
import { catalogHandler } from './handlers/catalog.handler.js';
import { cartHandler } from './handlers/cart.handler.js';
import { checkoutHandler } from './handlers/checkout.handler.js';
import { customCakeHandler } from './handlers/custom-cake.handler.js';
import { adminHandler } from './handlers/admin.handler.js';

export function createBot() {
  const bot = new Bot<BotContext>(env.BOT_TOKEN, {
    client: {
      timeoutSeconds: 15,
    },
  });

  // Setup In-Memory Session Storage with MemorySessionStorage instance
  const storage = new MemorySessionStorage<SessionData>();

  bot.use(
    session({
      initial: (): SessionData => ({
        cart: [],
        step: 'IDLE',
      }),
      storage,
    })
  );

  // Register Handlers
  bot.use(startHandler);
  bot.use(catalogHandler);
  bot.use(cartHandler);
  bot.use(checkoutHandler);
  bot.use(customCakeHandler);
  bot.use(adminHandler);

  // Centralized GramMY error & rate-limit handling
  bot.catch((err) => {
    const ctx = err.ctx;
    const error: any = err.error;

    if (error?.error_code === 429) {
      const retryAfter = error?.parameters?.retry_after || 5;
      logger.warn(`⚠️ Telegram Rate-Limit 429 triggered. Waiting ${retryAfter}s before retrying for update ${ctx.update.update_id}`);
    } else {
      logger.error(`GramMY error while handling update ${ctx.update.update_id}: %o`, error);
    }
  });

  return bot;
}

/**
 * Safe helper to send Telegram notifications handling 429 Rate Limits
 */
export async function sendSafeTelegramMessage(
  bot: Bot<BotContext>,
  chatId: number | string,
  text: string,
  options?: any
): Promise<boolean> {
  try {
    await bot.api.sendMessage(chatId, text, options);
    return true;
  } catch (error: any) {
    if (error?.error_code === 429) {
      const delay = (error?.parameters?.retry_after || 3) * 1000;
      logger.warn(`[Telegram API 429] Retrying message to ${chatId} in ${delay}ms...`);
      await new Promise(res => setTimeout(res, delay));
      try {
        await bot.api.sendMessage(chatId, text, options);
        return true;
      } catch (retryErr) {
        logger.error(`[Telegram API] Failed message send on retry: %o`, retryErr);
        return false;
      }
    }
    logger.error(`[Telegram API] Message delivery error to ${chatId}: %o`, error);
    return false;
  }
}
