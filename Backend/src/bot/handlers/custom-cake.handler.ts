import { Composer } from 'grammy';
import { BotContext } from '../context.js';
import { CustomCakeService } from '../../modules/custom-cakes/custom-cake.service.js';
import { getDeliveryTypeInlineKeyboard } from '../keyboards/order.keyboard.js';
import { getLocationRequestKeyboard, getMainKeyboard } from '../keyboards/main.keyboard.js';
import { getAdminCustomCakePricingKeyboard } from '../keyboards/admin.keyboard.js';
import { env } from '../../config/env.js';
import { prisma } from '../../config/database.js';

export const customCakeHandler = new Composer<BotContext>();
const customCakeService = new CustomCakeService();

customCakeHandler.hears(
  [
    '✨ O\'zim xohlaganimdek',
    '✨ Ўзим хоҳлаганимдек',
    '✨ Свой дизайн торта',
    '🎂 O\'zim xohlaganimdek',
    '🎂 Ўзим хоҳлаганимдек',
    '🎂 Индивидуальный торт',
  ],
  async (ctx) => {
    ctx.session.pendingCustomCake = {};
    ctx.session.step = 'AWAITING_CUSTOM_PHOTO';

    return ctx.reply(
      `✨ **"O'zim xohlaganimdek" buyurtma berish**\n\nIltimos, siz xohlagan tort fotosuratini yuboring (yoki matnli yozuv qoldirish uchun rasm yuklamasdan davom eting):`,
      { parse_mode: 'Markdown' }
    );
  });

customCakeHandler.on('message:photo', async (ctx, next) => {
  if (ctx.session.step === 'AWAITING_CUSTOM_PHOTO') {
    const photo = ctx.message.photo.pop();
    if (!ctx.session.pendingCustomCake) ctx.session.pendingCustomCake = {};
    if (photo) {
      ctx.session.pendingCustomCake.referenceImageUrl = photo.file_id;
    }

    ctx.session.step = 'AWAITING_CUSTOM_DESCRIPTION';
    return ctx.reply('📝 Rahmat! Endi tortning o\'lchami, biskviti, kremi va boshqa tafsilotlarini yozib qoldiring:');
  }
  return next();
});

customCakeHandler.on('message:text', async (ctx, next) => {
  if (ctx.session.step === 'AWAITING_CUSTOM_DESCRIPTION') {
    if (!ctx.session.pendingCustomCake) ctx.session.pendingCustomCake = {};
    ctx.session.pendingCustomCake.description = ctx.message.text;

    ctx.session.step = 'AWAITING_CUSTOM_LOCATION';
    return ctx.reply('🚖 Yetkazib berish turini tanlang:', {
      reply_markup: getDeliveryTypeInlineKeyboard(),
    });
  }

  return next();
});

customCakeHandler.callbackQuery('delivery_delivery', async (ctx, next) => {
  if (ctx.session.step === 'AWAITING_CUSTOM_LOCATION') {
    await ctx.answerCallbackQuery();
    if (!ctx.session.pendingCustomCake) ctx.session.pendingCustomCake = {};
    ctx.session.pendingCustomCake.deliveryType = 'DELIVERY';

    return ctx.reply('📍 Iltimos, yetkazib berish geolokatsiyangizni yuboring:', {
      reply_markup: getLocationRequestKeyboard(),
    });
  }
  return next();
});

customCakeHandler.callbackQuery('delivery_pickup', async (ctx, next) => {
  if (ctx.session.step === 'AWAITING_CUSTOM_LOCATION') {
    await ctx.answerCallbackQuery();
    if (!ctx.session.pendingCustomCake) ctx.session.pendingCustomCake = {};
    ctx.session.pendingCustomCake.deliveryType = 'PICKUP';

    return finalizeCustomCake(ctx);
  }
  return next();
});

customCakeHandler.on('message:location', async (ctx, next) => {
  if (ctx.session.step === 'AWAITING_CUSTOM_LOCATION' && ctx.session.pendingCustomCake) {
    const { latitude, longitude } = ctx.message.location;
    ctx.session.pendingCustomCake.latitude = latitude;
    ctx.session.pendingCustomCake.longitude = longitude;
    ctx.session.pendingCustomCake.deliveryAddress = `Geolokatsiya (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;

    return finalizeCustomCake(ctx);
  }
  return next();
});

async function finalizeCustomCake(ctx: BotContext) {
  const telegramId = ctx.from!.id;
  const pending = ctx.session.pendingCustomCake;

  if (!pending || !pending.description) {
    return ctx.reply('Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
  }

  const user = await prisma.user.findUnique({
    where: { telegramId: BigInt(telegramId) },
  });

  const cakeRequest = await customCakeService.createRequest({
    telegramId,
    phone: user?.phone || 'Biriktirilmagan',
    firstName: ctx.from?.first_name,
    lastName: ctx.from?.last_name,
    username: ctx.from?.username,
    referenceImageUrl: pending.referenceImageUrl,
    description: pending.description,
    deliveryType: pending.deliveryType || 'DELIVERY',
    deliveryAddress: pending.deliveryAddress,
    latitude: pending.latitude,
    longitude: pending.longitude,
  });

  ctx.session.pendingCustomCake = undefined;
  ctx.session.step = 'IDLE';

  const safeDescription = (cakeRequest.description || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeCustomerName = (ctx.from?.first_name || 'Mijoz').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeUsername = (ctx.from?.username || 'username_yoq').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safePhone = (user?.phone || 'Yo\'q').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  await ctx.reply(
    `✨ <b>Maxsus buyurtma so'rovingiz qabul qilindi!</b>\n\n🆔 So'rov №: <b>${cakeRequest.requestNumber}</b>\n📝 Tavsif: ${safeDescription}\n\nQonditerimiz so'rovni ko'rib chiqib, narxini ma'lum qiladi!`,
    {
      parse_mode: 'HTML',
      reply_markup: getMainKeyboard(),
    }
  );

  // Notify admins
  const adminMsg = `✨ <b>Yangi Maxsus Tort So'rovi №${cakeRequest.requestNumber}</b>\n👤 Mijoz: <b>${safeCustomerName}</b> (@${safeUsername})\n📞 Tel: <b>${safePhone}</b>\n📝 Tavsif: ${safeDescription}\n🚖 Yetkazib berish: ${cakeRequest.deliveryType}`;

  for (const adminId of env.ADMIN_IDS) {
    try {
      if (pending.referenceImageUrl) {
        await ctx.api.sendPhoto(adminId, pending.referenceImageUrl, {
          caption: adminMsg,
          parse_mode: 'HTML',
          reply_markup: getAdminCustomCakePricingKeyboard(cakeRequest.id, env.FRONTEND_WEB_URL),
        });
      } else {
        await ctx.api.sendMessage(adminId, adminMsg, {
          parse_mode: 'HTML',
          reply_markup: getAdminCustomCakePricingKeyboard(cakeRequest.id, env.FRONTEND_WEB_URL),
        });
      }
    } catch (err) {
      console.error(`Failed to notify admin ${adminId}:`, err);
    }
  }
}
