import { Request, Response } from 'express';
import { SettingService } from './setting.service.js';

export class SettingController {
  private settingService: SettingService;

  constructor() {
    this.settingService = new SettingService();
  }

  public getSettings = async (_req: Request, res: Response) => {
    const settings = await this.settingService.getSettings();
    return res.json({ success: true, data: settings });
  };

  public updateSettings = async (req: Request, res: Response) => {
    const settings = await this.settingService.updateSettings(req.body);
    return res.json({
      success: true,
      message: "Do'kon sozlamalari muvaffaqiyatli saqlandi",
      data: settings,
    });
  };

  public clearAllData = async (_req: Request, res: Response) => {
    const result = await this.settingService.clearAllData();
    return res.json({
      success: true,
      message: `Barcha ma'lumotlar tozalandi: ${result.deletedOrders} ta buyurtma, ${result.deletedCustomCakes} ta maxsus tort so'rovi o'chirildi.`,
      data: result,
    });
  };
}
