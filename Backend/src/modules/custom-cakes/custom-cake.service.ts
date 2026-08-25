import { CustomCakeRepository } from './custom-cake.repository.js';
import { CreateCustomCakeDTO, UpdateCustomCakeStatusDTO } from './custom-cake.schema.js';
import { NotFoundError } from '../../utils/errors.js';
import { CustomCakeStatus } from '@prisma/client';
import { assertDateAvailable } from '../../utils/availability.validator.js';

export class CustomCakeService {
  private repository: CustomCakeRepository;

  constructor() {
    this.repository = new CustomCakeRepository();
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

    return this.repository.create(user.id, data);
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
    const existing = await this.getRequestById(id); // Ensure exists
    const updated = await this.repository.updateStatus(id, data);

    // Notify customer on Telegram if telegramId exists
    const tgId = Number(updated?.user?.telegramId || existing?.user?.telegramId);
    if (tgId && !isNaN(tgId) && tgId > 0) {
      try {
        const { env } = await import('../../config/env.js');
        const { Bot } = await import('grammy');
        const bot = new Bot(env.BOT_TOKEN);

        let statusText = '';
        const cakeTitle = updated.flavor ? `"${updated.flavor}" torti` : 'Maxsus tortingiz';
        const priceText = updated.estimatedPrice ? `\n💰 <b>Belgilangan narx:</b> ${Number(updated.estimatedPrice).toLocaleString('uz-UZ')} UZS` : '';

        if (data.status === 'ACCEPTED') {
          statusText = `✅ <b>Maxsus tort buyurtmangiz TASDIQLANDI!</b>${priceText}\n🎂 Konditerimiz belgilangan sanada tayyorlaydi.`;
        } else if (data.status === 'REJECTED') {
          statusText = `❌ <b>Afsuski, maxsus tort buyurtmangiz rad etildi.</b>\nBatafsil ma'lumot uchun admin bilan bog'lanishingiz mumkin.`;
        } else if (data.status === 'COMPLETED') {
          statusText = `🎉 <b>Maxsus tortingiz muvaffaqiyatli tayyor bo'ldi va topshirildi!</b>\nYoqimli ishtaha!`;
        } else if (data.status === 'CANCELLED') {
          statusText = `❌ <b>Maxsus tort buyurtmangiz bekor qilindi.</b>`;
        } else if (data.status === 'PRICE_OFFERED' || (data.estimatedPrice && (!data.status || data.status === 'PENDING_PRICING'))) {
          statusText = `💵 <b>Maxsus tortingiz bo'yicha narx belgilandi!</b>${priceText}\nAdmin buyurtmangizni ko'rib chiqib, narxini belgiladi.`;
        }

        if (statusText) {
          const msg = `✨ <b>MAXSUS TORT BUYURTMASI</b>\n🎂 ${cakeTitle}\n${statusText}`;
          await bot.api.sendMessage(tgId, msg, { parse_mode: 'HTML' }).catch(() => {});
        }
      } catch (err) {
        console.error('Error sending custom cake status to customer:', err);
      }
    }

    return updated;
  }
}
