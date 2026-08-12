import { Composer } from 'grammy';
import { BotContext } from '../context.js';
import { OrderService } from '../../modules/orders/order.service.js';
import { CustomCakeService } from '../../modules/custom-cakes/custom-cake.service.js';
import { env } from '../../config/env.js';

export const adminHandler = new Composer<BotContext>();
const orderService = new OrderService();
const customCakeService = new CustomCakeService();

adminHandler.callbackQuery(/^admin_approve_order_(.+)$/, async (ctx) => {
  if (!env.ADMIN_IDS.includes(ctx.from.id)) {
    return ctx.answerCallbackQuery({ text: 'Ruxsat berilmagan!', show_alert: true });
  }

  const orderId = ctx.match[1];
  const updatedOrder = await orderService.updateOrderStatus(orderId, {
    status: 'APPROVED',
    paymentStatus: 'PAID',
    adminNotes: `Approved by Admin ${ctx.from.first_name} (${ctx.from.id})`,
  });

  await ctx.answerCallbackQuery({ text: '✅ Buyurtma tasdiqlandi!' });
  await ctx.editMessageCaption({
    caption: `${ctx.callbackQuery.message?.caption || ''}\n\n STATUS: ✅ **Tasdiqlandi va qabul qilindi**`,
    parse_mode: 'Markdown',
  }).catch(() => {
    ctx.editMessageText(`${ctx.callbackQuery.message?.text || ''}\n\n STATUS: ✅ **Tasdiqlandi va qabul qilindi**`, {
      parse_mode: 'Markdown',
    });
  });

  // Notify user
  try {
    const userTelegramId = Number(updatedOrder.user.telegramId);
    await ctx.api.sendMessage(
      userTelegramId,
      `✅ **Xushxabar!** Buyurtmangiz (№${updatedOrder.orderNumber}) tasdiqlandi va tayyorlanish jarayoniga o'tdi! 🍰`
    );
  } catch (err) {
    console.error('Failed to notify user:', err);
  }
});

adminHandler.callbackQuery(/^admin_reject_order_(.+)$/, async (ctx) => {
  if (!env.ADMIN_IDS.includes(ctx.from.id)) {
    return ctx.answerCallbackQuery({ text: 'Ruxsat berilmagan!', show_alert: true });
  }

  const orderId = ctx.match[1];
  const updatedOrder = await orderService.updateOrderStatus(orderId, {
    status: 'REJECTED',
    paymentStatus: 'REJECTED',
    adminNotes: `Rejected by Admin ${ctx.from.first_name} (${ctx.from.id})`,
  });

  await ctx.answerCallbackQuery({ text: '❌ Buyurtma rad etildi.' });
  await ctx.editMessageCaption({
    caption: `${ctx.callbackQuery.message?.caption || ''}\n\n STATUS: ❌ **Rad etildi**`,
    parse_mode: 'Markdown',
  }).catch(() => {
    ctx.editMessageText(`${ctx.callbackQuery.message?.text || ''}\n\n STATUS: ❌ **Rad etildi**`, {
      parse_mode: 'Markdown',
    });
  });

  // Notify user
  try {
    const userTelegramId = Number(updatedOrder.user.telegramId);
    await ctx.api.sendMessage(
      userTelegramId,
      `❌ Afsuski, buyurtmangiz (№${updatedOrder.orderNumber}) rad etildi. Qo'shimcha ma'lumot uchun biz bilan bog'laning.`
    );
  } catch (err) {
    console.error('Failed to notify user:', err);
  }
});

adminHandler.callbackQuery(/^admin_change_status_(.+)$/, async (ctx) => {
  if (!env.ADMIN_IDS.includes(ctx.from.id)) {
    return ctx.answerCallbackQuery({ text: 'Ruxsat berilmagan!', show_alert: true });
  }

  const orderId = ctx.match[1];
  const { InlineKeyboard } = await import('grammy');
  const keyboard = new InlineKeyboard()
    .text('👩‍🍳 Tayyorlanmoqda', `admin_set_status_${orderId}_PREPARING`)
    .text('🚖 Yetkazilmoqda', `admin_set_status_${orderId}_DELIVERING`)
    .row()
    .text('🎉 Yakunlandi', `admin_set_status_${orderId}_COMPLETED`)
    .text('❌ Bekor qilish', `admin_set_status_${orderId}_CANCELED`);

  await ctx.answerCallbackQuery();
  await ctx.reply(`📦 Buyurtma №${orderId} uchun yangi holatni tanlang:`, {
    reply_markup: keyboard,
  });
});

adminHandler.callbackQuery(/^admin_set_status_(.+)_(PREPARING|DELIVERING|COMPLETED|CANCELED)$/, async (ctx) => {
  if (!env.ADMIN_IDS.includes(ctx.from.id)) {
    return ctx.answerCallbackQuery({ text: 'Ruxsat berilmagan!', show_alert: true });
  }

  const orderId = ctx.match[1];
  const newStatus = ctx.match[2] as 'PREPARING' | 'DELIVERING' | 'COMPLETED' | 'CANCELED';

  const updatedOrder = await orderService.updateOrderStatus(orderId, {
    status: newStatus as any,
    adminNotes: `Status changed to ${newStatus} by Admin ${ctx.from.first_name}`,
  });

  const statusLabels: Record<string, string> = {
    PREPARING: '👩‍🍳 **Tayyorlanmoqda**',
    DELIVERING: '🚖 **Yetkazib berilmoqda**',
    COMPLETED: '🎉 **Bajarildi / Yakunlandi**',
    CANCELED: '❌ **Bekor qilindi**',
  };

  await ctx.answerCallbackQuery({ text: `Holat o'zgartirildi: ${newStatus}` });
  await ctx.reply(`✅ Buyurtma №${updatedOrder.orderNumber} holati o'zgartirildi: ${statusLabels[newStatus]}`);

  // Notify user about status update
  try {
    const userTelegramId = Number(updatedOrder.user.telegramId);
    const userMessages: Record<string, string> = {
      PREPARING: `👩‍🍳 **Buyurtmangiz tayyorlanmoqda!** (№${updatedOrder.orderNumber})\nKonditerlarimiz mazali ta'mni tayyorlamoqda!`,
      DELIVERING: `🚖 **Buyurtmangiz yo'lga chiqdi!** (№${updatedOrder.orderNumber})\nKuryerimiz Sirdaryo tumani bo'ylab yo'lda.`,
      COMPLETED: `🎉 **Buyurtmangiz yetkazib berildi!** (№${updatedOrder.orderNumber})\nYoqimli ishtaha! DINORA shirinliklarini tanlaganingiz uchun rahmat! ❤️`,
      CANCELED: `❌ Buyurtmangiz (№${updatedOrder.orderNumber}) bekor qilindi.`,
    };
    await ctx.api.sendMessage(userTelegramId, userMessages[newStatus], { parse_mode: 'Markdown' });
  } catch (err) {
    console.error('Failed to notify user of status update:', err);
  }
});
