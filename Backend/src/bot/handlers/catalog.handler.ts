import { Composer, InputFile } from 'grammy';
import { BotContext } from '../context.js';
import { ProductService } from '../../modules/products/product.service.js';
import { getProductInlineKeyboard } from '../keyboards/catalog.keyboard.js';
import { resolveUserLanguage } from '../i18n.js';

export const catalogHandler = new Composer<BotContext>();
const productService = new ProductService();

// Ultra-Fast In-Memory Cache (RAM)
let allProductsCache: any[] | null = null;
let lastProductsCacheTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute RAM cache TTL

function escapeHtml(str?: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatPhotoSource(imageUrl: string, productId: string): string | InputFile {
  if (imageUrl.startsWith('data:')) {
    const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    return new InputFile(buffer, `product-${productId}.jpg`);
  }
  return imageUrl;
}

function formatProductMessage(product: any, lang: string = 'uz'): string {
  const name =
    lang === 'ru'
      ? product.nameRu || product.name
      : lang === 'uz-Cyrl'
      ? product.nameUzCyrl || product.name
      : product.nameUz || product.name;

  const desc =
    lang === 'ru'
      ? product.descriptionRu || product.description
      : lang === 'uz-Cyrl'
      ? product.descriptionUzCyrl || product.description
      : product.descriptionUz || product.description;

  const categoryName =
    lang === 'ru'
      ? product.category?.nameRu || product.category?.name
      : lang === 'uz-Cyrl'
      ? product.category?.nameUzCyrl || product.category?.name
      : product.category?.nameUz || product.category?.name;

  let text = `🎂 <b>${escapeHtml(name)}</b>\n\n`;

  if (categoryName) {
    const catLabel = lang === 'ru' ? 'Категория' : lang === 'uz-Cyrl' ? 'Тоифаси' : 'Toifasi';
    text += `🏷 <b>${catLabel}:</b> ${escapeHtml(categoryName)}\n`;
  }

  if (desc && desc.trim()) {
    const descLabel = lang === 'ru' ? 'Описание' : lang === 'uz-Cyrl' ? 'Тавсифи' : 'Tavsif';
    text += `📝 <b>${descLabel}:</b> ${escapeHtml(desc.trim())}\n`;
  }

  if (product.ingredients && product.ingredients.trim()) {
    const ingLabel = lang === 'ru' ? 'Состав и ингредиенты' : lang === 'uz-Cyrl' ? 'Таркиби ва масаллиқлар' : 'Tarkibi va masalliqlar';
    text += `🌿 <b>${ingLabel}:</b> ${escapeHtml(product.ingredients.trim())}\n`;
  }

  if (product.storageConditions && product.storageConditions.trim()) {
    const storLabel = lang === 'ru' ? 'Условия хранения' : lang === 'uz-Cyrl' ? 'Сақлаш шароити' : 'Saqlash sharoiti';
    text += `❄️ <b>${storLabel}:</b> ${escapeHtml(product.storageConditions.trim())}\n`;
  }

  if (product.deliveryTerms && product.deliveryTerms.trim()) {
    const delLabel = lang === 'ru' ? 'Условия доставки' : lang === 'uz-Cyrl' ? 'Етказиб бериш шартлари' : 'Yetkazib berish shartlari';
    text += `🚚 <b>${delLabel}:</b> ${escapeHtml(product.deliveryTerms.trim())}\n`;
  }

  const priceLabel = lang === 'ru' ? 'Цена' : lang === 'uz-Cyrl' ? 'Нархи' : 'Narxi';
  const currency = lang === 'ru' ? 'сум' : lang === 'uz-Cyrl' ? 'сўм' : "so'm";
  text += `\n💰 <b>${priceLabel}:</b> <b>${Number(product.price).toLocaleString('uz-UZ')} ${currency}</b>`;

  if (product.isAvailable === false) {
    const outStock = lang === 'ru' ? '❌ Временно нет в наличии' : lang === 'uz-Cyrl' ? '❌ Вақтинча тугаган' : '❌ Vaqtincha sotuvda mavjud emas';
    text += `\n<i>(${outStock})</i>`;
  }

  return text;
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
    const userLang = await resolveUserLanguage(ctx.from?.id, ctx.from?.language_code);
    const products = await getCachedAllProducts();

    if (products.length === 0) {
      const emptyMsg =
        userLang === 'ru'
          ? 'Пока нет товаров в наличии. Каталог скоро обновится! 🎂'
          : userLang === 'uz-Cyrl'
          ? 'Ҳозирча маҳсулотлар мавжуд эмас. Тез орада янгидан тўлдирилади! 🎂'
          : 'Hozircha mahsulotlar mavjud emas. Tez orada yangidan to\'ldiriladi! 🎂';
      return ctx.reply(emptyMsg);
    }

    const headerMsg =
      userLang === 'ru'
        ? `🍰 <b>Каталог десертов DINORA</b>\n\n📦 Всего: <b>${products.length} товаров</b>\n\nВсе наши десерты представлены ниже:`
        : userLang === 'uz-Cyrl'
        ? `🍰 <b>DINORA Ширинликлари Каталоги</b>\n\n📦 Жами: <b>${products.length} та маҳсулот</b>\n\nБарча ширинликларимиз қуйида келтирилган:`
        : `🍰 <b>DINORA Shirinliklari Katalogi</b>\n\n📦 Jami: <b>${products.length} ta mahsulot</b>\n\nBarcha shirinliklarimiz quyida keltirilgan:`;

    await ctx.reply(headerMsg, { parse_mode: 'HTML' });

    // Barcha mahsulotlarni ketma-ket yuborish
    for (const product of products) {
      const text = formatProductMessage(product, userLang);

      try {
        if (product.imageUrl) {
          const photoSource = formatPhotoSource(product.imageUrl, product.id);
          await ctx.replyWithPhoto(photoSource, {
            caption: text,
            parse_mode: 'HTML',
            reply_markup: getProductInlineKeyboard(product.id, userLang),
          });
        } else {
          await ctx.reply(text, {
            parse_mode: 'HTML',
            reply_markup: getProductInlineKeyboard(product.id, userLang),
          });
        }
      } catch {
        await ctx.reply(text, {
          parse_mode: 'HTML',
          reply_markup: getProductInlineKeyboard(product.id, userLang),
        });
      }
    }
  }
);

