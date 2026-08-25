import { Request, Response } from 'express';
import { OrderService } from './order.service.js';
import { OrderStatus } from '@prisma/client';

function escapeHtml(str?: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function notifyAdminsNewOrder(order: any) {
  try {
    const { env } = await import('../../config/env.js');
    const { Bot, InputFile } = await import('grammy');
    const { getAdminOrderApprovalKeyboard } = await import('../../bot/keyboards/admin.keyboard.js');
    const fs = await import('fs');
    const path = await import('path');
    const bot = new Bot(env.BOT_TOKEN);

    const customerName = escapeHtml(order.user?.firstName || order.customerName || 'Mijoz');
    const customerPhone = escapeHtml(order.user?.phone || order.phone || 'Yo\'q');
    const deliveryAddress = escapeHtml(order.deliveryAddress || 'Kiritilmagan');
    const payModeText = order.paymentMode === 'CASH' ? "💵 Naqd pul (Qabul qilinganda)" : "💳 Karta o'tkazmasi (Chek kutilmoqda)";

    let itemsList = '';
    let productPhotoPath: string | null = null;
    let productPhotoUrl: string | null = null;

    if (order.items && order.items.length > 0) {
      itemsList = '\n🍰 <b>Tarkibi:</b>\n' + order.items.map((i: any) => `• ${escapeHtml(i.productName || 'Mahsulot')} × ${i.quantity} ta`).join('\n');

      for (const item of order.items) {
        const img = item.imageUrl || item.product?.imageUrl;
        if (img) {
          if (img.startsWith('http://') || img.startsWith('https://')) {
            productPhotoUrl = img;
            break;
          } else {
            const clean = img.startsWith('/') ? img.slice(1) : img;
            const candidate1 = path.join(process.cwd(), clean);
            const candidate2 = path.join(process.cwd(), 'public', clean);
            if (fs.existsSync(candidate1)) {
              productPhotoPath = candidate1;
              break;
            } else if (fs.existsSync(candidate2)) {
              productPhotoPath = candidate2;
              break;
            } else {
              const base = process.env.API_BASE_URL || 'http://localhost:5000';
              productPhotoUrl = `${base}/${clean}`;
              break;
            }
          }
        }
      }
    }

    let locationMsg = '';
    if (order.latitude && order.longitude) {
      const { calculateDistanceKm, calculateDeliveryFee } = await import('../../utils/delivery-calculator.js');
      const dist = calculateDistanceKm(order.latitude, order.longitude);
      const feeRes = calculateDeliveryFee(dist);
      locationMsg = `\n📍 <b>Jonli Lokatsiya (GPS):</b> <a href="https://www.google.com/maps?q=${order.latitude},${order.longitude}">🗺️ Xaritada ko'rish</a>\n📏 <b>Masofa:</b> ${dist} km (${feeRes.breakdownText})`;
    }

    const adminMsg = `🆕 <b>YANGI BUYURTMA #${order.orderNumber}</b>\n👤 Mijoz: <b>${customerName}</b>\n📞 Tel: <b>${customerPhone}</b>\n📍 Manzil: ${deliveryAddress}${locationMsg}\n💰 Summa: <b>${Number(order.totalAmount).toLocaleString('uz-UZ')} UZS</b>\n💳 To'lov: ${payModeText}${itemsList}`;

    const keyboard = getAdminOrderApprovalKeyboard(order.id, env.FRONTEND_WEB_URL);

    for (const adminId of env.ADMIN_IDS) {
      if (productPhotoPath && fs.existsSync(productPhotoPath)) {
        await bot.api.sendPhoto(adminId, new InputFile(productPhotoPath), {
          caption: adminMsg,
          parse_mode: 'HTML',
          reply_markup: keyboard,
        }).catch(async (err) => {
          console.error(`Error sending photo to admin ${adminId}:`, err);
          await bot.api.sendMessage(adminId, adminMsg, {
            parse_mode: 'HTML',
            reply_markup: keyboard,
          }).catch(() => {});
        });
      } else if (productPhotoUrl) {
        await bot.api.sendPhoto(adminId, productPhotoUrl, {
          caption: adminMsg,
          parse_mode: 'HTML',
          reply_markup: keyboard,
        }).catch(async (err) => {
          console.error(`Error sending photo url to admin ${adminId}:`, err);
          await bot.api.sendMessage(adminId, adminMsg, {
            parse_mode: 'HTML',
            reply_markup: keyboard,
          }).catch(() => {});
        });
      } else {
        await bot.api.sendMessage(adminId, adminMsg, {
          parse_mode: 'HTML',
          reply_markup: keyboard,
        }).catch((err) => console.error(`Error notifying admin ${adminId} of web order:`, err));
      }
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

    const customerName = escapeHtml(updatedOrder.user?.firstName || updatedOrder.customerName || 'Mijoz');
    const customerPhone = escapeHtml(updatedOrder.user?.phone || updatedOrder.phone || 'Yo\'q');
    const deliveryAddress = escapeHtml(updatedOrder.deliveryAddress || 'Kiritilmagan');

    let locationMsg = '';
    if (updatedOrder.latitude && updatedOrder.longitude) {
      const { calculateDistanceKm, calculateDeliveryFee } = await import('../../utils/delivery-calculator.js');
      const dist = calculateDistanceKm(updatedOrder.latitude, updatedOrder.longitude);
      const feeRes = calculateDeliveryFee(dist);
      locationMsg = `\n📍 <b>Lokatsiya:</b> <a href="https://www.google.com/maps?q=${updatedOrder.latitude},${updatedOrder.longitude}">Xaritada ochish</a>\n📏 <b>Masofa:</b> ${dist} km (${feeRes.breakdownText})`;
    }

    const adminCaption = `📄 <b>TO'LOV CHEKI YUKLANDI! #${updatedOrder.orderNumber} (WEB MINI APP)</b>\n👤 Mijoz: <b>${customerName}</b>\n📞 Tel: <b>${customerPhone}</b>\n📍 Manzil: ${deliveryAddress}${locationMsg}\n💰 Summa: <b>${Number(updatedOrder.totalAmount).toLocaleString('uz-UZ')} UZS</b>\n📄 Holati: Chek yuklandi (Tasdiqlash kutilmoqda)`;

    const keyboard = getAdminOrderApprovalKeyboard(updatedOrder.id, env.FRONTEND_WEB_URL);

    for (const adminId of env.ADMIN_IDS) {
      if (localFilePath && fs.existsSync(localFilePath)) {
        await bot.api.sendPhoto(adminId, new InputFile(localFilePath), {
          caption: adminCaption,
          parse_mode: 'HTML',
          reply_markup: keyboard,
        }).catch((err) => console.error(`Error sending receipt photo to admin ${adminId}:`, err));
      } else {
        await bot.api.sendMessage(adminId, adminCaption, {
          parse_mode: 'HTML',
          reply_markup: keyboard,
        }).catch((err) => console.error(`Error sending receipt message to admin ${adminId}:`, err));
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

    // Notify Telegram Bot admins immediately with approval buttons & GPS location
    notifyAdminsNewOrder(order).catch(() => {});

    return res.status(201).json({ success: true, data: order });
  };

  public getOrders = async (req: Request, res: Response) => {
    const { telegramId, status, query, phone, id, search } = req.query;
    const filter = {
      telegramId: telegramId ? parseInt(telegramId as string, 10) : undefined,
      status: status as OrderStatus | undefined,
      query: ((query || search) as string) || undefined,
      phone: (phone as string) || undefined,
      id: (id as string) || undefined,
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

  public rateOrder = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { rating, review } = req.body;
    const order = await this.orderService.rateOrder(id, Number(rating), review);
    return res.json({ success: true, data: order });
  };
}
