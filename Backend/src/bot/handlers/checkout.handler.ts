import { Composer, InlineKeyboard } from 'grammy';
import { BotContext } from '../context.js';
import { getDeliveryTypeInlineKeyboard, getPaymentModeInlineKeyboard, getDistrictInlineKeyboard } from '../keyboards/order.keyboard.js';
import { getLocationRequestKeyboard, getMainKeyboard } from '../keyboards/main.keyboard.js';
import { OrderService } from '../../modules/orders/order.service.js';
import { PaymentService } from '../../modules/payment/payment.service.js';
import { getAdminOrderApprovalKeyboard } from '../keyboards/admin.keyboard.js';
import { env } from '../../config/env.js';
import { prisma } from '../../config/database.js';

export const checkoutHandler = new Composer<BotContext>();
const orderService = new OrderService();
const paymentService = new PaymentService();

checkoutHandler.callbackQuery('checkout_start', async (ctx) => {
  ctx.answerCallbackQuery().catch(() => {});
  if (!ctx.session.cart || ctx.session.cart.length === 0) {
    return ctx.reply('Savatchangiz bo\'sh!');
  }

  ctx.session.pendingOrder = {};
  ctx.session.step = 'AWAITING_NAME';

  const defaultName = ctx.from?.first_name || '';
  const kb = new InlineKeyboard();
  if (defaultName) {
    kb.text(`👤 ${defaultName} sifatida davom etish`, 'name_default').row();
  }

  return ctx.reply(`👤 **Iltimos, ismingiz va familiyangizni kiriting:**\n(Masalan: Dinora Axmedova)`, {
    parse_mode: 'Markdown',
    reply_markup: kb,
  });
});

checkoutHandler.callbackQuery('name_default', async (ctx) => {
  ctx.answerCallbackQuery().catch(() => {});
  if (!ctx.session.pendingOrder) ctx.session.pendingOrder = {};
  ctx.session.pendingOrder.customerName = ctx.from?.first_name || 'Mijoz';
  ctx.session.step = 'AWAITING_DELIVERY_TYPE';

  return ctx.reply(`🚖 Yetkazib berish turini tanlang:`, {
    parse_mode: 'Markdown',
    reply_markup: getDeliveryTypeInlineKeyboard(),
  });
});

checkoutHandler.callbackQuery('delivery_delivery', async (ctx) => {
  ctx.answerCallbackQuery().catch(() => {});
  if (!ctx.session.pendingOrder) ctx.session.pendingOrder = {};
  ctx.session.pendingOrder.deliveryType = 'DELIVERY';
  ctx.session.step = 'AWAITING_DISTRICT';

  return ctx.reply('📍 Iltimos, tuman yoki shaharingizni tanlang (yoki nomini yozib yuboring):', {
    reply_markup: getDistrictInlineKeyboard(),
  });
});

checkoutHandler.callbackQuery(/^dist_(.+)$/, async (ctx) => {
  ctx.answerCallbackQuery().catch(() => {});
  if (!ctx.session.pendingOrder) ctx.session.pendingOrder = {};
  const districtChoice = ctx.match[1];

  if (districtChoice === 'custom') {
    return ctx.reply('✏️ Iltimos, tuman yoki shahar nomini matn ko\'rinishida yozib yuboring:');
  }

  ctx.session.pendingOrder.deliveryDistrict = districtChoice;
  ctx.session.step = 'AWAITING_LOCATION';

  return ctx.reply(`📍 **${districtChoice}** qabul qilindi.\n\nEndi ko'cha, mahalla nomini yoki geolokatsiyangizni yuboring:`, {
    parse_mode: 'Markdown',
    reply_markup: getLocationRequestKeyboard(),
  });
});

checkoutHandler.callbackQuery('delivery_pickup', async (ctx) => {
  ctx.answerCallbackQuery().catch(() => {});
  if (!ctx.session.pendingOrder) ctx.session.pendingOrder = {};
  ctx.session.pendingOrder.deliveryType = 'PICKUP';
  ctx.session.pendingOrder.deliveryDistrict = 'Sirdaryo tumani';
  ctx.session.pendingOrder.deliveryAddress = "Olib ketish (Sirdaryo tumani, M34 ko'chasi 9-uy, DINORA konditeriyasi)";
  ctx.session.step = 'AWAITING_PAYMENT_MODE';

  const lat = 40.814866;
  const lon = 68.680686;

  // Send native Telegram geolocation pin
  await ctx.api.sendLocation(ctx.chat!.id, lat, lon).catch(() => {});

  const mapsUrl = `https://www.google.com/maps?q=${lat},${lon}`;

  return ctx.reply(
    `🏪 **Olib ketish manzili:**\n📍 **Sirdaryo tumani, M34 ko'chasi 9-uy**\n(Mo'ljal: DINORA konditeriyasi binosi)\n\n🗺️ [Google Maps orqali ko'rish](${mapsUrl})\n\n💳 **Iltimos, to'lov usulini tanlang:**`,
    {
      parse_mode: 'Markdown',
      reply_markup: getPaymentModeInlineKeyboard(),
    }
  );
});

