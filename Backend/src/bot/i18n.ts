import uz from './locales/uz.json';
import uzCyrl from './locales/uz-Cyrl.json';
import ru from './locales/ru.json';
import { InlineKeyboard } from 'grammy';
import { prisma } from '../config/database.js';

export type SupportedLanguage = 'uz' | 'uz-Cyrl' | 'ru';

export const DICTIONARIES: Record<SupportedLanguage, Record<string, string>> = {
  uz,
  'uz-Cyrl': uzCyrl,
  ru,
};

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  uz: "🇺🇿 O'zbekcha",
  'uz-Cyrl': "🇺🇿 Ўзбекча",
  ru: "🇷🇺 Русский",
};

/**
 * Translate a key into the target language with variable interpolation {{var}}
 */
export function translate(
  lang: string | undefined | null,
  key: string,
  params?: Record<string, string | number>
): string {
  const normalizedLang: SupportedLanguage =
    lang === 'ru' ? 'ru' : lang === 'uz-Cyrl' ? 'uz-Cyrl' : 'uz';

  const dict = DICTIONARIES[normalizedLang] || DICTIONARIES.uz;
  let text = dict[key] || DICTIONARIES.uz[key] || key;

  if (params) {
    for (const [pKey, pVal] of Object.entries(params)) {
      text = text.replace(new RegExp(`{{${pKey}}}`, 'g'), String(pVal));
    }
  }

  return text;
}

/**
 * Generate language selector inline keyboard
 */
export function getLanguageInlineKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text("🇺🇿 O'zbekcha", 'set_lang_uz')
    .text("🇺🇿 Ўзбекча", 'set_lang_uz-Cyrl')
    .row()
    .text("🇷🇺 Русский", 'set_lang_ru');
}

/**
 * Get user preferred language from DB, session, or Telegram user language_code
 */
export async function resolveUserLanguage(
  telegramId?: number | bigint,
  telegramLanguageCode?: string
): Promise<SupportedLanguage> {
  if (telegramId) {
    try {
      const user = await prisma.user.findUnique({
        where: { telegramId: BigInt(telegramId) },
        select: { preferredLanguage: true },
      });
      if (user?.preferredLanguage) {
        if (['uz', 'uz-Cyrl', 'ru'].includes(user.preferredLanguage)) {
          return user.preferredLanguage as SupportedLanguage;
        }
      }
    } catch {
      // Fallback
    }
  }

  if (telegramLanguageCode) {
    if (telegramLanguageCode.startsWith('ru')) return 'ru';
    if (telegramLanguageCode.startsWith('uz')) return 'uz';
  }

  return 'uz';
}

/**
 * Update user language in database
 */
export async function setUserLanguage(
  telegramId: number | bigint,
  lang: SupportedLanguage
): Promise<void> {
  try {
    await prisma.user.updateMany({
      where: { telegramId: BigInt(telegramId) },
      data: { preferredLanguage: lang },
    });
  } catch {
    // Ignore
  }
}
