import { Composer, InlineKeyboard } from 'grammy';
import { BotContext } from '../context.js';
import { getMainKeyboard, getPhoneRequestKeyboard } from '../keyboards/main.keyboard.js';
import { getAdminDashboardInlineKeyboard, getAdminMainReplyKeyboard } from '../keyboards/admin.keyboard.js';
import { prisma } from '../../config/database.js';
import { SettingService } from '../../modules/settings/setting.service.js';
import { env, isTelegramAdmin } from '../../config/env.js';
import {
  translate,
  getLanguageInlineKeyboard,
  resolveUserLanguage,
  setUserLanguage,
  SupportedLanguage,
} from '../i18n.js';

export const startHandler = new Composer<BotContext>();
const settingService = new SettingService();

function escapeHtml(str?: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// 1. Language selector command
startHandler.command(['lang', 'language'], async (ctx) => {
  const currentLang = await resolveUserLanguage(ctx.from?.id, ctx.from?.language_code);
  const prompt = translate(currentLang, 'choose_lang_title');
  return ctx.reply(prompt, {
    reply_markup: getLanguageInlineKeyboard(),
  });
});

// 2. Language selection callbacks
startHandler.callbackQuery(/^set_lang_(uz|uz-Cyrl|ru)$/, async (ctx) => {
  const selectedLang = ctx.match[1] as SupportedLanguage;
  const telegramId = ctx.from?.id;

  if (telegramId) {
    await setUserLanguage(telegramId, selectedLang);
  }

  await ctx.answerCallbackQuery();
  const confirmationMsg = translate(selectedLang, 'lang_changed');

  await ctx.reply(confirmationMsg, {
    parse_mode: 'HTML',
    reply_markup: getMainKeyboard(selectedLang),
  });
});

// 3. /start command
startHandler.command('start', async (ctx) => {
  const telegramId = BigInt(ctx.from!.id);
  const isAdmin = isTelegramAdmin(ctx.from?.id);

  try {
    let user = await prisma.user.findUnique({
      where: { telegramId },
    }).catch(() => null);

    const detectedLang: SupportedLanguage =
      ctx.from?.language_code?.startsWith('ru')
        ? 'ru'
        : 'uz';

    if (!user) {
      user = await prisma.user.create({
        data: {
          telegramId,
          firstName: ctx.from?.first_name,
          lastName: ctx.from?.last_name,
          username: ctx.from?.username,
          preferredLanguage: detectedLang,
          role: isAdmin ? 'ADMIN' : 'USER',
        },
      }).catch(() => null);
    } else if (isAdmin && user.role !== 'ADMIN') {
      await prisma.user.update({
        where: { telegramId },
        data: { role: 'ADMIN' },
      }).catch(() => { });
    }

    const userLang: SupportedLanguage =
      (user?.preferredLanguage as SupportedLanguage) || detectedLang;

    // Admin Flow
    if (isAdmin) {
      ctx.session.step = 'IDLE';
      const adminName = escapeHtml(ctx.from?.first_name || 'Admin');
      const adminGreeting =
        `👑 <b>Assalomu alaykum, ${adminName}! (Administrator)</b>\n\n` +
        `🎂 <b>DINORA Shirinliklari</b> boshqaruv tizimiga xush kelibsiz!\n\n` +
        `Sizga yangi buyurtmalar, to'lov cheklari va maxsus zakazlar to'g'ridan-to'g'ri shu yerga keladi.\n\n` +
        `📲 Quyidagi tugma orqali to'liq <b>React Admin Panel (Mini App)</b>ni ochishingiz mumkin:`;

      return ctx.reply(adminGreeting, {
        parse_mode: 'HTML',
        reply_markup: getAdminDashboardInlineKeyboard(),
      }).then(() => {
        return ctx.reply(`Boshqaruv menyusi faollashtirildi:`, {
          reply_markup: getAdminMainReplyKeyboard(),
        });
      });
    }

    // Customer Flow: Request phone if not available
    if (!user?.phone) {
      ctx.session.step = 'AWAITING_PHONE';
      const phonePrompt =
        userLang === 'ru'
          ? `Здравствуйте! 🎂 Добро пожаловать в бот <b>"Dinora Shirinliklari"</b>.\n\nПожалуйста, поделитесь номером телефона для продолжения:`
          : userLang === 'uz-Cyrl'
            ? `Ассалому алайкум! 🎂 <b>"Dinora Shirinliklari"</b> ботига хуш келибсиз.\n\nИлтимос, хизмат кўрсатишимиз учун телефон рақамингизни улашинг:`
            : `Assalomu alaykum! 🎂 <b>"Dinora Shirinliklari"</b> botiga xush kelibsiz.\n\nIltimos, xizmat ko'rsatishimiz uchun telefon raqamingizni ulashing:`;

      return ctx.reply(phonePrompt, {
        parse_mode: 'HTML',
        reply_markup: getPhoneRequestKeyboard(userLang),
      });
    }

    ctx.session.step = 'IDLE';
    const welcomeMsg = translate(userLang, 'welcome_message');
    return ctx.reply(welcomeMsg, {
      parse_mode: 'HTML',
      reply_markup: getMainKeyboard(userLang),
    });
  } catch {
    ctx.session.step = 'IDLE';
    const name = escapeHtml(ctx.from?.first_name || '');
    return ctx.reply(
      `Assalomu alaykum, ${name}! 🍰\n<b>Dinora Shirinliklari</b> botiga xush kelibsiz!`,
      {
        parse_mode: 'HTML',
        reply_markup: getMainKeyboard('uz'),
      }
    );
  }
});

startHandler.on('message:contact', async (ctx) => {
  if (ctx.session.step === 'AWAITING_PHONE') {
    const phone = ctx.message.contact.phone_number;
    const telegramId = BigInt(ctx.from!.id);
    const userLang = await resolveUserLanguage(ctx.from!.id, ctx.from?.language_code);

    try {
      await prisma.user.update({
        where: { telegramId },
        data: { phone },
      });
    } catch {
      // safe fallback
    }

    ctx.session.step = 'IDLE';
    const thankYou =
      userLang === 'ru'
        ? 'Спасибо! Ваш номер телефона сохранен. 😊'
        : userLang === 'uz-Cyrl'
          ? 'Раҳмат! Телефон рақамингиз сақланди. 😊'
          : 'Rahmat! Telefon raqamingiz saqlandi. 😊';

    return ctx.reply(thankYou, {
      reply_markup: getMainKeyboard(userLang),
    });
  }
});

startHandler.hears(['🌐 Tilni o\'zgartirish', '🌐 Тилни ўзгартириш', '🌐 Сменить язык'], async (ctx) => {
  const currentLang = await resolveUserLanguage(ctx.from?.id, ctx.from?.language_code);
  const prompt = translate(currentLang, 'choose_lang_title');
  return ctx.reply(prompt, {
    reply_markup: getLanguageInlineKeyboard(),
  });
});

startHandler.hears(['📞 Aloqa & Ma\'lumot', '📞 Алоқа & Маълумот', '📞 Контакты и адрес'], async (ctx) => {
  const currentLang = await resolveUserLanguage(ctx.from?.id, ctx.from?.language_code);
  const contactMsg = translate(currentLang, 'contact_message');

  try {
    const settings: any = await settingService.getSettings();
    const instagramUrl = settings?.instagramUrl || 'https://www.instagram.com/dinora_shirinliklari/';
    const keyboard = new InlineKeyboard().url('📸 Instagram', instagramUrl);

    return ctx.reply(contactMsg, {
      parse_mode: 'HTML',
      reply_markup: keyboard,
    });
  } catch {
    return ctx.reply(contactMsg, {
      parse_mode: 'HTML',
    });
  }
});

// 4. Order Tracking Handler & Commands (/track, /orders, /buyurtmalar, /delivery)
startHandler.hears(
  [
    '🚚 Yetkazib berish & Buyurtmalar',
    '🚚 Етказиб бериш & Кузатиш',
    '🚚 Доставка и заказы',
    '🚚 Yetkazib berish',
    '🚚 Buyurtmani kuzatish',
    '🚚 Буюртмани кузатиш',
    '🚚 Отследить заказ',
  ],
  async (ctx) => {
    return handleOrderTracking(ctx);
  }
);

startHandler.command(['track', 'orders', 'buyurtmalar'], async (ctx) => {
  return handleOrderTracking(ctx);
});

async function handleOrderTracking(ctx: BotContext) {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  const currentLang = await resolveUserLanguage(telegramId, ctx.from?.language_code);

  try {
    const { OrderService } = await import('../../modules/orders/order.service.js');
    const orderService = new OrderService();
    const orders: any = await orderService.getOrders({ telegramId });

    if (!orders || orders.length === 0) {
      const noOrdersMsg =
        currentLang === 'ru'
          ? '📦 <b>У вас пока нет активных заказов.</b>\n\nВы можете выбрать и заказать вкусные десерты в нашем каталоге! 🎂'
          : currentLang === 'uz-Cyrl'
            ? '📦 <b>Сизда ҳозирча фаол буюртмалар мавжуд эмас.</b>\n\nКаталогдан мазали ширинликларни танлаб, буюртма беришингиз мумкин! 🎂'
            : '📦 <b>Sizda hozircha faol buyurtmalar mavjud emas.</b>\n\nKatalogni ko\'rib, mazali shirinliklarga buyurtma berishingiz mumkin! 🎂';

      const kb = new InlineKeyboard().text(
        currentLang === 'ru' ? '🍰 Открыть каталог' : '🍰 Katalogni ko\'rish',
        'catalog_page_1'
      );

      return ctx.reply(noOrdersMsg, {
        parse_mode: 'HTML',
        reply_markup: kb,
      });
    }

    // Show recent up to 5 orders
    const recentOrders = orders.slice(0, 5);

    const getStatusEmojiAndText = (status: string) => {
      switch (status) {
        case 'AWAITING_RECEIPT':
        case 'PENDING_APPROVAL':
          return '⏳ Admin tasdiqlashi kutilmoqda';
        case 'APPROVED':
          return '✅ Tasdiqlandi (Tayyorlashga o\'tdi)';
        case 'PREPARING':
          return '👨‍🍳 Shirinlik tayyorlanmoqda';
        case 'DELIVERING':
          return '🚖 Yo\'lda (Kuryerda)';
        case 'COMPLETED':
          return '🎉 Yetkazib berilgan';
        case 'REJECTED':
        case 'CANCELED':
          return '❌ Bekor qilingan';
        default:
          return status;
      }
    };

    let msg = `🚚 <b>SIZNING SO'NGGI BUYURTMALARINGIZ:</b>\n\n`;

    for (const order of recentOrders) {
      const statusText = getStatusEmojiAndText(order.status);
      const isDelivery = order.deliveryType !== 'PICKUP';
      const typeText = isDelivery ? '🚖 Yetkazib berish' : '🏪 Do\'kondan olib ketish';
      const dateStr = new Date(order.createdAt).toLocaleDateString('uz-UZ', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      let itemsSummary = '';
      if (order.items && order.items.length > 0) {
        itemsSummary = order.items
          .map((i: any) => `  • ${escapeHtml(i.productName || 'Mahsulot')} × ${i.quantity} ta`)
          .join('\n');
      }

      msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
      msg += `🆔 Buyurtma: <b>#${order.orderNumber}</b>\n`;
      msg += `📅 Sana: <i>${dateStr}</i>\n`;
      msg += `📍 Holati: <b>${statusText}</b>\n`;
      msg += `📦 Usuli: <b>${typeText}</b>\n`;
      if (itemsSummary) {
        msg += `🍰 Tarkibi:\n${itemsSummary}\n`;
      }
      msg += `💰 Summa: <b>${Number(order.totalAmount).toLocaleString('uz-UZ')} UZS</b>\n`;
    }

    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `<i>Admin panelda buyurtmangiz holati o'zgarganda bot orqali sizga darhol xabar yuboriladi! 🔔</i>`;

    const kb = new InlineKeyboard()
      .text('🔄 Yangilash', 'refresh_orders_status')
      .row()
      .text('🍰 Katalogni ko\'rish', 'catalog_page_1');

    return ctx.reply(msg, {
      parse_mode: 'HTML',
      reply_markup: kb,
    });
  } catch (err: any) {
    return ctx.reply(`Buyurtmalarni yuklashda xatolik: ${err?.message || 'Qayta urinib ko\'ring'}`);
  }
}

startHandler.callbackQuery('refresh_orders_status', async (ctx) => {
  await ctx.answerCallbackQuery({ text: 'Holatlar yangilandi!' }).catch(() => { });
  return handleOrderTracking(ctx);
});

