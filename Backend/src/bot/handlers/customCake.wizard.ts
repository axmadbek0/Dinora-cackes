import { Composer, InlineKeyboard, Keyboard } from 'grammy';
import { BotContext } from '../context.js';
import { CustomCakeService } from '../../modules/custom-cakes/custom-cake.service.js';
import { getMainKeyboard } from '../keyboards/main.keyboard.js';
import { getAdminCustomCakePricingKeyboard } from '../keyboards/admin.keyboard.js';
import { calculateCustomCakeDeliveryFee, calculateDistanceKm, STORE_COORDINATES } from '../../utils/delivery-calculator.js';
import { env } from '../../config/env.js';
import { prisma } from '../../config/database.js';

export const customCakeWizard = new Composer<BotContext>();
const customCakeService = new CustomCakeService();

function escapeHtml(str?: string): string {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * 1. Entry Point: Start Custom Cake Builder
 */
export async function startCustomCakeWizard(ctx: BotContext) {
  ctx.session.pendingCustomCake = {};
  ctx.session.step = 'IDLE';

  const keyboard = new InlineKeyboard()
    .text('⭕️ Dumaloq', 'cake_shape_Dumaloq')
    .text('🔲 Kvadrat', 'cake_shape_Kvadrat')
    .row()
    .text('💖 Yurak', 'cake_shape_Yurak')
    .row()
    .text('✍️ Boshqa shakl (O\'zim yozaman)', 'cake_custom_shape')
    .row()
    .text('❌ Bekor qilish', 'cake_cancel_wizard');

  const text =
    `✨ <b>"O'ZIM XOHLAGANIMDEK" • TORT KONSTRUKTORI</b>\n\n` +
    `Qandolatchimiz sizning xohishingiz bo'yicha maxsus eksklyuziv tort tayyorlab beradi! 🎂\n\n` +
    `<b>1-qadam:</b> Tortning shaklini tanlang (yoki o'zingiz yozing):`;

  if (ctx.callbackQuery) {
    await ctx.answerCallbackQuery();
    return ctx.editMessageText(text, { parse_mode: 'HTML', reply_markup: keyboard }).catch(() => ctx.reply(text, { parse_mode: 'HTML', reply_markup: keyboard }));
  }

  return ctx.reply(text, { parse_mode: 'HTML', reply_markup: keyboard });
}

// Triggers from chat text or commands
customCakeWizard.hears(
  [
    '✨ O\'zim xohlaganimdek',
    '✨ Ўзим хоҳлаганимдек',
    '✨ Свой дизайн торта',
    '✨ O\'zim xohlaganimdek Tort Build',
    '🎂 O\'zim xohlaganimdek',
    '🎂 Ўзим хоҳлаганимдек',
    '🎂 Индивидуальный торт',
    '/custom',
    '/customcake',
  ],
  async (ctx) => {
    return startCustomCakeWizard(ctx);
  }
);

// Custom Shape Text Prompt
customCakeWizard.callbackQuery('cake_custom_shape', async (ctx) => {
  await ctx.answerCallbackQuery();
  ctx.session.step = 'AWAITING_CUSTOM_SHAPE_INPUT';
  return ctx.reply('✍️ Iltimos, o\'zingiz xohlagan tort shaklini yozib yuboring (Masalan: <i>5 raqami shaklida, Yulduzcha yoki Mashina</i>):', {
    parse_mode: 'HTML',
  });
});

/**
 * 2. Step 1 -> Step 2: Shape Chosen -> Choose Layers
 */
function promptChooseLayers(ctx: BotContext, shapeTitle: string) {
  const keyboard = new InlineKeyboard()
    .text('🎂 1 qavat (8-12 kishi)', 'cake_layer_1 qavat')
    .row()
    .text('🎂🎂 2 qavat (15-25 kishi)', 'cake_layer_2 qavat')
    .row()
    .text('👑 3 qavat (30+ kishi / To\'y)', 'cake_layer_3 qavat')
    .row()
    .text('✍️ Boshqa qavat / o\'lcham (O\'zim yozaman)', 'cake_custom_layer')
    .row()
    .text('⬅️ Ortga', 'cake_restart_wizard')
    .text('❌ Bekor qilish', 'cake_cancel_wizard');

  const text =
    `✨ <b>Shakl:</b> ${escapeHtml(shapeTitle)} tanlandi.\n\n` +
    `<b>2-qadam:</b> Tortning qavatlar soni va o'lchamini tanlang:`;

  if (ctx.callbackQuery) {
    return ctx.editMessageText(text, { parse_mode: 'HTML', reply_markup: keyboard }).catch(() => ctx.reply(text, { parse_mode: 'HTML', reply_markup: keyboard }));
  }
  return ctx.reply(text, { parse_mode: 'HTML', reply_markup: keyboard });
}

customCakeWizard.callbackQuery(/^cake_shape_(Dumaloq|Kvadrat|Yurak)$/, async (ctx) => {
  const shape = ctx.match[1];
  if (!ctx.session.pendingCustomCake) ctx.session.pendingCustomCake = {};
  ctx.session.pendingCustomCake.shape = shape;
  await ctx.answerCallbackQuery({ text: `Shakl: ${shape}` });
  return promptChooseLayers(ctx, shape);
});

// Custom Layer Text Prompt
customCakeWizard.callbackQuery('cake_custom_layer', async (ctx) => {
  await ctx.answerCallbackQuery();
  ctx.session.step = 'AWAITING_CUSTOM_LAYER_INPUT';
  return ctx.reply('✍️ Iltimos, o\'zingiz xohlagan qavatlar soni yoki vaznini yozib yuboring (Masalan: <i>4 qavatli, 8 kg yoki Mini bento</i>):', {
    parse_mode: 'HTML',
  });
});

/**
 * 3. Step 2 -> Step 3: Layers Chosen -> Choose Base / Korj
 */
function promptChooseBase(ctx: BotContext, layerTitle: string) {
  const keyboard = new InlineKeyboard()
    .text('🍰 Biskvit (Klassik vanil)', 'cake_base_Biskvit (Klassik)')
    .row()
    .text('🍫 Shokoladli (Quyuq kakao)', 'cake_base_Shokoladli')
    .row()
    .text('🍓 Red Velvet (Qizil baxmal)', 'cake_base_Red Velvet')
    .row()
    .text('✍️ Boshqa korj / xamir (O\'zim yozaman)', 'cake_custom_base')
    .row()
    .text('⬅️ Ortga', 'cake_shape_' + (ctx.session.pendingCustomCake?.shape || 'Dumaloq'))
    .text('❌ Bekor qilish', 'cake_cancel_wizard');

  const text =
    `✨ <b>Qavat:</b> ${escapeHtml(layerTitle)}\n\n` +
    `<b>3-qadam:</b> Tortning korj / bazasini tanlang:`;

  if (ctx.callbackQuery) {
    return ctx.editMessageText(text, { parse_mode: 'HTML', reply_markup: keyboard }).catch(() => ctx.reply(text, { parse_mode: 'HTML', reply_markup: keyboard }));
  }
  return ctx.reply(text, { parse_mode: 'HTML', reply_markup: keyboard });
}

customCakeWizard.callbackQuery(/^cake_layer_(.+)$/, async (ctx) => {
  const layers = ctx.match[1];
  if (!ctx.session.pendingCustomCake) ctx.session.pendingCustomCake = {};
  ctx.session.pendingCustomCake.layers = layers;
  await ctx.answerCallbackQuery({ text: `Qavat: ${layers}` });
  return promptChooseBase(ctx, layers);
});

// Custom Base Text Prompt
customCakeWizard.callbackQuery('cake_custom_base', async (ctx) => {
  await ctx.answerCallbackQuery();
  ctx.session.step = 'AWAITING_CUSTOM_BASE_INPUT';
  return ctx.reply('✍️ Iltimos, o\'zingiz xohlagan biskvit / xamir turini yozib yuboring (Masalan: <i>Medovik qatlam, Pista biskviti yoki Oreo</i>):', {
    parse_mode: 'HTML',
  });
});

/**
 * 4. Step 3 -> Step 4: Base Chosen -> Choose Cream
 */
function promptChooseCream(ctx: BotContext, baseTitle: string) {
  const keyboard = new InlineKeyboard()
    .text('🥛 Slivki (Qaymoqli)', 'cake_cream_Slivki')
    .row()
    .text('🍯 Sgushyonka & Yog\'li', 'cake_cream_Sgushyonka')
    .row()
    .text('🧀 Tvorojniy (Pishloqli kremchiz)', 'cake_cream_Tvorojniy')
    .row()
    .text('✍️ Boshqa krem (O\'zim yozaman)', 'cake_custom_cream')
    .row()
    .text('⬅️ Ortga', 'cake_layer_' + (ctx.session.pendingCustomCake?.layers || '1 qavat'))
    .text('❌ Bekor qilish', 'cake_cancel_wizard');

  const text =
    `✨ <b>Baza:</b> ${escapeHtml(baseTitle)}\n\n` +
    `<b>4-qadam:</b> Qanday krem xohlaysiz?`;

  if (ctx.callbackQuery) {
    return ctx.editMessageText(text, { parse_mode: 'HTML', reply_markup: keyboard }).catch(() => ctx.reply(text, { parse_mode: 'HTML', reply_markup: keyboard }));
  }
  return ctx.reply(text, { parse_mode: 'HTML', reply_markup: keyboard });
}

customCakeWizard.callbackQuery(/^cake_base_(.+)$/, async (ctx) => {
  const base = ctx.match[1];
  if (!ctx.session.pendingCustomCake) ctx.session.pendingCustomCake = {};
  ctx.session.pendingCustomCake.base = base;
  await ctx.answerCallbackQuery({ text: `Baza: ${base}` });
  return promptChooseCream(ctx, base);
});

// Custom Cream Text Prompt
customCakeWizard.callbackQuery('cake_custom_cream', async (ctx) => {
  await ctx.answerCallbackQuery();
  ctx.session.step = 'AWAITING_CUSTOM_CREAM_INPUT';
  return ctx.reply('✍️ Iltimos, o\'zingiz xohlagan krem turini yozib yuboring (Masalan: <i>Shokoladli ganash, Mascarpone yoki Muzqaymoqli</i>):', {
    parse_mode: 'HTML',
  });
});

/**
 * 5. Step 4 -> Step 5: Cream Chosen -> Choose Filling
 */
function promptChooseFilling(ctx: BotContext, creamTitle: string) {
  const keyboard = new InlineKeyboard()
    .text('🍌🍓 Banan va Yagoda', 'cake_filling_Banan va Yagoda')
    .row()
    .text('🍫🌰 Nutella & Shokolad', 'cake_filling_Nutella')
    .row()
    .text('🥜🍯 Yeryong\'oq va Karamel', 'cake_filling_Yeryong\'oq va Karamel')
    .row()
    .text('✍️ Boshqa nachinka (O\'zim yozaman)', 'cake_custom_filling')
    .row()
    .text('⬅️ Ortga', 'cake_base_' + (ctx.session.pendingCustomCake?.base || 'Biskvit (Klassik)'))
    .text('❌ Bekor qilish', 'cake_cancel_wizard');

  const text =
    `✨ <b>Krem:</b> ${escapeHtml(creamTitle)}\n\n` +
    `<b>5-qadam:</b> Tort ichi uchun nachinka (to'ldirgich) tanlang:`;

  if (ctx.callbackQuery) {
    return ctx.editMessageText(text, { parse_mode: 'HTML', reply_markup: keyboard }).catch(() => ctx.reply(text, { parse_mode: 'HTML', reply_markup: keyboard }));
  }
  return ctx.reply(text, { parse_mode: 'HTML', reply_markup: keyboard });
}

customCakeWizard.callbackQuery(/^cake_cream_(.+)$/, async (ctx) => {
  const cream = ctx.match[1];
  if (!ctx.session.pendingCustomCake) ctx.session.pendingCustomCake = {};
  ctx.session.pendingCustomCake.cream = cream;
  await ctx.answerCallbackQuery({ text: `Krem: ${cream}` });
  return promptChooseFilling(ctx, cream);
});

// Custom Filling Text Prompt
customCakeWizard.callbackQuery('cake_custom_filling', async (ctx) => {
  await ctx.answerCallbackQuery();
  ctx.session.step = 'AWAITING_CUSTOM_FILLING_INPUT';
  return ctx.reply('✍️ Iltimos, o\'zingiz xohlagan nachinka yoki mevalarni yozib yuboring (Masalan: <i>Mango-marakuya, Malinali jem yoki Pista</i>):', {
    parse_mode: 'HTML',
  });
});

/**
 * 6. Step 5 -> Step 6: Filling Chosen -> Custom Text Prompt
 */
function promptCustomText(ctx: BotContext, fillingTitle: string) {
  ctx.session.step = 'AWAITING_CUSTOM_TEXT';

  const keyboard = new InlineKeyboard()
    .text('⏭️ Yozuvsiz davom etish', 'cake_skip_text')
    .row()
    .text('❌ Bekor qilish', 'cake_cancel_wizard');

  const text =
    `✨ <b>Nachinka:</b> ${escapeHtml(fillingTitle)}\n\n` +
    `<b>6-qadam:</b> Tort ustiga yoziladigan yozuv / tabrikni yozing:\n\n` +
    `<i>Masalan: "Tug'ilgan kuning bilan, Dinora!"</i>\n\n` +
    `Yoki yozuv kerak bo'lmasa, pastdagi <b>[⏭️ Yozuvsiz davom etish]</b> tugmasini bosing:`;

  if (ctx.callbackQuery) {
    return ctx.editMessageText(text, { parse_mode: 'HTML', reply_markup: keyboard }).catch(() => ctx.reply(text, { parse_mode: 'HTML', reply_markup: keyboard }));
  }
  return ctx.reply(text, { parse_mode: 'HTML', reply_markup: keyboard });
}

customCakeWizard.callbackQuery(/^cake_filling_(.+)$/, async (ctx) => {
  const filling = ctx.match[1];
  if (!ctx.session.pendingCustomCake) ctx.session.pendingCustomCake = {};
  ctx.session.pendingCustomCake.filling = filling;
  await ctx.answerCallbackQuery({ text: `Nachinka: ${filling}` });
  return promptCustomText(ctx, filling);
});

/**
 * Handle Free Text Inputs for Custom Options (Shape, Layer, Base, Cream, Filling, CustomText)
 */
customCakeWizard.on('message:text', async (ctx, next) => {
  const text = ctx.message.text.trim();
  if (!ctx.session.pendingCustomCake) ctx.session.pendingCustomCake = {};

  if (ctx.session.step === 'AWAITING_CUSTOM_SHAPE_INPUT') {
    ctx.session.pendingCustomCake.shape = text;
    ctx.session.step = 'IDLE';
    return promptChooseLayers(ctx, text);
  }

  if (ctx.session.step === 'AWAITING_CUSTOM_LAYER_INPUT') {
    ctx.session.pendingCustomCake.layers = text;
    ctx.session.step = 'IDLE';
    return promptChooseBase(ctx, text);
  }

  if (ctx.session.step === 'AWAITING_CUSTOM_BASE_INPUT') {
    ctx.session.pendingCustomCake.base = text;
    ctx.session.step = 'IDLE';
    return promptChooseCream(ctx, text);
  }

  if (ctx.session.step === 'AWAITING_CUSTOM_CREAM_INPUT') {
    ctx.session.pendingCustomCake.cream = text;
    ctx.session.step = 'IDLE';
    return promptChooseFilling(ctx, text);
  }

  if (ctx.session.step === 'AWAITING_CUSTOM_FILLING_INPUT') {
    ctx.session.pendingCustomCake.filling = text;
    ctx.session.step = 'IDLE';
    return promptCustomText(ctx, text);
  }

  if (ctx.session.step === 'AWAITING_CUSTOM_TEXT') {
    ctx.session.pendingCustomCake.customText = text;
    return promptForPhoto(ctx);
  }

  return next();
});

/**
 * 7. Photo Upload or Skipped -> Step 8: Delivery Method & Location
 */
customCakeWizard.callbackQuery('cake_skip_text', async (ctx) => {
  await ctx.answerCallbackQuery();
  if (!ctx.session.pendingCustomCake) ctx.session.pendingCustomCake = {};
  ctx.session.pendingCustomCake.customText = undefined;
  return promptForPhoto(ctx);
});

async function promptForPhoto(ctx: BotContext) {
  ctx.session.step = 'AWAITING_CUSTOM_PHOTO';

  const keyboard = new InlineKeyboard()
    .text('⏭️ Rasmsiz davom etish', 'cake_skip_photo')
    .row()
    .text('❌ Bekor qilish', 'cake_cancel_wizard');

  const text =
    `📸 <b>7-qadam:</b> Tort namunasi fotosurati (Ixtiyoriy)\n\n` +
    `Agar sizda namuna rasm bo'lsa, fotosuratni yuboring. Agar rasm bo'lmasa, <b>[⏭️ Rasmsiz davom etish]</b> tugmasini bosing:`;

  return ctx.reply(text, { parse_mode: 'HTML', reply_markup: keyboard });
}

customCakeWizard.callbackQuery('cake_skip_photo', async (ctx) => {
  await ctx.answerCallbackQuery();
  return promptForDeliveryMethod(ctx);
});

customCakeWizard.on('message:photo', async (ctx, next) => {
  if (ctx.session.step === 'AWAITING_CUSTOM_PHOTO') {
    const photo = ctx.message.photo.pop();
    if (!ctx.session.pendingCustomCake) ctx.session.pendingCustomCake = {};
    if (photo) {
      ctx.session.pendingCustomCake.referenceImageUrl = photo.file_id;
    }
    return promptForDeliveryMethod(ctx);
  }
  return next();
});

async function promptForDeliveryMethod(ctx: BotContext) {
  ctx.session.step = 'AWAITING_CUSTOM_LOCATION';

  const keyboard = new InlineKeyboard()
    .text('🚚 Yetkazib berish (GPS orqali)', 'cake_method_delivery')
    .row()
    .text('🛍️ O\'zim olib ketaman (Do\'kondan)', 'cake_method_pickup')
    .row()
    .text('❌ Bekor qilish', 'cake_cancel_wizard');

  const text =
    `🚖 <b>8-qadam:</b> Yetkazib berish usulini tanlang:\n\n` +
    `💡 <i>2 km gacha yetkazib berish BEPUL, 2 km dan oshsa +15,000 so'm/km qo'shiladi.</i>`;

  return ctx.reply(text, { parse_mode: 'HTML', reply_markup: keyboard });
}

/**
 * Delivery method: Pickup
 */
customCakeWizard.callbackQuery('cake_method_pickup', async (ctx) => {
  await ctx.answerCallbackQuery();
  if (!ctx.session.pendingCustomCake) ctx.session.pendingCustomCake = {};
  ctx.session.pendingCustomCake.deliveryType = 'PICKUP';
  ctx.session.pendingCustomCake.deliveryAddress = 'Do\'kondan olib ketish (Sirdaryo t., M34 9-uy)';
  ctx.session.pendingCustomCake.distanceKm = 0;
  ctx.session.pendingCustomCake.deliveryFee = 0;

  return showSummaryAndConfirmation(ctx);
});

/**
 * Delivery method: Delivery -> Request Geolocation
 */
customCakeWizard.callbackQuery('cake_method_delivery', async (ctx) => {
  await ctx.answerCallbackQuery();
  if (!ctx.session.pendingCustomCake) ctx.session.pendingCustomCake = {};
  ctx.session.pendingCustomCake.deliveryType = 'DELIVERY';

  const locKeyboard = new Keyboard()
    .requestLocation('📍 Geolokatsiyamni yuborish')
    .row()
    .text('❌ Bekor qilish')
    .resized()
    .oneTime();

  return ctx.reply(
    `📍 Iltimos, pastdagi <b>[📍 Geolokatsiyamni yuborish]</b> tugmasini bosing:\n\n` +
    `GPS orqali masofa aniqlanadi (2 km gacha BEPUL, 2 km dan oshsa +15,000 so'm/km).`,
    {
      parse_mode: 'HTML',
      reply_markup: locKeyboard,
    }
  );
});

/**
 * Location Received
 */
customCakeWizard.on('message:location', async (ctx, next) => {
  if (ctx.session.step === 'AWAITING_CUSTOM_LOCATION' && ctx.session.pendingCustomCake) {
    const { latitude, longitude } = ctx.message.location;
    const distanceKm = calculateDistanceKm(latitude, longitude, STORE_COORDINATES.latitude, STORE_COORDINATES.longitude);
    const feeResult = calculateCustomCakeDeliveryFee(distanceKm);

    ctx.session.pendingCustomCake.latitude = latitude;
    ctx.session.pendingCustomCake.longitude = longitude;
    ctx.session.pendingCustomCake.distanceKm = distanceKm;
    ctx.session.pendingCustomCake.deliveryFee = feeResult.deliveryFee;
    ctx.session.pendingCustomCake.deliveryAddress = `GPS (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;

    return showSummaryAndConfirmation(ctx);
  }
  return next();
});

/**
 * 9. Summary & Final Submission Confirmation
 */
async function showSummaryAndConfirmation(ctx: BotContext) {
  ctx.session.step = 'IDLE';
  const cake = ctx.session.pendingCustomCake || {};

  const shape = cake.shape || 'Dumaloq';
  const layers = cake.layers || '1 qavat';
  const base = cake.base || 'Biskvit (Klassik)';
  const cream = cake.cream || 'Slivki';
  const filling = cake.filling || 'Banan va Yagoda';
  const customText = cake.customText ? `"${escapeHtml(cake.customText)}"` : 'Yo\'q';
  const isDelivery = cake.deliveryType === 'DELIVERY';
  const distText = isDelivery ? `${cake.distanceKm || 0} km (Yetkazish: ${(cake.deliveryFee || 0).toLocaleString('uz-UZ')} UZS)` : 'Do\'kondan olib ketish (0 UZS)';

  const summary =
    `✨ <b>MAXSUS TORT BUYURTMASI TAYYOR!</b>\n\n` +
    `⭕️ <b>Shakli:</b> ${escapeHtml(shape)}\n` +
    `🎂 <b>Qavatlar:</b> ${escapeHtml(layers)}\n` +
    `🍰 <b>Baza (Korj):</b> ${escapeHtml(base)}\n` +
    `🥛 <b>Krem:</b> ${escapeHtml(cream)}\n` +
    `🍓 <b>Nachinka:</b> ${escapeHtml(filling)}\n` +
    `✍️ <b>Tabrik yozuvi:</b> ${customText}\n` +
    `🚚 <b>Yetkazish / Masofa:</b> ${distText}\n\n` +
    `<i>So'rovingiz qabul qilingach, konditerimiz narx belgilaydi va Telegram orqali sizga tasdiqlash uchun xabar keladi.</i>\n\n` +
    `Buyurtma so'rovini Adminga yuboramizmi?`;

  const keyboard = new InlineKeyboard()
    .text('✅ So\'rovni Adminga Yuborish', 'cake_confirm_submission')
    .row()
    .text('🔄 Qaytadan boshlash', 'cake_restart_wizard')
    .text('❌ Bekor qilish', 'cake_cancel_wizard');

  return ctx.reply(summary, {
    parse_mode: 'HTML',
    reply_markup: keyboard,
  });
}

/**
 * 10. Execute Submission to Database & Notify Admin
 */
customCakeWizard.callbackQuery('cake_confirm_submission', async (ctx) => {
  await ctx.answerCallbackQuery();
  const telegramId = ctx.from!.id;
  const pending = ctx.session.pendingCustomCake;

  if (!pending) {
    return ctx.reply('Xatolik yuz berdi. Iltimos qaytadan urinib ko\'ring.', {
      reply_markup: getMainKeyboard(),
    });
  }

  const user = await prisma.user.findUnique({
    where: { telegramId: BigInt(telegramId) },
  }).catch(() => null);

  const formattedDescription = [
    `🎂 Shakli: ${pending.shape || 'Dumaloq'}`,
    `📐 Qavatlar: ${pending.layers || '1 qavat'}`,
    `🍰 Korj (Baza): ${pending.base || 'Biskvit (Klassik)'}`,
    `🥛 Krem: ${pending.cream || 'Slivki'}`,
    `🍓 Nachinka: ${pending.filling || 'Banan va Yagoda'}`,
    pending.customText ? `✍️ Yozuv: "${pending.customText}"` : null,
    pending.distanceKm ? `📍 Masofa: ${pending.distanceKm} km (Yetkazish: ${(pending.deliveryFee || 0).toLocaleString('uz-UZ')} UZS)` : null,
  ].filter(Boolean).join(' | ');

  const cakeRequest = await customCakeService.createRequest({
    telegramId,
    phone: user?.phone || 'Biriktirilmagan',
    firstName: ctx.from?.first_name || 'Mijoz',
    lastName: ctx.from?.last_name,
    username: ctx.from?.username,
    referenceImageUrl: pending.referenceImageUrl,
    description: formattedDescription,
    customDetails: {
      shape: pending.shape,
      layers: pending.layers,
      base: pending.base,
      cream: pending.cream,
      filling: pending.filling,
      customText: pending.customText,
    },
    deliveryType: pending.deliveryType || 'DELIVERY',
    deliveryAddress: pending.deliveryAddress,
    latitude: pending.latitude,
    longitude: pending.longitude,
    distanceKm: pending.distanceKm,
    deliveryFee: pending.deliveryFee,
  });

  ctx.session.pendingCustomCake = undefined;
  ctx.session.step = 'IDLE';

  await ctx.reply(
    `🎉 <b>So'rovingiz muvaffaqiyatli qabul qilindi!</b>\n\n` +
    `🆔 So'rov raqami: <b>#${cakeRequest.requestNumber}</b>\n` +
    `⏳ Holat: <b>Admin narx belgilamoqda... (PENDING_PRICING)</b>\n\n` +
    `Konditerimiz narx belgilashi bilanoq sizga Telegram orqali xabar yuboriladi va tasdiqlashingiz mumkin bo'ladi!`,
    {
      parse_mode: 'HTML',
      reply_markup: getMainKeyboard(),
    }
  );

  // Admin notification is dispatched inside customCakeService.createRequest
});

/**
 * 11. Wizard Restart / Cancel
 */
customCakeWizard.callbackQuery('cake_restart_wizard', async (ctx) => {
  return startCustomCakeWizard(ctx);
});

customCakeWizard.callbackQuery('cake_cancel_wizard', async (ctx) => {
  await ctx.answerCallbackQuery({ text: 'Bekor qilindi' });
  ctx.session.pendingCustomCake = undefined;
  ctx.session.step = 'IDLE';

  return ctx.reply('Maxsus tort buyurtmasi bekor qilindi.', {
    reply_markup: getMainKeyboard(),
  });
});
