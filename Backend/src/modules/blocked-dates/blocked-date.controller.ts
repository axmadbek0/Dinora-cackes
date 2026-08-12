import { Request, Response } from 'express';
import { BlockedDateService } from './blocked-date.service.js';

export class BlockedDateController {
  private service: BlockedDateService;

  constructor() {
    this.service = new BlockedDateService();
  }

  public getBlockedDates = async (_req: Request, res: Response) => {
    const dates = await this.service.getBlockedDates();
    return res.json({ success: true, data: dates });
  };

  public blockDate = async (req: Request, res: Response) => {
    const { date, startDate, endDate, reason } = req.body;
    const adminUser = req.user?.username || 'admin';

    if (startDate && endDate) {
      const results = await this.service.blockDateRange({
        startDate,
        endDate,
        reason,
        createdBy: adminUser,
      });
      return res.status(201).json({
        success: true,
        message: `${results.length} ta sana muvaffaqiyatli band qilindi!`,
        data: results,
      });
    }

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Sana (date) yoki oraliq (startDate, endDate) kiritilishi shart!',
      });
    }

    const blocked = await this.service.blockDate({
      date,
      reason,
      createdBy: adminUser,
    });

    return res.status(201).json({
      success: true,
      message: `${date} kuni muvaffaqiyatli band qilindi!`,
      data: blocked,
    });
  };

  public unblockDate = async (req: Request, res: Response) => {
    const { date } = req.params;
    await this.service.unblockDate(date);
    return res.json({
      success: true,
      message: `${date} kuni qayta ochildi (unblock qilindi)!`,
    });
  };
}
