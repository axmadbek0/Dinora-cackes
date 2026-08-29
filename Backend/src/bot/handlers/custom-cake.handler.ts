import { Composer } from 'grammy';
import { BotContext } from '../context.js';
import { CustomCakeService } from '../../modules/custom-cakes/custom-cake.service.js';
import { getMainKeyboard } from '../keyboards/main.keyboard.js';
import { customCakeWizard } from './customCake.wizard.js';
import { env } from '../../config/env.js';

export const customCakeHandler = new Composer<BotContext>();
const customCakeService = new CustomCakeService();

function escapeHtml(str?: string): string {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// 1. Mount the step-by-step Custom Cake Wizard composer
customCakeHandler.use(customCakeWizard);

// 2. Customer Price Acceptance Callback: [✅ Tasdiqlayman va Buyurtma beraman]
customCakeHandler.callbackQuery(/^cake_accept_(.+)$/, async (ctx) => {
  const requestId = ctx.match[1];
  await ctx.answerCallbackQuery({ text: '✅ Buyurtmangiz tasdiqlandi!' });

  try {
    const updatedCake = await customCakeService.updateStatus(requestId, {
      status: 'ACCEPTED' as any,
      adminNotes: 'Customer confirmed price via Telegram Bot',
    });

    const priceFormatted = updatedCake.estimatedPrice
      ? `${Number(updatedCake.estimatedPrice).toLocaleString('uz-UZ')} UZS`
      : '';

    const confirmMsg =
      `🎉 <b>Rahmat! Buyurtmangiz muvaffaqiyatli tasdiqlandi va qabul qilindi!</b>\n\n` +
      `🆔 So'rov №: <b>#${updatedCake.requestNumber}</b>\n` +
      (priceFormatted ? `💰 Tasdiqlangan summa: <b>${priceFormatted}</b>\n\n` : '\n') +
      `🎂 Konditerimiz belgilangan vaqtda tortingizni mehr bilan tayyorlashga kirishadi. Tayyor bo'lishi bilan sizga darhol xabar beramiz! 😊`;

    await ctx.editMessageText(confirmMsg, {
      parse_mode: 'HTML',
    }).catch(() => ctx.reply(confirmMsg, { parse_mode: 'HTML', reply_markup: getMainKeyboard() }));

    // Notify all Telegram Admins
    const customerName = escapeHtml(ctx.from?.first_name || 'Mijoz');
    const customerUsername = escapeHtml(ctx.from?.username || 'yo\'q');
    const customerPhone = escapeHtml(updatedCake.user?.phone || 'Tel ko\'rsatilmagan');

    const adminNotification =
      `🔔 <b>Mijoz narxni TASDIQLADI! (Maxsus Tort №${updatedCake.requestNumber})</b>\n\n` +
      `👤 Mijoz: <b>${customerName}</b> (@${customerUsername})\n` +
      `📞 Tel: <b>${customerPhone}</b>\n` +
      `💰 Summa: <b>${priceFormatted}</b>\n` +
      `📍 Holati: ✅ <b>QABUL QILINDI (Tayyorlashga o'tdi)</b>`;

    for (const adminId of env.ADMIN_IDS) {
      await ctx.api.sendMessage(adminId, adminNotification, { parse_mode: 'HTML' }).catch(() => {});
    }
  } catch (err: any) {
    console.error('Error in cake_accept:', err);
    await ctx.reply(`Xatolik yuz berdi: ${err.message || 'Iltimos qaytadan urinib ko\'ring'}`);
  }
});

// 3. Customer Price Decline Callback: [❌ Bekor qilish]
customCakeHandler.callbackQuery(/^cake_decline_(.+)$/, async (ctx) => {
  const requestId = ctx.match[1];
  await ctx.answerCallbackQuery({ text: '❌ Buyurtma bekor qilindi' });

  try {
    const updatedCake = await customCakeService.updateStatus(requestId, {
      status: 'REJECTED' as any,
      adminNotes: 'Customer declined price offer via Telegram Bot',
    });

    const declineMsg =
      `❌ <b>Maxsus tort buyurtmangiz bekor qilindi.</b>\n\n` +
      `🆔 So'rov №: <b>#${updatedCake.requestNumber}</b>\n\n` +
      `Agar boshqa o'lcham yoki dizaynda tort kerak bo'lsa, istalgan vaqtda yangi so'rov yuborishingiz mumkin! 🎂`;

    await ctx.editMessageText(declineMsg, {
      parse_mode: 'HTML',
    }).catch(() => ctx.reply(declineMsg, { parse_mode: 'HTML', reply_markup: getMainKeyboard() }));

    // Notify all Telegram Admins
    const customerName = escapeHtml(ctx.from?.first_name || 'Mijoz');
    const adminDeclineNotice =
      `⚠️ <b>Mijoz narxni rad etdi / bekor qildi. (Maxsus Tort №${updatedCake.requestNumber})</b>\n` +
      `👤 Mijoz: <b>${customerName}</b>\n` +
      `Holat: ❌ <b>Rad etildi</b>`;

    for (const adminId of env.ADMIN_IDS) {
      await ctx.api.sendMessage(adminId, adminDeclineNotice, { parse_mode: 'HTML' }).catch(() => {});
    }
  } catch (err: any) {
    console.error('Error in cake_decline:', err);
  }
});