checkoutHandler.on('message:location', async (ctx) => {
  if (ctx.session.step === 'AWAITING_LOCATION' && ctx.session.pendingOrder) {
    const { latitude, longitude } = ctx.message.location;
    const district = ctx.session.pendingOrder.deliveryDistrict || 'Sirdaryo tumani';
    ctx.session.pendingOrder.latitude = latitude;
    ctx.session.pendingOrder.longitude = longitude;
    ctx.session.pendingOrder.deliveryAddress = `${district}, Geolokatsiya (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;

    ctx.session.step = 'AWAITING_PAYMENT_MODE';

    return ctx.reply('💳 Rahmat! Endi to\'lov turini tanlang:', {
      reply_markup: getPaymentModeInlineKeyboard(),
    });
  }
});

checkoutHandler.on('message:text', async (ctx, next) => {
  if (!ctx.session.pendingOrder) return next();

  if (ctx.session.step === 'AWAITING_NAME') {
    ctx.session.pendingOrder.customerName = ctx.message.text.trim();
    ctx.session.step = 'AWAITING_DELIVERY_TYPE';

    return ctx.reply(`🚖 Rahmat, **${ctx.message.text.trim()}**!\n\nYetkazib berish turini tanlang:`, {
      parse_mode: 'Markdown',
      reply_markup: getDeliveryTypeInlineKeyboard(),
    });
  }

  if (ctx.session.step === 'AWAITING_DISTRICT') {
    const customDist = ctx.message.text.trim();
    ctx.session.pendingOrder.deliveryDistrict = customDist;
    ctx.session.step = 'AWAITING_LOCATION';

    return ctx.reply(`📍 **${customDist}** qabul qilindi.\n\nEndi ko'cha, mahalla nomini yoki geolokatsiyangizni yuboring:`, {
      parse_mode: 'Markdown',
      reply_markup: getLocationRequestKeyboard(),
    });
  }

  if (ctx.session.step === 'AWAITING_LOCATION') {
    const textAddress = ctx.message.text.trim();
    const district = ctx.session.pendingOrder.deliveryDistrict || 'Sirdaryo tumani';
    ctx.session.pendingOrder.deliveryAddress = `${district}, ${textAddress}`;
    ctx.session.step = 'AWAITING_PAYMENT_MODE';

    return ctx.reply('💳 Rahmat! Endi to\'lov turini tanlang:', {
      reply_markup: getPaymentModeInlineKeyboard(),
    });
  }

  return next();
});

checkoutHandler.callbackQuery('payment_card', async (ctx) => {
  ctx.answerCallbackQuery().catch(() => {});
  if (!ctx.session.pendingOrder) return;
  ctx.session.pendingOrder.paymentMode = 'CARD_TRANSFER';
  return finalizeOrderAndPromptReceipt(ctx);
});

checkoutHandler.callbackQuery('payment_cash', async (ctx) => {
  ctx.answerCallbackQuery().catch(() => {});
  if (!ctx.session.pendingOrder) return;
  ctx.session.pendingOrder.paymentMode = 'CASH';
  return finalizeOrderCash(ctx);
});

