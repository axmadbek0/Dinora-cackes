import { BlockedDateRepository } from '../modules/blocked-dates/blocked-date.repository.js';

const blockedDateRepository = new BlockedDateRepository();

/**
 * Centralized availability validator
 * Used by Web API, Telegram Bot, and Order Services.
 * Throws an explicit Error if the date is currently blocked.
 */
export async function assertDateAvailable(dateStr?: string | null): Promise<void> {
  if (!dateStr || !dateStr.trim()) {
    return; // Optional dates pass through
  }

  const cleanDate = dateStr.trim().split('T')[0];
  const isBlocked = await blockedDateRepository.isDateBlocked(cleanDate);

  if (isBlocked) {
    throw new Error(`⚠️ ${cleanDate} kuni barcha buyurtmalar uchun band qilingan! Iltimos, boshqa sanani tanlang.`);
  }
}

/**
 * Helper to check availability without throwing
 */
export async function checkIsDateBlocked(dateStr: string): Promise<boolean> {
  if (!dateStr || !dateStr.trim()) return false;
  const cleanDate = dateStr.trim().split('T')[0];
  return await blockedDateRepository.isDateBlocked(cleanDate);
}
