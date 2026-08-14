import { OrderRepository } from './order.repository.js';
import { ProductRepository } from '../products/product.repository.js';
import { CreateOrderDTO, UpdateOrderStatusDTO } from './order.schema.js';
import { NotFoundError, BadRequestError } from '../../utils/errors.js';
import { OrderStatus } from '@prisma/client';
import { assertDateAvailable } from '../../utils/availability.validator.js';

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

    // 2. Fetch products and calculate total
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
      totalAmount += price * item.quantity;

      itemsWithPrices.push({
        productId: product ? product.id : item.productId,
        productName,
        price,
        quantity: item.quantity,
      });
    }

    // Add Sirdaryo tumani fixed delivery fee (10,000 UZS) for delivery orders if deliveryType is DELIVERY
    const isDelivery = data.deliveryType !== 'PICKUP';
    if (isDelivery) {
      totalAmount += 10000;
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

  async getOrders(filter: { telegramId?: number; status?: OrderStatus }) {
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
    if (updatedOrder && updatedOrder.user && updatedOrder.user.telegramId) {
      try {
        const { env } = await import('../../config/env.js');
        const { Bot } = await import('grammy');
        const bot = new Bot(env.BOT_TOKEN);
        const tgId = Number(updatedOrder.user.telegramId);
        const isPickup = updatedOrder.deliveryType === 'PICKUP';

        let statusText = '';
        if (mappedStatus === 'APPROVED') {
          statusText = `✅ **Buyurtmangiz ADMIN tomonidan TASDIQLANDI!**\n🎂 Shirinligingiz tayyorlashga topshirildi. Rahmat!`;
        } else if (mappedStatus === 'REJECTED') {
          statusText = `❌ **Afsuski, buyurtmangiz admin tomonidan rad etildi.**`;
        } else if (mappedStatus === 'PREPARING') {
          statusText = `👨‍🍳 **Buyurtmangiz tayyorlanmoqda!**`;
        } else if (mappedStatus === 'DELIVERING') {
          statusText = `🚖 **Buyurtmangiz yo'lga chiqdi!** Kuting.`;
        } else if (mappedStatus === 'COMPLETED') {
          if (isPickup) {
            statusText = `🎂 **Buyurtmangiz tayyor!** Do'konimizdan kelib olib ketishingiz mumkin.`;
          } else {
            statusText = `🎉 **Buyurtmangiz yetkazib berildi!** Yoqimli ishtaha!`;
          }
        }

        if (statusText) {
          const msg = `🆔 Buyurtma №: **#${updatedOrder.orderNumber}**\n${statusText}`;
          await bot.api.sendMessage(tgId, msg, { parse_mode: 'Markdown' }).catch(() => {});
        }
      } catch (err) {
        console.error('Error sending status update to customer:', err);
      }
    }

    return updatedOrder;
  }

  async updateOrderReceipt(id: string, receiptUrl: string) {
    await this.getOrderById(id);
    return this.orderRepository.updateReceiptUrl(id, receiptUrl);
  }
}
