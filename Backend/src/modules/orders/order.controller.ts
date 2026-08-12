import { Request, Response } from 'express';
import { OrderService } from './order.service.js';
import { OrderStatus } from '@prisma/client';

async function notifyAdminsNewOrder(order: any) {
  try {
    const { env } = await import('../../config/env.js');
    const { Bot } = await import('grammy');
    const { getAdminOrderApprovalKeyboard } = await import('../../bot/keyboards/admin.keyboard.js');
    const bot = new Bot(env.BOT_TOKEN);

    const customerName = order.user?.firstName || order.customerName || 'Mijoz';
    const customerPhone = order.user?.phone || order.phone || 'Yo\'q';
    const payModeText = order.paymentMode === 'CASH' ? "💵 Naqd pul (Qabul qilinganda)" : "💳 Karta o'tkazmasi (Chek kutilmoqda)";

    const adminMsg = `🆕 **YANGI BUYURTMA #${order.orderNumber} (WEB)**\n👤 Mijoz: ${customerName}\n📞 Tel: ${customerPhone}\n📍 Manzil: ${order.deliveryAddress || 'Kiritilmagan'}\n💰 Summa: ${Number(order.totalAmount).toLocaleString('uz-UZ')} UZS\n💳 To'lov: ${payModeText}`;

    for (const adminId of env.ADMIN_IDS) {
      await bot.api.sendMessage(adminId, adminMsg, {
        parse_mode: 'Markdown',
        reply_markup: getAdminOrderApprovalKeyboard(order.id),
      }).catch((err) => console.error('Error notifying admin of web order:', err));
    }
  } catch (err) {
    console.error('Failed to notify admins of new web order:', err);
  }
}

async function notifyAdminsOrderReceipt(updatedOrder: any, localFilePath?: string) {
  try {
    const { env } = await import('../../config/env.js');
    const { Bot, InputFile } = await import('grammy');
    const { getAdminOrderApprovalKeyboard } = await import('../../bot/keyboards/admin.keyboard.js');
    const fs = await import('fs');
    const bot = new Bot(env.BOT_TOKEN);

    const customerName = updatedOrder.user?.firstName || updatedOrder.customerName || 'Mijoz';
    const customerPhone = updatedOrder.user?.phone || updatedOrder.phone || 'Yo\'q';

    const adminCaption = `📄 **TO'LOV CHEKI YUKLANDI! #${updatedOrder.orderNumber} (WEB)**\n👤 Mijoz: ${customerName}\n📞 Tel: ${customerPhone}\n📍 Manzil: ${updatedOrder.deliveryAddress || 'Kiritilmagan'}\n💰 Summa: ${Number(updatedOrder.totalAmount).toLocaleString('uz-UZ')} UZS\n📄 Holati: Chek yuklandi (Tasdiqlash kutilmoqda)`;

    for (const adminId of env.ADMIN_IDS) {
      if (localFilePath && fs.existsSync(localFilePath)) {
        await bot.api.sendPhoto(adminId, new InputFile(localFilePath), {
          caption: adminCaption,
          parse_mode: 'Markdown',
          reply_markup: getAdminOrderApprovalKeyboard(updatedOrder.id),
        }).catch((err) => console.error('Error sending receipt photo to admin:', err));
      } else {
        await bot.api.sendMessage(adminId, adminCaption, {
          parse_mode: 'Markdown',
          reply_markup: getAdminOrderApprovalKeyboard(updatedOrder.id),
        }).catch((err) => console.error('Error sending receipt message to admin:', err));
      }
    }
  } catch (err) {
    console.error('Failed to notify admins of web receipt upload:', err);
  }
}

export class OrderController {
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService();
  }

  public createOrder = async (req: Request, res: Response) => {
    const order = await this.orderService.createOrder(req.body);

    // Notify Telegram Bot admins immediately with approval buttons
    notifyAdminsNewOrder(order).catch(() => {});

    return res.status(201).json({ success: true, data: order });
  };

  public getOrders = async (req: Request, res: Response) => {
    const { telegramId, status } = req.query;
    const filter = {
      telegramId: telegramId ? parseInt(telegramId as string, 10) : undefined,
      status: status as OrderStatus | undefined,
    };
    const orders = await this.orderService.getOrders(filter);
    return res.json({ success: true, data: orders });
  };

  public getOrderById = async (req: Request, res: Response) => {
    const { id } = req.params;
    const order = await this.orderService.getOrderById(id);
    return res.json({ success: true, data: order });
  };

  public updateOrderStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const order = await this.orderService.updateOrderStatus(id, req.body);
    return res.json({ success: true, data: order });
  };

  public uploadReceipt = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { receiptPhoto, receiptUrl } = req.body;
    let finalReceiptUrl = receiptUrl;
    let localFilePath: string | undefined = undefined;

    if (receiptPhoto && receiptPhoto.startsWith('data:image/')) {
      const fs = await import('fs');
      const path = await import('path');
      const matches = receiptPhoto.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
      if (matches) {
        const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
        const buffer = Buffer.from(matches[2], 'base64');
        const fileName = `receipt-${id}-${Date.now()}.${ext}`;
        const dir = path.join(process.cwd(), 'public', 'uploads', 'receipts');
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        localFilePath = path.join(dir, fileName);
        fs.writeFileSync(localFilePath, buffer);
        finalReceiptUrl = `/uploads/receipts/${fileName}`;
      }
    }

    if (!finalReceiptUrl) {
      return res.status(400).json({ success: false, message: 'Chek rasmi taqdim etilmadi' });
    }

    const updatedOrder = await this.orderService.updateOrderReceipt(id, finalReceiptUrl);

    // Send receipt photo + approval buttons to Telegram admins
    notifyAdminsOrderReceipt(updatedOrder, localFilePath).catch(() => {});

    return res.json({ success: true, data: updatedOrder });
  };
}
