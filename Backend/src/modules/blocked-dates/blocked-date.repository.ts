import { prisma } from '../../config/database.js';

export interface BlockDateDTO {
  date: string; // YYYY-MM-DD
  reason?: string;
  createdBy?: string;
  startTime?: string;
  endTime?: string;
}

export interface BlockDateRangeDTO {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  reason?: string;
  createdBy?: string;
}

// In-memory fallback array for dev / offline mode
let MOCK_BLOCKED_DATES: any[] = [];

export class BlockedDateRepository {
  /**
   * Auto clean up expired dates (dates before today: 1 kundan keyin yo'q bo'lishi uchun)
   */
  private async autoCleanupPastDates() {
    const todayStr = new Date().toISOString().split('T')[0];
    try {
      await prisma.blockedDate.deleteMany({
        where: {
          date: { lt: todayStr },
        },
      });
    } catch (err) {
      MOCK_BLOCKED_DATES = MOCK_BLOCKED_DATES.filter((b) => b.date >= todayStr);
    }
  }

  /**
   * Get all active blocked dates (today and future dates only)
   */
  async findAll() {
    await this.autoCleanupPastDates().catch(() => {});
    const todayStr = new Date().toISOString().split('T')[0];
    try {
      const dates = await prisma.blockedDate.findMany({
        where: {
          date: { gte: todayStr },
        },
        orderBy: { date: 'asc' },
      });
      return dates;
    } catch (err) {
      return MOCK_BLOCKED_DATES.filter((b) => b.date >= todayStr);
    }
  }

  /**
   * Check if a specific date (YYYY-MM-DD) is blocked (must be today or future)
   */
  async isDateBlocked(dateStr: string): Promise<boolean> {
    const cleanDate = dateStr.trim().split('T')[0];
    const todayStr = new Date().toISOString().split('T')[0];
    if (cleanDate < todayStr) return false; // Past dates are never blocked

    try {
      const existing = await prisma.blockedDate.findUnique({
        where: { date: cleanDate },
      });
      return !!existing;
    } catch (err) {
      return MOCK_BLOCKED_DATES.some((b) => b.date === cleanDate);
    }
  }

  /**
   * Block a single date or create if not exists
   */
  async blockDate(dto: BlockDateDTO) {
    const cleanDate = dto.date.trim().split('T')[0];
    try {
      return await prisma.blockedDate.upsert({
        where: { date: cleanDate },
        update: {
          reason: dto.reason,
          createdBy: dto.createdBy,
          startTime: dto.startTime,
          endTime: dto.endTime,
        },
        create: {
          date: cleanDate,
          reason: dto.reason,
          createdBy: dto.createdBy,
          startTime: dto.startTime,
          endTime: dto.endTime,
        },
      });
    } catch (err) {
      const existingIdx = MOCK_BLOCKED_DATES.findIndex((b) => b.date === cleanDate);
      const record = {
        id: `blk-${Date.now()}`,
        date: cleanDate,
        reason: dto.reason || null,
        createdBy: dto.createdBy || 'admin',
        startTime: dto.startTime || null,
        endTime: dto.endTime || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      if (existingIdx !== -1) {
        MOCK_BLOCKED_DATES[existingIdx] = record;
      } else {
        MOCK_BLOCKED_DATES.push(record);
      }
      return record;
    }
  }

  /**
   * Block a date range (startDate to endDate inclusive)
   */
  async blockDateRange(dto: BlockDateRangeDTO) {
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    const results: any[] = [];

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('Sana formati noto\'g\'ri! YYYY-MM-DD ko\'rinishida kiriting.');
    }

    const current = new Date(start);
    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      const blocked = await this.blockDate({
        date: dateStr,
        reason: dto.reason,
        createdBy: dto.createdBy,
      });
      results.push(blocked);
      current.setDate(current.getDate() + 1);
    }

    return results;
  }

  /**
   * Unblock / Remove a blocked date
   */
  async unblockDate(dateStr: string) {
    const cleanDate = dateStr.trim().split('T')[0];
    try {
      await prisma.blockedDate.delete({
        where: { date: cleanDate },
      });
      return { success: true, date: cleanDate };
    } catch (err) {
      const idx = MOCK_BLOCKED_DATES.findIndex((b) => b.date === cleanDate);
      if (idx !== -1) {
        MOCK_BLOCKED_DATES.splice(idx, 1);
      }
      return { success: true, date: cleanDate };
    }
  }
}
