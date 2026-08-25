import { OrderRepository } from './order.repository.js';
import { ProductRepository } from '../products/product.repository.js';
import { CreateOrderDTO, UpdateOrderStatusDTO } from './order.schema.js';
import { NotFoundError, BadRequestError } from '../../utils/errors.js';
import { OrderStatus } from '@prisma/client';
import { assertDateAvailable } from '../../utils/availability.validator.js';
import { calculateDistanceKm, calculateDeliveryFee } from '../../utils/delivery-calculator.js';

function escapeHtml(str?: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export class OrderService {
  private orderRepository: OrderRepository;
  private productRepository: ProductRepository;

  constructor() {
    this.orderRepository = new OrderRepository();
    this.productRepository = new ProductRepository();
  }

  async createOrder(data: any) {
    // Check if requested date is blocked
    await assertDateAvailable(data.deliveryDate);
    const customerPhone = data.customerPhone || data.phone || '+998 00 000 00 00';
    const customerName = data.customerName || 'Foydalanuvchi';

    let tgId = 0;
    if (data.telegramId) {
      const parsed = typeof data.telegramId === 'string' ? parseInt(data.telegramId, 10) : data.telegramId;
      if (!isNaN(parsed)) tgId = parsed;
    }

    const user = await this.orderRepository.upsertUser(
      tgId,
      customerPhone,
      customerName,
      undefined,
      undefined
    );

    // Fetch products and calculate total
    let totalAmount = 0;
    const itemsWithPrices: Array<{ productId: string; productName: string; price: number; quantity: number }> = [];

    const allProducts = await this.productRepository.findAll({}).catch(() => []);
    const rawItems = data.cartItems || data.items || [];

    if (rawItems.length === 0) {
      throw new BadRequestError("Buyurtmada kamida 1 ta mahsulot bo'lishi kerak");
    }

    for (const item of rawItems) {
      let product = await this.productRepository.findById(item.productId).catch(() => null);
      if (!product && allProducts.length > 0) {
        product = allProducts.find((p) => p.id === item.productId) || allProducts[0];
      }

      const price = product ? Number(product.price) : (data.totalAmount ? Math.round(data.totalAmount / rawItems.length) : 50000);
      const productName = product ? product.name : ((item as any).productName || `Shirinlik (${item.productId})`);
      const imageUrl = product?.imageUrl || (item as any).imageUrl || null;
      totalAmount += price * item.quantity;

      itemsWithPrices.push({
        productId: product ? product.id : item.productId,
        productName,
        price,
        quantity: item.quantity,
        imageUrl,
      } as any);
    }

    // Dynamic Distance-based Delivery Fee:
    // 0.0 - 2.0 km: Free (0 UZS)
    // Above 2.0 km: 15,000 UZS / extra km
    const isDelivery = data.deliveryType !== 'PICKUP';
    let distanceKm = 0;
    let deliveryFee = 0;

    if (isDelivery) {
      if (data.latitude && data.longitude) {
        distanceKm = calculateDistanceKm(data.latitude, data.longitude);
        const calcRes = calculateDeliveryFee(distanceKm);
        deliveryFee = calcRes.deliveryFee;
      } else if (data.deliveryFee !== undefined) {
        deliveryFee = Number(data.deliveryFee);
      } else {
        deliveryFee = 0;
      }
      totalAmount += deliveryFee;
    }

    let formattedAddress = data.addressDetails;
    if (!formattedAddress) {
      const mahallaStr = data.mahalla ? `MFY/Mahalla: ${data.mahalla}` : '';
      const streetStr = data.street ? `Ko'cha: ${data.street}` : '';
      const houseStr = data.houseNumber ? `Uy: ${data.houseNumber}` : '';
      const fullAddressDetails = [mahallaStr, streetStr, houseStr].filter(Boolean).join(', ');
      formattedAddress = `Sirdaryo viloyati, Sirdaryo tumani${fullAddressDetails ? `, ${fullAddressDetails}` : ''}`;
    }

    const enrichedData = {
      ...data,
      deliveryAddress: formattedAddress,
      deliveryType: isDelivery ? ('DELIVERY' as any) : ('PICKUP' as any),
      phone: customerPhone,
    };

    return this.orderRepository.createOrder(user.id, enrichedData, itemsWithPrices, totalAmount);
  }

  async getOrderById(id: string) {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundError(`Order with ID "${id}" not found`);
    }
    return order;
  }

  async getOrders(filter: { telegramId?: number; status?: OrderStatus; query?: string; phone?: string; id?: string }) {
    return this.orderRepository.findAll(filter);
  }

  async updateOrderStatus(id: string, data: any) {
    await this.getOrderById(id);

    let mappedStatus = data.status;
    if (mappedStatus === 'PENDING_APPROVAL') mappedStatus = 'AWAITING_RECEIPT';
    if (mappedStatus === 'CANCELLED') mappedStatus = 'CANCELED';

    let paymentStatus = data.paymentStatus;
    if (mappedStatus === 'APPROVED') {
      paymentStatus = 'PAID';
    } else if (mappedStatus === 'REJECTED' || mappedStatus === 'CANCELED') {
      paymentStatus = 'REJECTED';
    }

    const updatedOrder = await this.orderRepository.updateStatus(id, {
      ...data,
      status: mappedStatus as any,
      paymentStatus,
    });

    // Notify customer on Telegram if telegramId exists
    const tgId = Number(updatedOrder?.user?.telegramId || updatedOrder?.telegramId);
    if (tgId && !isNaN(tgId) && tgId > 0) {
      try {
        const { env } = await import('../../config/env.js');
        const { Bot, InlineKeyboard } = await import('grammy');
        const bot = new Bot(env.BOT_TOKEN);
        const isPickup = updatedOrder.deliveryType === 'PICKUP';

        let statusText = '';
        let replyMarkup: any = undefined;

        if (mappedStatus === 'APPROVED') {
          statusText = `✅ <b>Buyurtmangiz ADMIN tomonidan TASDIQLANDI!</b>\n🎂 Shirinligingiz tayyorlashga topshirildi. Tez orada tayyor bo'ladi!`;
        } else if (mappedStatus === 'REJECTED') {
          statusText = `❌ <b>Afsuski, buyurtmangiz admin tomonidan rad etildi.</b>`;
        } else if (mappedStatus === 'PREPARING') {
          statusText = `👨‍🍳 <b>Shirinligingiz tayyorlanmoqda!</b>\nKonditerimiz mehr bilan bezatmoqda.`;
        } else if (mappedStatus === 'DELIVERING') {
          statusText = `🚖 <b>Buyurtmangiz yo'lga chiqdi!</b>\nKuryerimiz tez orada eshigingizga yetib boradi. Buyurtmani qabul qilib olgach, pastdagi tugmani bosing:`;
          replyMarkup = new InlineKeyboard()
            .text("✅ Buyurtmani qo'lga oldim", `customer_received_order_${updatedOrder.id}`);
        } else if (mappedStatus === 'COMPLETED') {
          if (isPickup) {
            statusText = `🎂 <b>Buyurtmangiz tayyor!</b>\nDo'konimizdan (Sirdaryo tumani, M34 ko'chasi 9-uy) kelib olib ketishingiz mumkin. Olib ketgach, baho bering:`;
          } else {
            statusText = `🎉 <b>Buyurtmangiz yetkazib berildi!</b>\nYoqimli ishtaha! Iltimos, xizmatimiz sifatini baholang:`;
          }
          replyMarkup = new InlineKeyboard()
            .text("⭐ 1", `rate_order_${updatedOrder.id}_1`)
            .text("⭐ 2", `rate_order_${updatedOrder.id}_2`)
            .text("⭐ 3", `rate_order_${updatedOrder.id}_3`)
            .text("⭐ 4", `rate_order_${updatedOrder.id}_4`)
            .text("⭐ 5", `rate_order_${updatedOrder.id}_5`);
        }

        if (statusText) {
          const msg = `🆔 Buyurtma №: <b>#${updatedOrder.orderNumber}</b>\n\n${statusText}`;
          await bot.api.sendMessage(tgId, msg, {
            parse_mode: 'HTML',
            reply_markup: replyMarkup,
          }).catch((e) => console.error('Telegram notification error to customer:', e));
        }
      } catch (err) {
        console.error('Error sending status update to customer:', err);
      }
    }

    return updatedOrder;
  }

  async rateOrder(id: string, rating: number, review?: string) {
    const order = await this.getOrderById(id);
    const updated = await this.orderRepository.rateOrder(id, rating, review);

    // Notify Telegram Admins about the customer rating & feedback
    try {
      const { env } = await import('../../config/env.js');
      const { Bot } = await import('grammy');
      const bot = new Bot(env.BOT_TOKEN);

      const customerName = escapeHtml(updated.user?.firstName || updated.customerName || 'Mijoz');
      const customerPhone = escapeHtml(updated.user?.phone || updated.phone || '');
      const starsStr = '⭐'.repeat(Math.max(1, Math.min(5, rating)));
      const reviewText = review ? `\n💬 <b>Izoh / Fikr:</b> <i>"${escapeHtml(review)}"</i>` : '';

      const adminRatingMsg = `🌟 <b>YANGI MIJOZ BAHOSI! (BUYURTMA #${updated.orderNumber})</b>\n\n👤 Mijoz: <b>${customerName}</b>\n📞 Tel: <b>${customerPhone}</b>\n🌟 Baho: <b>${starsStr} (${rating}/5)</b>${reviewText}`;

      for (const adminId of env.ADMIN_IDS) {
        await bot.api.sendMessage(adminId, adminRatingMsg, { parse_mode: 'HTML' }).catch(() => {});
      }
    } catch (err) {
      console.error('Failed to notify admins of rating:', err);
    }

    return updated;
  }

  async updateOrderReceipt(id: string, receiptUrl: string) {
    await this.getOrderById(id);
    return this.orderRepository.updateReceiptUrl(id, receiptUrl);
  }
}
