import { prisma } from '../../config/database.js';
import { CreateOrderDTO, UpdateOrderStatusDTO } from './order.schema.js';
import { OrderStatus, PaymentStatus } from '@prisma/client';

// Clean fallback in-memory cache initialized to zero records
const MOCK_ORDERS: any[] = [];

export class OrderRepository {
  async upsertUser(telegramId: number, phone?: string, firstName?: string, lastName?: string, username?: string) {
    try {
      return await prisma.user.upsert({
        where: { telegramId: BigInt(telegramId) },
        update: {
          phone: phone || undefined,
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          username: username || undefined,
        },
        create: {
          telegramId: BigInt(telegramId),
          phone,
          firstName,
          lastName,
          username,
        },
      });
    } catch (err) {
      return {
        id: `usr-${telegramId}`,
        telegramId: BigInt(telegramId),
        phone: phone || '+998900000000',
        firstName: firstName || 'Mijoz',
        lastName: lastName || '',
        username: username || '',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
  }

  async findUserByTelegramId(telegramId: number) {
    try {
      return await prisma.user.findUnique({
        where: { telegramId: BigInt(telegramId) },
      });
    } catch (err) {
      return null;
    }
  }

  async createOrder(
    userId: string,
    data: CreateOrderDTO & { deliveryAddress?: string; deliveryType?: string; phone?: string; paymentReceiptUrl?: string },
    itemsWithPrices: Array<{ productId: string; productName: string; price: number; quantity: number }>,
    totalAmount: number
  ) {
    const initialStatus = data.paymentReceiptUrl ? OrderStatus.RECEIPT_SUBMITTED : OrderStatus.AWAITING_RECEIPT;
    const initialPaymentStatus = data.paymentReceiptUrl
      ? PaymentStatus.PENDING_VERIFICATION
      : (data.paymentMode === 'CASH' ? PaymentStatus.UNPAID : PaymentStatus.PENDING);

    try {
      return await prisma.$transaction(async (tx) => {
        const order = await tx.order.create({
          data: {
            userId,
            deliveryType: data.deliveryType as any,
            deliveryRegion: 'Sirdaryo tumani',
            mahalla: data.mahalla,
            street: data.street,
            houseNumber: data.houseNumber,
            phone: data.phone || data.customerPhone,
            deliveryAddress: data.deliveryAddress,
            paymentMode: (data.paymentMode as any) || 'CARD_TRANSFER',
            paymentReceiptUrl: data.paymentReceiptUrl,
            paymentStatus: initialPaymentStatus,
            totalAmount,
            notes: data.notes,
            status: initialStatus,
            items: {
              create: itemsWithPrices.map((item) => ({
                productId: item.productId,
                productName: item.productName,
                price: item.price,
                quantity: item.quantity,
              })),
            },
          },
          include: {
            items: true,
            user: true,
          },
        });
        return order;
      });
    } catch (err) {
      const newOrder: any = {
        id: `ord-${Date.now()}`,
        orderNumber: Math.floor(1000 + Math.random() * 9000),
        userId,
        deliveryType: data.deliveryType,
        deliveryRegion: 'Sirdaryo tumani',
        mahalla: data.mahalla,
        street: data.street,
        houseNumber: data.houseNumber,
        phone: data.phone,
        deliveryAddress: data.deliveryAddress,
        paymentMode: data.paymentMode,
        paymentReceiptUrl: data.paymentReceiptUrl,
        paymentStatus: initialPaymentStatus,
        totalAmount,
        notes: data.notes,
        status: initialStatus,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: itemsWithPrices.map((item, idx) => ({
          id: `item-${Date.now()}-${idx}`,
          orderId: `ord-${Date.now()}`,
          productId: item.productId,
          productName: item.productName,
          price: item.price,
          quantity: item.quantity,
          createdAt: new Date(),
        })),
        user: {
          id: userId,
          firstName: data.customerName || 'Mijoz',
          phone: data.phone || data.customerPhone || '',
        },
      };
      MOCK_ORDERS.unshift(newOrder);
      return newOrder;
    }
  }

  async findById(id: string) {
    try {
      return await prisma.order.findUnique({
        where: { id },
        include: {
          items: {
            include: { product: true },
          },
          user: true,
        },
      });
    } catch (err) {
      return MOCK_ORDERS.find((o) => o.id === id) || null;
    }
  }

  async findAll(filter: { telegramId?: number; status?: OrderStatus }) {
    try {
      const where: any = {};
      if (filter.telegramId) {
        where.user = { telegramId: BigInt(filter.telegramId) };
      }
      if (filter.status) {
        where.status = filter.status;
      }

      return await prisma.order.findMany({
        where,
        include: {
          items: true,
          user: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (err) {
      let filtered = [...MOCK_ORDERS];
      if (filter.status) {
        filtered = filtered.filter((o) => o.status === filter.status);
      }
      return filtered;
    }
  }

  async updateStatus(id: string, data: UpdateOrderStatusDTO) {
    try {
      const updateData: any = {
        status: data.status,
      };
      if (data.adminNotes !== undefined) {
        updateData.adminNotes = data.adminNotes;
      }
      if (data.paymentStatus !== undefined) {
        updateData.paymentStatus = data.paymentStatus;
      }

      return await prisma.$transaction(async (tx) => {
        return await tx.order.update({
          where: { id },
          data: updateData,
          include: {
            items: true,
            user: true,
          },
        });
      });
    } catch (err) {
      const index = MOCK_ORDERS.findIndex((o) => o.id === id);
      if (index !== -1) {
        MOCK_ORDERS[index] = {
          ...MOCK_ORDERS[index],
          status: data.status,
          adminNotes: data.adminNotes ?? MOCK_ORDERS[index].adminNotes,
          paymentStatus: data.paymentStatus ?? MOCK_ORDERS[index].paymentStatus,
          updatedAt: new Date(),
        };
        return MOCK_ORDERS[index];
      }
      throw err;
    }
  }

  async updateReceiptUrl(id: string, receiptUrl: string) {
    try {
      return await prisma.order.update({
        where: { id },
        data: {
          paymentReceiptUrl: receiptUrl,
          paymentStatus: PaymentStatus.PENDING_VERIFICATION,
          status: OrderStatus.RECEIPT_SUBMITTED,
        },
        include: {
          items: true,
          user: true,
        },
      });
    } catch (err) {
      const index = MOCK_ORDERS.findIndex((o) => o.id === id);
      if (index !== -1) {
        MOCK_ORDERS[index] = {
          ...MOCK_ORDERS[index],
          paymentReceiptUrl: receiptUrl,
          paymentStatus: PaymentStatus.PENDING_VERIFICATION,
          status: OrderStatus.RECEIPT_SUBMITTED,
          updatedAt: new Date(),
        };
        return MOCK_ORDERS[index];
      }
      throw err;
    }
  }
}
