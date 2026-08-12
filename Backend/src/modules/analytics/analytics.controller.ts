import { Request, Response } from 'express';
import { AnalyticsService } from './analytics.service.js';

export class AnalyticsController {
  private service: AnalyticsService;

  constructor() {
    this.service = new AnalyticsService();
  }

  public getSummary = async (_req: Request, res: Response) => {
    const summary = await this.service.getSummary();
    return res.json({ success: true, data: summary });
  };

  public getDashboard = async (_req: Request, res: Response) => {
    const summary = await this.service.getSummary();
    return res.json({ success: true, data: summary });
  };
}
