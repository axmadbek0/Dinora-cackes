import { prisma } from '../../config/database.js';
import { logger } from '../../utils/logger.js';
import crypto from 'crypto';

export interface GenerateInvoiceDTO {
  orderId: string;
  paymentProvider: 'CLICK' | 'PAYME' | 'CARD_TRANSFER' | 'CASH';
  returnUrl?: string;
}

export class PaymentService {
  private CLICK_SERVICE_ID = process.env.CLICK_SERVICE_ID || '32145';
  private CLICK_MERCHANT_ID = process.env.CLICK_MERCHANT_ID || '18924';
  private CLICK_SECRET_KEY = process.env.CLICK_SECRET_KEY || 'DINORA_CLICK_SECRET_2026';

  private PAYME_MERCHANT_ID = process.env.PAYME_MERCHANT_ID || '64d1234567890abcdef12345';
  private PAYME_KEY = process.env.PAYME_KEY || 'DINORA_PAYME_KEY_2026';

  /**
   * Generate Invoice URL for Click, Payme or Cash
   */
  async generateInvoice(dto: GenerateInvoiceDTO) {
    const { orderId, paymentProvider, returnUrl } = dto;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) {
      throw new Error(`Order #${orderId} not found`);
    }

    // Strict Sirdaryo Tumani Region Validation
    const deliveryAddressStr = (order.deliveryAddress || '').toLowerCase();
    const deliveryRegionStr = (order.deliveryRegion || '').toLowerCase();

    if (
      order.deliveryType === 'DELIVERY' &&
      !deliveryAddressStr.includes('sirdaryo') &&
      !deliveryRegionStr.includes('sirdaryo')
    ) {
      throw new Error("Xatolik: Buyurtma faqat Sirdaryo tumani bo'ylab yetkazib beriladi!");
    }

    const totalAmount = Number(order.totalAmount);
    let invoiceUrl = '';

    if (paymentProvider === 'CLICK') {
      const defaultReturn = returnUrl || `${process.env.STOREFRONT_URL || 'http://localhost:5174'}/payment-success?orderId=${orderId}`;
      invoiceUrl = `https://my.click.uz/services/pay?service_id=${this.CLICK_SERVICE_ID}&merchant_id=${this.CLICK_MERCHANT_ID}&amount=${totalAmount}&transaction_param=${orderId}&return_url=${encodeURIComponent(defaultReturn)}`;
    } else if (paymentProvider === 'PAYME') {
      const amountInTiyin = totalAmount * 100;
      const params = `m=${this.PAYME_MERCHANT_ID};ac.order_id=${orderId};a=${amountInTiyin}`;
      const base64Params = Buffer.from(params).toString('base64');
      invoiceUrl = `https://checkout.paycom.uz/${base64Params}`;
    } else {
      // CASH / CARD_TRANSFER
      invoiceUrl = `${process.env.STOREFRONT_URL || 'http://localhost:5174'}/payment-success?orderId=${orderId}&mode=${paymentProvider}`;
    }

    // Update order status to AWAITING_RECEIPT and save payment method
    try {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: paymentProvider === 'CASH' ? 'RECEIPT_SUBMITTED' : 'AWAITING_RECEIPT',
          paymentMethod: paymentProvider,
          paymentMode: paymentProvider as any,
          paymentStatus: paymentProvider === 'CASH' ? 'UNPAID' : 'PENDING',
        },
      });
    } catch (err) {
      logger.warn('Order status update fallback:', err);
    }

    return {
      success: true,
      data: {
        orderId,
        orderNumber: order.orderNumber,
        totalAmount,
        paymentProvider,
        invoiceUrl,
        region: 'Sirdaryo tumani',
      },
    };
  }

  /**
   * Click Webhook Callback (Prepare & Complete)
   */
  async handleClickWebhook(body: any) {
    const {
      click_trans_id,
      service_id,
      click_paydoc_id,
      merchant_trans_id,
      amount,
      action,
      error,
      error_note,
      sign_time,
      sign_string,
    } = body;

    // Verify Click Sign Checksum
    const expectedSign = crypto
      .createHash('md5')
      .update(
        `${click_trans_id}${service_id}${this.CLICK_SECRET_KEY}${merchant_trans_id}${amount}${action}${sign_time}`
      )
      .digest('hex');

    if (sign_string !== expectedSign) {
      return {
        error: -1,
        error_note: 'SIGN CHECK FAILED',
      };
    }

    const orderId = merchant_trans_id;
    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) {
      return {
        error: -5,
        error_note: 'ORDER NOT FOUND',
      };
    }

    if (Number(order.totalAmount) !== Number(amount)) {
      return {
        error: -2,
        error_note: 'INCORRECT AMOUNT',
      };
    }

    // Action 0 = Prepare, Action 1 = Complete
    if (action === 0) {
      return {
        click_trans_id,
        merchant_trans_id,
        merchant_prepare_id: orderId,
        error: 0,
        error_note: 'Success',
      };
    } else if (action === 1) {
      if (error < 0) {
        await prisma.order.update({
          where: { id: orderId },
          data: { paymentStatus: 'FAILED', status: 'CANCELED' },
        });
        return {
          error: -9,
          error_note: 'TRANSACTION CANCELLED',
        };
      }

      // Successful Payment Complete
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'PAID',
          status: 'APPROVED',
        },
      });

      logger.info(`✅ Click Payment Verified for Order #${order.orderNumber} in Sirdaryo tumani!`);

      return {
        click_trans_id,
        merchant_trans_id,
        merchant_confirm_id: orderId,
        error: 0,
        error_note: 'Success',
      };
    }

    return {
      error: -3,
      error_note: 'ACTION NOT FOUND',
    };
  }

  /**
   * Payme JSON-RPC Webhook Handler
   */
  async handlePaymeWebhook(body: any) {
    const { method, params, id } = body;

    if (method === 'CheckPerformTransaction') {
      const orderId = params?.account?.order_id;
      const order = await prisma.order.findUnique({ where: { id: orderId } });
      if (!order) {
        return {
          jsonrpc: '2.0',
          id,
          error: { code: -31050, message: { uz: "Buyurtma topilmadi" } },
        };
      }
      return {
        jsonrpc: '2.0',
        id,
        result: { allow: true },
      };
    }

    if (method === 'PerformTransaction') {
      const orderId = params?.account?.order_id;
      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: 'PAID',
            status: 'APPROVED',
          },
        });
      }
      return {
        jsonrpc: '2.0',
        id,
        result: {
          transaction: params.id,
          perform_time: Date.now(),
          state: 2,
        },
      };
    }

    return {
      jsonrpc: '2.0',
      id,
      result: { success: true },
    };
  }
}
