import { Request, Response } from 'express';
import { PaymentService } from './payment.service.js';

const paymentService = new PaymentService();

export class PaymentController {
  public generateInvoice = async (req: Request, res: Response) => {
    try {
      const { orderId, paymentProvider, returnUrl } = req.body;
      if (!orderId || !paymentProvider) {
        return res.status(400).json({
          success: false,
          data: null,
          message: 'Order ID and payment provider (CLICK, PAYME, CASH) are required',
        });
      }

      const result = await paymentService.generateInvoice({
        orderId,
        paymentProvider,
        returnUrl,
      });

      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        data: null,
        message: err.message || 'Payment generation failed',
      });
    }
  };

  public handleClickWebhook = async (req: Request, res: Response) => {
    try {
      const response = await paymentService.handleClickWebhook(req.body);
      return res.status(200).json(response);
    } catch (err: any) {
      return res.status(200).json({
        error: -1,
        error_note: err.message || 'Internal webhook error',
      });
    }
  };

  public handlePaymeWebhook = async (req: Request, res: Response) => {
    try {
      const response = await paymentService.handlePaymeWebhook(req.body);
      return res.status(200).json(response);
    } catch (err: any) {
      return res.status(200).json({
        jsonrpc: '2.0',
        id: req.body?.id || null,
        error: { code: -32400, message: err.message },
      });
    }
  };
}
