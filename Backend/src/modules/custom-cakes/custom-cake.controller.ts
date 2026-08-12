import { Request, Response } from 'express';
import { CustomCakeService } from './custom-cake.service.js';
import { CustomCakeStatus } from '@prisma/client';

export class CustomCakeController {
  private service: CustomCakeService;

  constructor() {
    this.service = new CustomCakeService();
  }

  public createRequest = async (req: Request, res: Response) => {
    const customCakeRequest = await this.service.createRequest(req.body);
    return res.status(201).json({ success: true, data: customCakeRequest });
  };

  public getRequests = async (req: Request, res: Response) => {
    const { telegramId, status } = req.query;
    const filter = {
      telegramId: telegramId ? parseInt(telegramId as string, 10) : undefined,
      status: status as CustomCakeStatus | undefined,
    };
    const requests = await this.service.getRequests(filter);
    return res.json({ success: true, data: requests });
  };

  public getRequestById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const request = await this.service.getRequestById(id);
    return res.json({ success: true, data: request });
  };

  public updateStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const request = await this.service.updateStatus(id, req.body);
    return res.json({ success: true, data: request });
  };
}
