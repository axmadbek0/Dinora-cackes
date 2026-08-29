import { CustomCakeRepository } from './custom-cake.repository.js';
import { CreateCustomCakeDTO, UpdateCustomCakeStatusDTO } from './custom-cake.schema.js';
import { NotFoundError } from '../../utils/errors.js';
import { CustomCakeStatus } from '@prisma/client';
import { assertDateAvailable } from '../../utils/availability.validator.js';
import { getAdminCustomCakePricingKeyboard } from '../../bot/keyboards/admin.keyboard.js';
import { env } from '../../config/env.js';
import { Bot, InlineKeyboard } from 'grammy';

function escapeHtml(str?: string): string {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export class CustomCakeService {
  private repository: CustomCakeRepository;
  private bot: Bot | null = null;

  constructor() {
    this.repository = new CustomCakeRepository();
    if (env.BOT_TOKEN) {
      try {
        this.bot = new Bot(env.BOT_TOKEN);
      } catch (err) {
        console.warn('Bot instance initialization error in CustomCakeService:', err);
      }
    }
  }

  async createRequest(data: any) {
    await assertDateAvailable(data.deliveryDate);
    const user = await this.repository.upsertUser(
      data.telegramId,
      data.phone,
      data.firstName,
      data.lastName,
      data.username
    );

    const created = await this.repository.create(user.id, data);

    // Notify all Telegram Admins about the new custom cake request
    if (this.bot && env.ADMIN_IDS && env.ADMIN_IDS.length > 0) {
      const customerName = escapeHtml(data.firstName || data.customerName || user?.firstName || 'Mijoz');
      const phone = escapeHtml(data.phone || user?.phone || 'Biriktirilmagan');
      const username = user?.username ? `@${escapeHtml(user.username)}` : 'yo\'q';
      const desc = escapeHtml(created.description || data.description || 'Tavsif berilmagan');
      const distInfo = data.distanceKm ? `\n📍 Masofa: <b>${data.distanceKm} km</b> (Yetkazish: ${(data.deliveryFee || 0).toLocaleString('uz-UZ')} UZS)` : '';

      const adminMsg =
        `🎂 <b>Yangi Maxsus Tort So'rovi №${created.requestNumber}</b>\n\n` +
        `👤 Mijoz: <b>${customerName}</b> (${username})\n` +
        `📞 Tel: <b>${phone}</b>\n` +
        `📝 <b>Tavsif:</b>\n${desc}${distInfo}\n` +
        `🚖 <b>Yetkazish:</b> ${created.deliveryType || data.deliveryType || 'DELIVERY'}\n\n` +
        `<i>Pastdagi tugma orqali narx belgilashingiz mumkin:</i>`;

      const imageUrl = created.referenceImageUrl || (data.referenceImages && data.referenceImages.length > 0 ? data.referenceImages[0] : null);

      for (const adminId of env.ADMIN_IDS) {
        try {
          if (imageUrl && !imageUrl.startsWith('data:')) {
            await this.bot.api.sendPhoto(adminId, imageUrl, {
              caption: adminMsg,
              parse_mode: 'HTML',
              reply_markup: getAdminCustomCakePricingKeyboard(created.id, env.FRONTEND_WEB_URL),
            });
          } else {
            await this.bot.api.sendMessage(adminId, adminMsg, {
              parse_mode: 'HTML',
              reply_markup: getAdminCustomCakePricingKeyboard(created.id, env.FRONTEND_WEB_URL),
            });
          }
        } catch (err) {
          console.error(`Failed to send custom cake notification to admin ${adminId}:`, err);
        }
      }
    }

    return created;
  }

  async getRequestById(id: string) {
    const request = await this.repository.findById(id);
    if (!request) {
      throw new NotFoundError(`Custom cake request with ID "${id}" not found`);
    }
    return request;
  }

  async getRequests(filter: { telegramId?: number; status?: CustomCakeStatus }) {
    return this.repository.findAll(filter);
  }

  async updateStatus(id: string, data: UpdateCustomCakeStatusDTO) {
    const existing = await this.getRequestById(id).catch(() => null);
    const updated = await this.repository.updateStatus(id, data);

    // Resolve Customer's Telegram ID
    const rawTgId =
      updated?.user?.telegramId ||
      existing?.user?.telegramId ||
      updated?.telegramId ||
      existing?.telegramId ||
      (typeof updated?.userId === 'string' && updated?.userId.startsWith('usr-') ? updated.userId.replace('usr-', '') : null) ||
      (typeof existing?.userId === 'string' && existing?.userId.startsWith('usr-') ? existing.userId.replace('usr-', '') : null);

    const tgId = rawTgId ? Number(rawTgId) : null;
    const customerName = escapeHtml(updated?.user?.firstName || existing?.user?.firstName || updated?.customerName || 'Mijoz');
    const customerPhone = escapeHtml(updated?.user?.phone || existing?.user?.phone || updated?.phone || 'Tel ko\'rsatilmagan');

    if (this.bot) {
      // 1. If price was offered -> Notify Customer with Accept / Decline buttons
      if (data.status === 'PRICE_OFFERED' || (data.estimatedPrice && (!data.status || data.status === 'PENDING_PRICING'))) {
        const priceNum = Number(data.estimatedPrice || updated.estimatedPrice || 0);
        const priceFormatted = `${priceNum.toLocaleString('uz-UZ')} UZS`;

        if (tgId && !isNaN(tgId) && tgId > 0) {
          try {
            const keyboard = new InlineKeyboard()
              .text('✅ Tasdiqlayman va Buyurtma beraman', `cake_accept_${updated.id}`)
              .row()
              .text('❌ Bekor qilish', `cake_decline_${updated.id}`);

            const offerMsg =
              `🍰 <b>Siz so'ragan tort tayyorlash uchun narx belgilandi: ${priceFormatted}.</b>\n\n` +
              `🆔 So'rov raqami: <b>#${updated.requestNumber}</b>\n` +
              (updated.description ? `📝 Tafsilotlar: <i>${escapeHtml(updated.description)}</i>\n` : '') +
              (data.adminNotes ? `💬 Admin izohi: <i>${escapeHtml(data.adminNotes)}</i>\n\n` : '\n') +
              `Buyurtmani tasdiqlaysizmi?`;

            await this.bot.api.sendMessage(tgId, offerMsg, {
              parse_mode: 'HTML',
              reply_markup: keyboard,
            });
          } catch (err) {
            console.error(`Failed to send price offer message to customer (${tgId}):`, err);
          }
        }

        // Also notify Admins that price was assigned
        const adminPriceNotice =
          `💰 <b>Maxsus Tort №${updated.requestNumber} uchun narx belgilandi!</b>\n\n` +
          `👤 Mijoz: <b>${customerName}</b>\n` +
          `📞 Tel: <b>${customerPhone}</b>\n` +
          `💵 Belgilangan summa: <b>${priceFormatted}</b>\n` +
          `⏳ Holati: <b>Mijoz tasdiqlashi kutilmoqda (PRICE_OFFERED)</b>`;

        for (const adminId of env.ADMIN_IDS) {
          try {
            await this.bot.api.sendMessage(adminId, adminPriceNotice, { parse_mode: 'HTML' });
          } catch (err) {}
        }
      } else {
        // Status changes (ACCEPTED, REJECTED, COMPLETED, CANCELLED)
        let statusText = '';
        const cakeTitle = `№${updated.requestNumber} maxsus tortingiz`;
        const priceText = updated.estimatedPrice ? `\n💰 <b>Narxi:</b> ${Number(updated.estimatedPrice).toLocaleString('uz-UZ')} UZS` : '';

        if (data.status === 'ACCEPTED') {
          statusText = `✅ <b>Maxsus tort buyurtmangiz TASDIQLANDI!</b>${priceText}\n🎂 Konditerimiz mehr bilan tayyorlashga kirishadi.`;
        } else if (data.status === 'REJECTED') {
          statusText = `❌ <b>Afsuski, maxsus tort so'rovingiz rad etildi / bekor qilindi.</b>`;
        } else if (data.status === 'COMPLETED') {
          statusText = `🎉 <b>Maxsus tortingiz muvaffaqiyatli tayyor bo'ldi!</b>\nYoqimli ishtaha!`;
        } else if (data.status === 'CANCELLED') {
          statusText = `❌ <b>Maxsus tort buyurtmangiz bekor qilindi.</b>`;
        }

        if (statusText && tgId && !isNaN(tgId) && tgId > 0) {
          try {
            const msg = `✨ <b>MAXSUS TORT BUYURTMASI</b>\n🎂 ${cakeTitle}\n\n${statusText}`;
            await this.bot.api.sendMessage(tgId, msg, { parse_mode: 'HTML' });
          } catch (err) {}
        }

        // Notify admins about the status update
        if (data.status === 'ACCEPTED' || data.status === 'REJECTED') {
          const adminNotice =
            data.status === 'ACCEPTED'
              ? `🔔 <b>Mijoz narxni TASDIQLADI! (Maxsus Tort №${updated.requestNumber})</b>\n👤 Mijoz: <b>${customerName}</b> (${customerPhone})\nHolat: ✅ <b>Qabul qilindi</b>`
              : `⚠️ <b>Maxsus Tort №${updated.requestNumber} rad etildi / bekor qilindi.</b>\n👤 Mijoz: <b>${customerName}</b>`;

          for (const adminId of env.ADMIN_IDS) {
            try {
              await this.bot.api.sendMessage(adminId, adminNotice, { parse_mode: 'HTML' });
            } catch (err) {}
          }
        }
      }
    }

    return updated;
  }
}
