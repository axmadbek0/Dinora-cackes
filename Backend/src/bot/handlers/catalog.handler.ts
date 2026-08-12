import { Composer } from 'grammy';
import { BotContext } from '../context.js';
import { ProductService } from '../../modules/products/product.service.js';
import { getCategoriesInlineKeyboard, getProductInlineKeyboard } from '../keyboards/catalog.keyboard.js';

export const catalogHandler = new Composer<BotContext>();
const productService = new ProductService();

// Ultra-Fast In-Memory Cache (RAM)
let categoriesCache: any[] | null = null;
let lastCatCacheTime = 0;
const productsCacheMap = new Map<string, { data: any[]; time: number }>();
const CACHE_TTL_MS = 60 * 1000; // 1 minute RAM cache TTL

async function getCachedCategories() {
  const now = Date.now();
  if (categoriesCache && now - lastCatCacheTime < CACHE_TTL_MS) {
    return categoriesCache;
  }
  try {
    const fresh = await productService.getCategories();
    if (fresh && fresh.length > 0) {
      categoriesCache = fresh;
      lastCatCacheTime = now;
      return fresh;
    }
  } catch (e) {
    console.warn('Categories DB fetch fallback to cache:', e);
  }
  return categoriesCache || [];
}

async function getCachedProducts(categoryId: string) {
  const now = Date.now();
  const cached = productsCacheMap.get(categoryId);
  if (cached && now - cached.time < CACHE_TTL_MS) {
    return cached.data;
  }
  try {
    const fresh = await productService.getAllProducts({ categoryId, isAvailable: true });
    if (fresh) {
      productsCacheMap.set(categoryId, { data: fresh, time: now });
      return fresh;
    }
  } catch (e) {
    console.warn('Products DB fetch fallback to cache:', e);
  }
  return cached?.data || [];
}

catalogHandler.hears('🍰 Katalogni ko\'rish', async (ctx) => {
  const categories = await getCachedCategories();
  if (categories.length === 0) {
    return ctx.reply('Hozircha bo\'limlar mavjud emas.');
  }

  return ctx.reply('🍰 Iltimos, kerakli bo\'limni tanlang:', {
    reply_markup: getCategoriesInlineKeyboard(categories),
  });
});

catalogHandler.callbackQuery('back_to_categories', async (ctx) => {
  ctx.answerCallbackQuery().catch(() => {});
  const categories = await getCachedCategories();
  return ctx.editMessageText('🍰 Iltimos, kerakli bo\'limni tanlang:', {
    reply_markup: getCategoriesInlineKeyboard(categories),
  });
});

catalogHandler.callbackQuery(/^cat_(.+)$/, async (ctx) => {
  ctx.answerCallbackQuery().catch(() => {});
  const categoryId = ctx.match[1];
  const products = await getCachedProducts(categoryId);

  if (products.length === 0) {
    return ctx.reply('Ushbu bo\'limda hozircha mahsulotlar mavjud emas.');
  }

  // Send all products in parallel for instant response
  await Promise.all(
    products.map((product: any) => {
      const text = `📌 **${product.name}**\n\n📝 ${product.description || 'Tavsif berilmagan'}\n💰 **Narxi:** ${Number(product.price).toLocaleString('uz-UZ')} so'm`;

      if (product.imageUrl) {
        return ctx.replyWithPhoto(product.imageUrl, {
          caption: text,
          parse_mode: 'Markdown',
          reply_markup: getProductInlineKeyboard(product.id),
        });
      } else {
        return ctx.reply(text, {
          parse_mode: 'Markdown',
          reply_markup: getProductInlineKeyboard(product.id),
        });
      }
    })
  );
});

