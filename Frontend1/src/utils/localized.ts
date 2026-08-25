import type { AppLanguage } from '../i18n/config';

/**
 * Get localized field from an object (e.g. Product or Category)
 * Checks nameUz, nameUzCyrl, nameRu, and falls back to standard name or title
 */
export function getLocalizedField<T extends Record<string, any>>(
  item: T | null | undefined,
  field: string,
  lang: string = 'uz'
): string {
  if (!item) return '';

  const normalizedLang: AppLanguage =
    lang === 'ru' ? 'ru' : lang === 'uz-Cyrl' ? 'uz-Cyrl' : 'uz';

  let localizedKey = '';
  if (normalizedLang === 'uz-Cyrl') {
    localizedKey = `${field}UzCyrl`;
  } else if (normalizedLang === 'ru') {
    localizedKey = `${field}Ru`;
  } else {
    localizedKey = `${field}Uz`;
  }

  // 1. Check specific localized field
  if (item[localizedKey] && typeof item[localizedKey] === 'string' && item[localizedKey].trim()) {
    return item[localizedKey];
  }

  // 2. Check general field (e.g., name, description, title)
  if (item[field] && typeof item[field] === 'string' && item[field].trim()) {
    return item[field];
  }

  // 3. Check title fallback if field is name
  if (field === 'name' && item.title && typeof item.title === 'string') {
    return item.title;
  }

  return '';
}
