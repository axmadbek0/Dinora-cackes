import { Composer, InlineKeyboard } from 'grammy';
import { BotContext } from '../context.js';
import { OrderService } from '../../modules/orders/order.service.js';
import { CustomCakeService } from '../../modules/custom-cakes/custom-cake.service.js';
import { SettingService } from '../../modules/settings/setting.service.js';
import { getAdminDashboardInlineKeyboard, getAdminMainReplyKeyboard, getAdminOrderApprovalKeyboard } from '../keyboards/admin.keyboard.js';
import { env, isTelegramAdmin } from '../../config/env.js';
import { translate } from '../i18n.js';

export const adminHandler = new Composer<BotContext>();
const orderService = new OrderService();
const customCakeService = new CustomCakeService();
const settingService = new SettingService();

function isAuthorizedAdmin(userId?: number | string | bigint): boolean {
  return isTelegramAdmin(userId);
}

function escapeHtml(str?: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// 1. /admin command handler
adminHandler.command('admin', async (ctx) => {
  const userId = Number(ctx.from?.id);
  if (!isAuthorizedAdmin(userId)) {
    return ctx.reply('⛔ <b>Kechirasiz, sizda administrator huquqi mavjud emas!</b>\nUshbu panel faqat rasmiy adminlar uchun mo\'ljallangan.', {
      parse_mode: 'HTML',
    });
  }

  const adminName = escapeHtml(ctx.from?.first_name || 'Admin');
  return ctx.reply(
    `👑 <b>DINORA Shirinliklari • Boshqaruv Markazi</b>\n\n👤 Administrator: <b>${adminName}</b>\n🆔 Telegram ID: <code>${userId}</code>\n\nQuyidagi tugma orqali to'liq <b>Admin Panel (Mini App)</b>ni ochishingiz yoki tezkor amallardan foydalanishingiz mumkin:`,
    {
      parse_mode: 'HTML',
      reply_markup: getAdminDashboardInlineKeyboard(),
    }
  );
});

// Admin Reply Menu triggers
adminHandler.hears('📦 Buyurtmalar', async (ctx) => {
  if (!isAuthorizedAdmin(Number(ctx.from?.id))) return;
  return showRecentOrders(ctx);
});

adminHandler.hears('🎂 Maxsus Buyurtmalar', async (ctx) => {
  if (!isAuthorizedAdmin(Number(ctx.from?.id))) return;
  return showRecentCustomCakes(ctx);
});

adminHandler.hears('⚙️ Sozlamalar', async (ctx) => {
  if (!isAuthorizedAdmin(Number(ctx.from?.id))) return;
  return showStoreSettings(ctx);
});

adminHandler.hears('📊 Admin Panel (Mini App)', async (ctx) => {
  if (!isAuthorizedAdmin(Number(ctx.from?.id))) return;
  const url = env.FRONTEND_WEB_URL ? `${env.FRONTEND_WEB_URL}/adminpanel` : 'https://dinorashirinliklari.uz/adminpanel';
  return ctx.reply(
    `📊 <b>DINORA Shirinliklari • Admin Panel</b>\n\n🌐 <b>Kirish havolasi:</b> <code>${url}</code>\n\n👤 <b>Standart login:</b> <code>Dinorashirinliklari</code>\n🔒 <b>Standart parol:</b> <code>Dinora#2026!MasterPass</code>\n\n💡 <i>Telegram Mini App ichida ochilganida vakolatli adminlar to'g'ridan-to'g'ri avtomatik kiritiladi.</i>`,
    { parse_mode: 'HTML' }
  );
});

adminHandler.callbackQuery('admin_open_panel_info', async (ctx) => {
  if (!isAuthorizedAdmin(Number(ctx.from?.id))) {
    return ctx.answerCallbackQuery({ text: '⛔ Ruxsat berilmagan!', show_alert: true });
  }
  await ctx.answerCallbackQuery();
  const url = env.FRONTEND_WEB_URL ? `${env.FRONTEND_WEB_URL}/adminpanel` : 'https://dinorashirinliklari.uz/adminpanel';
  return ctx.reply(
    `📊 <b>DINORA Shirinliklari • Admin Panel</b>\n\n🌐 <b>Kirish havolasi:</b> <code>${url}</code>\n\n👤 <b>Login:</b> <code>Dinorashirinliklari</code>\n🔒 <b>Parol:</b> <code>Dinora#2026!MasterPass</code>\n\n💡 <i>Telegram Mini App ichida ochilganida vakolatli adminlar to'g'ridan-to'g'ri avtomatik kiritiladi.</i>`,
    { parse_mode: 'HTML' }
  );
});

// 2. Callback: List Orders
adminHandler.callbackQuery('admin_list_orders', async (ctx) => {
  if (!isAuthorizedAdmin(Number(ctx.from?.id))) {
    return ctx.answerCallbackQuery({ text: '⛔ Ruxsat berilmagan!', show_alert: true });
  }
  await ctx.answerCallbackQuery();
  return showRecentOrders(ctx);
});

// 3. Callback: List Custom Cakes
adminHandler.callbackQuery('admin_list_custom_cakes', async (ctx) => {
  if (!isAuthorizedAdmin(Number(ctx.from?.id))) {
    return ctx.answerCallbackQuery({ text: '⛔ Ruxsat berilmagan!', show_alert: true });
  }
  await ctx.answerCallbackQuery();
  return showRecentCustomCakes(ctx);
});

// 4. Callback: View Settings
adminHandler.callbackQuery('admin_view_settings', async (ctx) => {
  if (!isAuthorizedAdmin(Number(ctx.from?.id))) {
    return ctx.answerCallbackQuery({ text: '⛔ Ruxsat berilmagan!', show_alert: true });
  }
  await ctx.answerCallbackQuery();
  return showStoreSettings(ctx);
});

// 5. Callback: Refresh Dashboard
adminHandler.callbackQuery('admin_refresh_dashboard', async (ctx) => {
  if (!isAuthorizedAdmin(Number(ctx.from?.id))) {
    return ctx.answerCallbackQuery({ text: '⛔ Ruxsat berilmagan!', show_alert: true });
  }
  await ctx.answerCallbackQuery({ text: '🔄 Yangilandi!' });
  return ctx.editMessageReplyMarkup({
    reply_markup: getAdminDashboardInlineKeyboard(),
  }).catch(() => {});
});

// 6. Callback: Approve Order
adminHandler.callbackQuery(/^admin_approve_order_(.+)$/, async (ctx) => {
  if (!isAuthorizedAdmin(Number(ctx.from?.id))) {
    return ctx.answerCallbackQuery({ text: '⛔ Ruxsat berilmagan! Faqat administratorlar uchun.', show_alert: true });
  }

  const orderId = ctx.match[1];
  try {
    const updatedOrder = await orderService.updateOrderStatus(orderId, {
      status: 'APPROVED',
      paymentStatus: 'PAID',
      adminNotes: `Approved by Admin ${ctx.from?.first_name} (${ctx.from?.id})`,
    });

    await ctx.answerCallbackQuery({ text: '✅ Buyurtma tasdiqlandi!' });

    const adminName = escapeHtml(ctx.from?.first_name || 'Admin');
    const statusTag = `\n\n📌 <b>HOLATI:</b> ✅ <b>Tasdiqlandi va qabul qilindi (Admin: ${adminName})</b>`;
    if (ctx.callbackQuery.message?.caption) {
      await ctx.editMessageCaption({
        caption: `${escapeHtml(ctx.callbackQuery.message.caption)}${statusTag}`,
        parse_mode: 'HTML',
      }).catch(() => {});
    } else if (ctx.callbackQuery.message?.text) {
      await ctx.editMessageText(`${escapeHtml(ctx.callbackQuery.message.text)}${statusTag}`, {
        parse_mode: 'HTML',
      }).catch(() => {});
    }

    // Notify Customer
    if (updatedOrder?.user?.telegramId) {
      const userTelegramId = Number(updatedOrder.user.telegramId);
      const userLang = (updatedOrder.user as any)?.preferredLanguage || 'uz';
      const msg = translate(userLang, 'order_approved_user', { orderNumber: updatedOrder.orderNumber });
      await ctx.api.sendMessage(userTelegramId, msg, { parse_mode: 'HTML' }).catch(() => {});
    }
  } catch (err: any) {
    await ctx.answerCallbackQuery({ text: `Xatolik: ${err.message || 'Tasdiqlab bo\'lmadi'}`, show_alert: true });
  }
});

// 7. Callback: Reject Order
adminHandler.callbackQuery(/^admin_reject_order_(.+)$/, async (ctx) => {
  if (!isAuthorizedAdmin(Number(ctx.from?.id))) {
    return ctx.answerCallbackQuery({ text: '⛔ Ruxsat berilmagan! Faqat administratorlar uchun.', show_alert: true });
  }

  const orderId = ctx.match[1];
  try {
    const updatedOrder = await orderService.updateOrderStatus(orderId, {
      status: 'REJECTED',
      paymentStatus: 'REJECTED',
      adminNotes: `Rejected by Admin ${ctx.from?.first_name} (${ctx.from?.id})`,
    });

    await ctx.answerCallbackQuery({ text: '❌ Buyurtma rad etildi.' });

    const adminName = escapeHtml(ctx.from?.first_name || 'Admin');
    const statusTag = `\n\n📌 <b>HOLATI:</b> ❌ <b>Rad etildi (Admin: ${adminName})</b>`;
    if (ctx.callbackQuery.message?.caption) {
      await ctx.editMessageCaption({
        caption: `${escapeHtml(ctx.callbackQuery.message.caption)}${statusTag}`,
        parse_mode: 'HTML',
      }).catch(() => {});
    } else if (ctx.callbackQuery.message?.text) {
      await ctx.editMessageText(`${escapeHtml(ctx.callbackQuery.message.text)}${statusTag}`, {
        parse_mode: 'HTML',
      }).catch(() => {});
    }

    // Notify Customer
    if (updatedOrder?.user?.telegramId) {
      const userTelegramId = Number(updatedOrder.user.telegramId);
      const userLang = (updatedOrder.user as any)?.preferredLanguage || 'uz';
      const msg = translate(userLang, 'order_rejected_user', { orderNumber: updatedOrder.orderNumber });
      await ctx.api.sendMessage(userTelegramId, msg, { parse_mode: 'HTML' }).catch(() => {});
    }
  } catch (err: any) {
    await ctx.answerCallbackQuery({ text: `Xatolik: ${err.message || 'Rad etib bo\'lmadi'}`, show_alert: true });
  }
});

// 8. Callback: Change Order Status Menu
adminHandler.callbackQuery(/^admin_change_status_(.+)$/, async (ctx) => {
  if (!isAuthorizedAdmin(Number(ctx.from?.id))) {
    return ctx.answerCallbackQuery({ text: '⛔ Ruxsat berilmagan!', show_alert: true });
  }

  const orderId = ctx.match[1];
  const keyboard = new InlineKeyboard()
    .text('👩‍🍳 Tayyorlanmoqda', `admin_set_status_${orderId}_PREPARING`)
    .text('🚖 Yetkazilmoqda', `admin_set_status_${orderId}_DELIVERING`)
    .row()
    .text('🎉 Bajarildi / Topshirildi', `admin_set_status_${orderId}_COMPLETED`)
    .text('❌ Bekor qilish', `admin_set_status_${orderId}_CANCELED`);

  await ctx.answerCallbackQuery();
  await ctx.reply(`📦 Buyurtma uchun yangi holatni tanlang:`, {
    reply_markup: keyboard,
  });
});

// 9. Callback: Apply New Order Status
adminHandler.callbackQuery(/^admin_set_status_(.+)_(PREPARING|DELIVERING|COMPLETED|CANCELED)$/, async (ctx) => {
  if (!isAuthorizedAdmin(Number(ctx.from?.id))) {
    return ctx.answerCallbackQuery({ text: '⛔ Ruxsat berilmagan!', show_alert: true });
  }

  const orderId = ctx.match[1];
  const newStatus = ctx.match[2] as 'PREPARING' | 'DELIVERING' | 'COMPLETED' | 'CANCELED';

  try {
    const updatedOrder = await orderService.updateOrderStatus(orderId, {
      status: newStatus as any,
      adminNotes: `Status changed to ${newStatus} by Admin ${ctx.from?.first_name}`,
    });

    const statusLabels: Record<string, string> = {
      PREPARING: '👩‍🍳 <b>Tayyorlanmoqda</b>',
      DELIVERING: '🚖 <b>Yetkazib berilmoqda</b>',
      COMPLETED: '🎉 <b>Bajarildi / Yakunlandi</b>',
      CANCELED: '❌ <b>Bekor qilindi</b>',
    };

    await ctx.answerCallbackQuery({ text: `Holat o'zgartirildi: ${newStatus}` });
    await ctx.reply(`✅ Buyurtma №<b>#${updatedOrder.orderNumber}</b> holati o'zgartirildi: ${statusLabels[newStatus]}`, {
      parse_mode: 'HTML',
    });

    // Notify Customer
    if (updatedOrder?.user?.telegramId) {
      const userTelegramId = Number(updatedOrder.user.telegramId);
      const userLang = (updatedOrder.user as any)?.preferredLanguage || 'uz';
      const isPickup = updatedOrder.deliveryType === 'PICKUP';
      
      let message = '';
      if (newStatus === 'PREPARING') {
        message = translate(userLang, 'order_preparing_user', { orderNumber: updatedOrder.orderNumber });
      } else if (newStatus === 'DELIVERING') {
        message = translate(userLang, 'order_delivering_user', { orderNumber: updatedOrder.orderNumber });
      } else if (newStatus === 'COMPLETED') {
        message = isPickup
          ? translate(userLang, 'order_completed_pickup_user', { orderNumber: updatedOrder.orderNumber })
          : translate(userLang, 'order_completed_delivery_user', { orderNumber: updatedOrder.orderNumber });
      } else if (newStatus === 'CANCELED') {
        message = translate(userLang, 'order_canceled_user', { orderNumber: updatedOrder.orderNumber });
      }

      if (message) {
        await ctx.api.sendMessage(userTelegramId, message, { parse_mode: 'HTML' }).catch(() => {});
      }
    }
  } catch (err: any) {
    await ctx.answerCallbackQuery({ text: `Xatolik: ${err.message}`, show_alert: true });
  }
});

// 10. Custom Cake Pricing Trigger
adminHandler.callbackQuery(/^admin_price_cake_(.+)$/, async (ctx) => {
  if (!isAuthorizedAdmin(Number(ctx.from?.id))) {
    return ctx.answerCallbackQuery({ text: '⛔ Ruxsat berilmagan!', show_alert: true });
  }

  const requestId = ctx.match[1];
  ctx.session.step = 'AWAITING_ADMIN_PRICE_INPUT';
  ctx.session.adminPriceTargetRequestId = requestId;

  await ctx.answerCallbackQuery();
  return ctx.reply(
    `💰 <b>Maxsus zakaz uchun narx belgilash</b>\n\nIltimos, ushbu tort uchun narxni so'mda faqat raqam ko'rinishida yozing (Masalan: <code>250000</code>):`,
    { parse_mode: 'HTML' }
  );
});

// 11. Custom Cake Reject Trigger
adminHandler.callbackQuery(/^admin_reject_cake_(.+)$/, async (ctx) => {
  if (!isAuthorizedAdmin(Number(ctx.from?.id))) {
    return ctx.answerCallbackQuery({ text: '⛔ Ruxsat berilmagan!', show_alert: true });
  }

  const requestId = ctx.match[1];
  try {
    const req = await customCakeService.updateStatus(requestId, {
      status: 'REJECTED',
      adminNotes: `Rejected by Admin ${ctx.from?.first_name}`,
    });

    await ctx.answerCallbackQuery({ text: '❌ Maxsus zakaz rad etildi.' });
    await ctx.reply(`❌ Maxsus tort so'rovi №${req.requestNumber} rad etildi.`);

    if (req.user?.telegramId) {
      await ctx.api.sendMessage(
        Number(req.user.telegramId),
        `❌ Afsuski, maxsus tort so'rovingiz (№${req.requestNumber}) qabul qilinmadi.`
      ).catch(() => {});
    }
  } catch (err: any) {
    await ctx.answerCallbackQuery({ text: `Xatolik: ${err.message}`, show_alert: true });
  }
});

// 12. Admin Text Input for Pricing
adminHandler.on('message:text', async (ctx, next) => {
  if (ctx.session.step === 'AWAITING_ADMIN_PRICE_INPUT' && ctx.session.adminPriceTargetRequestId) {
    if (!isAuthorizedAdmin(Number(ctx.from?.id))) return next();

    const priceText = ctx.message.text.replace(/\s+/g, '').replace(/,/g, '');
    const priceNum = parseInt(priceText, 10);

    if (isNaN(priceNum) || priceNum <= 0) {
      return ctx.reply('⚠️ Iltimos, narxni to\'g\'ri raqamda kiriting (Masalan: 250000):');
    }

    const reqId = ctx.session.adminPriceTargetRequestId;
    try {
      const updatedReq = await customCakeService.updateStatus(reqId, {
        status: 'PRICE_OFFERED',
        estimatedPrice: priceNum,
        adminNotes: `Price set to ${priceNum} UZS by Admin ${ctx.from?.first_name}`,
      });

      ctx.session.step = 'IDLE';
      ctx.session.adminPriceTargetRequestId = undefined;

      await ctx.reply(`✅ Maxsus tort so'rovi №<b>${updatedReq.requestNumber}</b> uchun narx <b>${priceNum.toLocaleString('uz-UZ')} UZS</b> deb belgilandi va mijozga tasdiqlash uchun yuborildi!`, {
        parse_mode: 'HTML',
      });
    } catch (err: any) {
      return ctx.reply(`Xatolik yuz berdi: ${err.message}`);
    }
    return;
  }

  return next();
});

// Helper Functions
async function showRecentOrders(ctx: BotContext) {
  try {
    const orders = await orderService.getOrders({});
    const recent = orders.slice(0, 5);

    if (recent.length === 0) {
      return ctx.reply('📦 Hozircha yangi buyurtmalar mavjud emas.', {
        reply_markup: getAdminDashboardInlineKeyboard(),
      });
    }

    let text = `📦 <b>So'nggi Buyurtmalar Ro'yxati (5 ta):</b>\n\n`;
    recent.forEach((o: any) => {
      const statusIcon = o.status === 'APPROVED' ? '✅' : o.status === 'REJECTED' ? '❌' : o.status === 'COMPLETED' ? '🎉' : '⏳';
      text += `🆔 <b>#${o.orderNumber}</b> • ${statusIcon} ${escapeHtml(o.status)}\n`;
      text += `👤 ${escapeHtml(o.user?.firstName || 'Mijoz')} | 📞 ${escapeHtml(o.user?.phone || o.phone || 'Tel yo\'q')}\n`;
      text += `💰 ${Number(o.totalAmount).toLocaleString('uz-UZ')} UZS | 📍 ${escapeHtml(o.deliveryAddress || 'Sirdaryo')}\n\n`;
    });

    return ctx.reply(text, {
      parse_mode: 'HTML',
      reply_markup: getAdminDashboardInlineKeyboard(),
    });
  } catch (err: any) {
    return ctx.reply(`Buyurtmalarni yuklashda xatolik: ${err.message}`);
  }
}

async function showRecentCustomCakes(ctx: BotContext) {
  try {
    const requests = await customCakeService.getRequests({});
    const recent = requests.slice(0, 5);

    if (recent.length === 0) {
      return ctx.reply('🎂 Maxsus tort so\'rovlari mavjud emas.', {
        reply_markup: getAdminDashboardInlineKeyboard(),
      });
    }

    let text = `🎂 <b>So'nggi Maxsus Zakazlar (5 ta):</b>\n\n`;
    recent.forEach((r: any) => {
      text += `🆔 <b>№${r.requestNumber}</b> • ${escapeHtml(r.status)}\n`;
      text += `👤 ${escapeHtml(r.user?.firstName || 'Mijoz')} | 📞 ${escapeHtml(r.user?.phone || 'Tel yo\'q')}\n`;
      text += `📝 ${escapeHtml(r.description?.slice(0, 50))}...\n\n`;
    });

    return ctx.reply(text, {
      parse_mode: 'HTML',
      reply_markup: getAdminDashboardInlineKeyboard(),
    });
  } catch (err: any) {
    return ctx.reply(`Maxsus so'rovlarni yuklashda xatolik: ${err.message}`);
  }
}

async function showStoreSettings(ctx: BotContext) {
  try {
    const s: any = await settingService.getSettings();
    const text =
      `⚙️ <b>DINORA Do'koni Sozlamalari</b>\n\n` +
      `🏪 Do'kon holati: <b>${s.isStoreOpen ? '🟢 Ochiq' : '🔴 Yopiq'}</b>\n` +
      `⏰ Ish vaqti: <b>${escapeHtml(s.workingHoursStart)} — ${escapeHtml(s.workingHoursEnd)}</b>\n` +
      `🚚 Yetkazib berish narxi: <b>${Number(s.deliveryFee).toLocaleString('uz-UZ')} UZS</b>\n` +
      `☎️ Asosiy telefon: <b>${escapeHtml(s.adminPhonePrimary)}</b>\n` +
      `📞 Qo'shimcha: <b>${escapeHtml(s.adminPhoneSecondary)}</b>\n` +
      `📸 Instagram: <b>${escapeHtml(s.instagramUsername)}</b>\n\n` +
      `💡 Barcha parametrlarni to'liq tahrirlash uchun <b>Admin Panel (Mini App)</b>dan foydalaning.`;

    return ctx.reply(text, {
      parse_mode: 'HTML',
      reply_markup: getAdminDashboardInlineKeyboard(),
    });
  } catch (err: any) {
    return ctx.reply(`Sozlamalarni yuklashda xatolik: ${err.message}`);
  }
}
