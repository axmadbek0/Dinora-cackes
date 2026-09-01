import { Composer, InputFile } from 'grammy';
import { BotContext } from '../context.js';
import { ProductService } from '../../modules/products/product.service.js';
import { getProductInlineKeyboard } from '../keyboards/catalog.keyboard.js';

export const catalogHandler = new Composer<BotContext>();
const productService = new ProductService();

// Ultra-Fast In-Memory Cache (RAM)
let allProductsCache: any[] | null = null;
let lastProductsCacheTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute RAM cache TTL

function formatPhotoSource(imageUrl: string, productId: string): string | InputFile {
  if (imageUrl.startsWith('data:')) {
    const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    return new InputFile(buffer, `product-${productId}.jpg`);
  }
  return imageUrl;
}

async function getCachedAllProducts() {
  const now = Date.now();
  if (allProductsCache && now - lastProductsCacheTime < CACHE_TTL_MS) {
    return allProductsCache;
  }
  try {
    const fresh = await productService.getAllProducts({ isAvailable: true });
    if (fresh && fresh.length > 0) {
      allProductsCache = fresh;
      lastProductsCacheTime = now;
      return fresh;
    }
  } catch (e) {
    console.warn('Products DB fetch fallback to cache:', e);
  }
  return allProductsCache || [];
}

// "Katalogni ko'rish" / "Tayyor Tortlar" — barcha mahsulotlarni to'g'ridan-to'g'ri ko'rsatish
catalogHandler.hears(
  [
    '🎂 Tayyor Tortlar',
    '🎂 Тайёр Тортлар',
    '🎂 Каталог десертов',
    '🍰 Katalogni ko\'rish',
    '🍰 Каталогни кўриш',
    '🍰 Смотреть каталог',
    '/catalog',
    '/tortlar',
  ],
  async (ctx) => {
  const products = await getCachedAllProducts();

  if (products.length === 0) {
    return ctx.reply('Hozircha mahsulotlar mavjud emas. Tez orada yangidan to\'ldiriladi! 🎂');
  }

  await ctx.reply(`🍰 <b>DINORA Shirinliklari Katalogi</b>\n\n📦 Jami: <b>${products.length} ta mahsulot</b>\n\nBarcha shirinliklarimiz quyida keltirilgan:`, {
    parse_mode: 'HTML',
  });

  // Barcha mahsulotlarni ketma-ket yuborish
  for (const product of products) {
    const text =
      `📌 <b>${product.name}</b>\n\n` +
      `📝 ${product.description || 'Tavsif berilmagan'}\n` +
      `💰 <b>Narxi:</b> ${Number(product.price).toLocaleString('uz-UZ')} so'm`;

    try {
      if (product.imageUrl) {
        const photoSource = formatPhotoSource(product.imageUrl, product.id);
        await ctx.replyWithPhoto(photoSource, {
          caption: text,
          parse_mode: 'HTML',
          reply_markup: getProductInlineKeyboard(product.id),
        });
      } else {
        await ctx.reply(text, {
          parse_mode: 'HTML',
          reply_markup: getProductInlineKeyboard(product.id),
        });
      }
    } catch {
      // Rasm yuklashda xatolik bo'lsa, matn bilan yuborish
      await ctx.reply(text, {
        parse_mode: 'HTML',
        reply_markup: getProductInlineKeyboard(product.id),
      });
    }
  }
});

// "catalog_page_1" callback — buyurtma kuzatish va boshqa joylardan chaqiriladi
catalogHandler.callbackQuery('catalog_page_1', async (ctx) => {
  ctx.answerCallbackQuery().catch(() => {});
  const products = await getCachedAllProducts();

  if (products.length === 0) {
    return ctx.reply('Hozircha mahsulotlar mavjud emas. 🎂');
  }

  await ctx.reply(`🍰 <b>DINORA Shirinliklari Katalogi</b>\n\n📦 Jami: <b>${products.length} ta mahsulot</b>`, {
    parse_mode: 'HTML',
  });

  for (const product of products) {
    const text =
      `📌 <b>${product.name}</b>\n\n` +
      `📝 ${product.description || 'Tavsif berilmagan'}\n` +
      `💰 <b>Narxi:</b> ${Number(product.price).toLocaleString('uz-UZ')} so'm`;

    try {
      if (product.imageUrl) {
        const photoSource = formatPhotoSource(product.imageUrl, product.id);
        await ctx.replyWithPhoto(photoSource, {
          caption: text,
          parse_mode: 'HTML',
          reply_markup: getProductInlineKeyboard(product.id),
        });
      } else {
        await ctx.reply(text, {
          parse_mode: 'HTML',
          reply_markup: getProductInlineKeyboard(product.id),
        });
      }
    } catch {
      await ctx.reply(text, {
        parse_mode: 'HTML',
        reply_markup: getProductInlineKeyboard(product.id),
      });
    }
  }
});