// "catalog_page_1" callback — buyurtma kuzatish va boshqa joylardan chaqiriladi
catalogHandler.callbackQuery('catalog_page_1', async (ctx) => {
  ctx.answerCallbackQuery().catch(() => {});
  const userLang = await resolveUserLanguage(ctx.from?.id, ctx.from?.language_code);
  const products = await getCachedAllProducts();

  if (products.length === 0) {
    const emptyMsg =
      userLang === 'ru'
        ? 'Пока нет товаров в наличии. 🎂'
        : userLang === 'uz-Cyrl'
        ? 'Ҳозирча маҳсулотлар мавжуд эмас. 🎂'
        : 'Hozircha mahsulotlar mavjud emas. 🎂';
    return ctx.reply(emptyMsg);
  }

  const headerMsg =
    userLang === 'ru'
      ? `🍰 <b>Каталог десертов DINORA</b>\n\n📦 Всего: <b>${products.length} товаров</b>`
      : userLang === 'uz-Cyrl'
      ? `🍰 <b>DINORA Ширинликлари Каталоги</b>\n\n📦 Жами: <b>${products.length} та маҳсулот</b>`
      : `🍰 <b>DINORA Shirinliklari Katalogi</b>\n\n📦 Jami: <b>${products.length} ta mahsulot</b>`;

  await ctx.reply(headerMsg, { parse_mode: 'HTML' });

  for (const product of products) {
    const text = formatProductMessage(product, userLang);

    try {
      if (product.imageUrl) {
        const photoSource = formatPhotoSource(product.imageUrl, product.id);
        await ctx.replyWithPhoto(photoSource, {
          caption: text,
          parse_mode: 'HTML',
          reply_markup: getProductInlineKeyboard(product.id, userLang),
        });
      } else {
        await ctx.reply(text, {
          parse_mode: 'HTML',
          reply_markup: getProductInlineKeyboard(product.id, userLang),
        });
      }
    } catch {
      await ctx.reply(text, {
        parse_mode: 'HTML',
        reply_markup: getProductInlineKeyboard(product.id, userLang),
      });
    }
  }
});
