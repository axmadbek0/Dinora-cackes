import { Composer, InlineKeyboard } from 'grammy';
import { BotContext } from '../context.js';
import { getMainKeyboard, getPhoneRequestKeyboard } from '../keyboards/main.keyboard.js';
import { prisma } from '../../config/database.js';
import { SettingService } from '../../modules/settings/setting.service.js';

export const startHandler = new Composer<BotContext>();
const settingService = new SettingService();

startHandler.command('start', async (ctx) => {
  const telegramId = BigInt(ctx.from!.id);

  try {
    let user = await prisma.user.findUnique({
      where: { telegramId },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          telegramId,
          firstName: ctx.from?.first_name,
          lastName: ctx.from?.last_name,
          username: ctx.from?.username,
        },
      });
    }

    if (!user.phone) {
      ctx.session.step = 'AWAITING_PHONE';
      return ctx.reply(
        `Assalomu alaykum! 🎂 **"Dinora Shirinliklari"** botiga xush kelibsiz.\n\nIltimos, xizmat ko'rsatishimiz uchun telefon raqamingizni ulashing:`,
        {
          parse_mode: 'Markdown',
          reply_markup: getPhoneRequestKeyboard(),
        }
      );
    }

    ctx.session.step = 'IDLE';
    return ctx.reply(
      `Assalomu alaykum, ${ctx.from?.first_name}! 🍰\nDinora Shirinliklari botiga xush kelibsiz. Qanday shirinlik xohlaysiz?`,
      {
        reply_markup: getMainKeyboard(),
      }
    );
  } catch (dbError) {
    console.error('Database connection error in bot /start handler:', dbError);
    ctx.session.step = 'IDLE';
    return ctx.reply(
      `Assalomu alaykum, ${ctx.from?.first_name}! 🍰\n**Dinora Shirinliklari** botiga xush kelibsiz!`,
      {
        reply_markup: getMainKeyboard(),
      }
    );
  }
});

startHandler.on('message:contact', async (ctx) => {
  if (ctx.session.step === 'AWAITING_PHONE') {
    const phone = ctx.message.contact.phone_number;
    const telegramId = BigInt(ctx.from!.id);

    try {
      await prisma.user.update({
        where: { telegramId },
        data: { phone },
      });
    } catch (err) {
      console.warn('Could not update phone in DB:', err);
    }

    ctx.session.step = 'IDLE';
    return ctx.reply(`Rahmat! Telefon raqamingiz saqlandi. 😊`, {
      reply_markup: getMainKeyboard(),
    });
  }
});

startHandler.hears('📞 Aloqa & Ma\'lumot', async (ctx) => {
  try {
    const settings: any = await settingService.getSettings();
    const primaryPhone = settings.adminPhonePrimary || '+998 99 495 78 06';
    const secondaryPhone = settings.adminPhoneSecondary || '+998 91 023 15 24';
    const instagramUrl = settings.instagramUrl || 'https://www.instagram.com/dinora_shirinliklari/';
    const instagramUsername = settings.instagramUsername || '@dinora_shirinliklari';
    const workingDays = settings.workingDays || 'Dushanba - Yakshanba';
    const hoursStart = settings.workingHoursStart || '09:00';
    const hoursEnd = settings.workingHoursEnd || '21:00';
    const deliveryText = settings.deliveryAddressText || "Sirdaryo tumani bo'ylab yetkazib berish";

    const keyboard = new InlineKeyboard().url('📸 Instagram sahifamiz', instagramUrl);

    const message = `📞 **DINORA Konditeriyasi - Aloqa va Ma'lumotlar**\n\n` +
      `☎️ **Asosiy telefon:** ${primaryPhone}\n` +
      `📞 **Qo'shimcha telefon:** ${secondaryPhone}\n` +
      `📸 **Instagram:** ${instagramUsername}\n` +
      `⏰ **Ish vaqti:** ${workingDays} (${hoursStart} — ${hoursEnd})\n` +
      `📍 **Manzil va Yetkazish:** ${deliveryText}`;

    return ctx.reply(message, {
      parse_mode: 'Markdown',
      reply_markup: keyboard,
    });
  } catch (err) {
    return ctx.reply(`📞 **DINORA Konditeriyasi**\n\n☎️ Telefon: +998 99 495 78 06\n📞 Qo'shimcha: +998 91 023 15 24\n📸 Instagram: @dinora_shirinliklari\n⏰ Ish vaqti: 09:00 — 21:00\n📍 Manzil: Sirdaryo tumani bo'ylab yetkazib berish`);
  }
});