async function finalizeOrderAndPromptReceipt(ctx: BotContext) {
  const telegramId = ctx.from!.id;
  const pending = ctx.session.pendingOrder;
  const cart = ctx.session.cart;

  if (!pending || !cart || cart.length === 0) {
    return ctx.reply('Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
  }

  const user = await prisma.user.findUnique({
    where: { telegramId: BigInt(telegramId) },
  }).catch(() => null);

  const customerName = pending.customerName || ctx.from?.first_name || 'Mijoz';
  const deliveryDistrict = pending.deliveryDistrict || 'Sirdaryo tumani';

  let order: any;
  try {
    order = await orderService.createOrder({
      telegramId,
      customerPhone: user?.phone || pending.phone || 'Biriktirilmagan',
      customerName,
      mahalla: '',
      street: pending.deliveryAddress || deliveryDistrict,
      houseNumber: '',
      deliveryDistrict,
      deliveryDate: pending.deliveryDate,
      paymentMode: 'CARD_TRANSFER',
      notes: pending.notes,
      cartItems: cart.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      totalAmount: 0,
    });
  } catch (err: any) {
    return ctx.reply(err.message || '⚠️ Ushbu sana band qilingan! Iltimos, boshqa sanani tanlang.');
  }

  if (!ctx.session.pendingOrder) {
    ctx.session.pendingOrder = {};
  }
  ctx.session.pendingOrder.orderId = order.id;
  ctx.session.step = 'AWAITING_PAYMENT_RECEIPT';

  const cleanCard = env.ADMIN_CARD_NUMBER.replace(/\s+/g, '');

  await ctx.reply(
    `💳 **To'lov ma'lumotlari (Karta o'tkazmasi)**\n\n🆔 Buyurtma №: **#${order.orderNumber}**\n👤 Mijoz: **${customerName}**\n📍 Hudud: **${deliveryDistrict}**\n💰 Jami summa: **${Number(order.totalAmount).toLocaleString('uz-UZ')} so'm**\n\n💳 Karta raqami (Nusxalash uchun bosing):\n<code>${cleanCard}</code>\n👤 Karta egasi: **${env.ADMIN_CARD_HOLDER}**\n\n📲 Iltimos, Click / Payme / Uzum ilovasi orqali **${Number(order.totalAmount).toLocaleString('uz-UZ')} so'm** to'lovni amalga oshiring va **to'lov chek skrinshotini shu yerga rasm ko'rinishida yuboring!**`,
    {
      parse_mode: 'HTML',
    }
  );
}

async function finalizeOrderCash(ctx: BotContext) {
  const telegramId = ctx.from!.id;
  const pending = ctx.session.pendingOrder;
  const cart = ctx.session.cart;

  if (!pending || !cart || cart.length === 0) {
    return ctx.reply('Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
  }

  const user = await prisma.user.findUnique({
    where: { telegramId: BigInt(telegramId) },
  }).catch(() => null);

  const customerName = pending.customerName || ctx.from?.first_name || 'Mijoz';
  const deliveryDistrict = pending.deliveryDistrict || 'Sirdaryo tumani';

  let order: any;
  try {
    order = await orderService.createOrder({
      telegramId,
      customerPhone: user?.phone || pending.phone || 'Biriktirilmagan',
      customerName,
      mahalla: '',
      street: pending.deliveryAddress || deliveryDistrict,
      houseNumber: '',
      deliveryDistrict,
      deliveryDate: pending.deliveryDate,
      paymentMode: 'CASH',
      notes: pending.notes,
      cartItems: cart.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      totalAmount: 0,
    });
  } catch (err: any) {
    return ctx.reply(err.message || '⚠️ Ushbu sana band qilingan! Iltimos, boshqa sanani tanlang.');
  }

  ctx.session.cart = [];
  ctx.session.pendingOrder = undefined;
  ctx.session.step = 'IDLE';

  const safeCustomerName = customerName.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeDeliveryDistrict = deliveryDistrict.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeAddress = (order.deliveryAddress || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeUsername = (ctx.from?.username || 'yoq').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safePhone = (user?.phone || pending.phone || 'Yo\'q').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  await ctx.reply(
    `🎉 <b>Buyurtmangiz qabul qilindi!</b>\n\n🆔 Buyurtma №: <b>#${order.orderNumber}</b>\n👤 Mijoz: <b>${safeCustomerName}</b>\n📍 Hudud: <b>${safeDeliveryDistrict}</b>\n💰 Jami: <b>${Number(order.totalAmount).toLocaleString('uz-UZ')} so'm</b>\n💵 To'lov usuli: <b>Naqd pul (Qabul qilinganda)</b>\n\nDINORA jamoasi tez orada bog'lanadi!`,
    {
      parse_mode: 'HTML',
      reply_markup: getMainKeyboard(),
    }
  );

  // Notify admins
  const adminMsg = `🆕 <b>YANGI BUYURTMA #${order.orderNumber}</b>\n👤 Mijoz: <b>${safeCustomerName}</b> (@${safeUsername})\n📞 Tel: <b>${safePhone}</b>\n📍 Manzil: ${safeAddress}\n💰 Summa: <b>${Number(order.totalAmount).toLocaleString('uz-UZ')} UZS</b>\n💵 To'lov: Naqd pul`;

  Promise.all(
    env.ADMIN_IDS.map((adminId) =>
      ctx.api.sendMessage(adminId, adminMsg, {
        parse_mode: 'HTML',
        reply_markup: getAdminOrderApprovalKeyboard(order.id, env.FRONTEND_WEB_URL),
      })
    )
  ).catch((err) => console.error('Error notifying admins:', err));
}

checkoutHandler.on('message:photo', async (ctx) => {
  if (ctx.session.step === 'AWAITING_PAYMENT_RECEIPT' && ctx.session.pendingOrder?.orderId) {
    const orderId = ctx.session.pendingOrder.orderId;
    const photos = ctx.message.photo;
    const photoFileId = photos[photos.length - 1].file_id;

    const updatedOrder = await orderService.updateOrderReceipt(orderId, photoFileId);

    ctx.session.cart = [];
    ctx.session.pendingOrder = undefined;
    ctx.session.step = 'IDLE';

    await ctx.reply(
      `✅ <b>To'lov cheki qabul qilindi!</b>\n\n🆔 Buyurtma №: <b>#${updatedOrder.orderNumber}</b>\n📍 Hudud: <b>Sirdaryo tumani</b>\n📄 Holati: <b>Admin tasdiqlashi kutilmoqda...</b>\n\nDINORA jamoasi chekni tekshirib, tez orada buyurtmangizni tasdiqlaydi! ✨`,
      {
        parse_mode: 'HTML',
        reply_markup: getMainKeyboard(),
      }
    );

    const safeFirstName = (ctx.from?.first_name || 'Mijoz').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const safeUser = (ctx.from?.username || 'yoq').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const safePhone = (updatedOrder.user?.phone || updatedOrder.phone || 'Yo\'q').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const safeAddress = (updatedOrder.deliveryAddress || 'Kiritilmagan').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const adminCaption = `🆕 <b>YANGI BUYURTMA #${updatedOrder.orderNumber}</b>\n👤 Mijoz: <b>${safeFirstName}</b> (@${safeUser})\n📞 Tel: <b>${safePhone}</b>\n📍 Manzil: ${safeAddress}\n💰 Summa: <b>${Number(updatedOrder.totalAmount).toLocaleString('uz-UZ')} UZS</b>\n📄 Holati: Chek yuklandi (Tasdiqlash kutilmoqda)`;

    Promise.all(
      env.ADMIN_IDS.map((adminId) =>
        ctx.api.sendPhoto(adminId, photoFileId, {
          caption: adminCaption,
          parse_mode: 'HTML',
          reply_markup: getAdminOrderApprovalKeyboard(updatedOrder.id, env.FRONTEND_WEB_URL),
        })
      )
    ).catch((err) => console.error('Error sending receipt to admin:', err));
  }
});

// Customer confirms receiving order in Telegram
checkoutHandler.callbackQuery(/^customer_received_order_(.+)$/, async (ctx) => {
  ctx.answerCallbackQuery().catch(() => {});
  const orderId = ctx.match[1];
  try {
    const order = await orderService.updateOrderStatus(orderId, {
      status: 'COMPLETED' as any,
      adminNotes: 'Confirmed received by customer via Telegram Bot',
    });

    const ratingKb = new InlineKeyboard()
      .text('⭐ 1', `rate_order_${orderId}_1`)
      .text('⭐ 2', `rate_order_${orderId}_2`)
      .text('⭐ 3', `rate_order_${orderId}_3`)
      .text('⭐ 4', `rate_order_${orderId}_4`)
      .text('⭐ 5', `rate_order_${orderId}_5`);

    await ctx.reply(
      `🎂 <b>Buyurtma №#${order.orderNumber} qabul qilindi!</b>\n\nDINORA shirinliklarini tanlaganingiz uchun tashakkur! Yoqimli ishtaha! 🎉\n\nIltimos, xizmatimiz sifatini <b>1 dan 5 yulduzgacha</b> baholang:`,
      {
        parse_mode: 'HTML',
        reply_markup: ratingKb,
      }
    );
  } catch (err: any) {
    await ctx.reply(`Xatolik yuz berdi: ${err.message}`);
  }
});

// Customer rates order with 1-5 stars in Telegram
checkoutHandler.callbackQuery(/^rate_order_(.+)_([1-5])$/, async (ctx) => {
  ctx.answerCallbackQuery({ text: 'Baholaganingiz uchun rahmat!' }).catch(() => {});
  const orderId = ctx.match[1];
  const rating = parseInt(ctx.match[2], 10);

  try {
    const order = await orderService.rateOrder(orderId, rating);
    const stars = '⭐'.repeat(rating);

    await ctx.editMessageText(
      `✨ <b>Katta rahmat!</b>\n\nSiz <b>#${order.orderNumber}</b> sonli buyurtmaga <b>${stars} (${rating}/5)</b> baho qoldirdingiz!\n\nBiz siz uchun yanada mazali va sifatli shirinliklar tayyorlashda davom etamiz! ❤️`,
      { parse_mode: 'HTML' }
    );
  } catch (err: any) {
    await ctx.reply(`Baho saqlanmadi: ${err.message}`);
  }
});

