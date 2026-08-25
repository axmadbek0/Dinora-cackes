import { prisma } from '../../config/database.js';
import { CreateOrderDTO, UpdateOrderStatusDTO } from './order.schema.js';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { OrderFileStore } from '../../utils/order-file-store.js';

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
        id: `usr-${telegramId || Date.now()}`,
        telegramId: BigInt(telegramId || 0),
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
    data: CreateOrderDTO & {
      deliveryAddress?: string;
      deliveryType?: string;
      phone?: string;
      customerName?: string;
      paymentReceiptUrl?: string;
      latitude?: number | null;
      longitude?: number | null;
    },
    itemsWithPrices: Array<{ productId: string; productName: string; price: number; quantity: number }>,
    totalAmount: number
  ) {
    const initialStatus = data.paymentReceiptUrl ? OrderStatus.RECEIPT_SUBMITTED : OrderStatus.AWAITING_RECEIPT;
    const initialPaymentStatus = data.paymentReceiptUrl
      ? PaymentStatus.PENDING_VERIFICATION
      : (data.paymentMode === 'CASH' ? PaymentStatus.UNPAID : PaymentStatus.PENDING);

    const lat = typeof data.latitude === 'number' ? data.latitude : (data.latitude ? parseFloat(data.latitude) : null);
    const lng = typeof data.longitude === 'number' ? data.longitude : (data.longitude ? parseFloat(data.longitude) : null);

    try {
      return await prisma.$transaction(async (tx) => {
        const order = await tx.order.create({
          data: {
            userId,
            deliveryType: (data.deliveryType as any) || 'DELIVERY',
            deliveryRegion: 'Sirdaryo tumani',
            mahalla: data.mahalla,
            street: data.street,
            houseNumber: data.houseNumber,
            phone: data.phone || data.customerPhone,
            deliveryAddress: data.deliveryAddress,
            latitude: lat,
            longitude: lng,
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
        // Also save to disk store for offline redundancy
        OrderFileStore.createOrder(order);
        return order;
      });
    } catch (err) {
      // Persistent file store fallback
      return OrderFileStore.createOrder({
        userId,
        customerName: data.customerName || 'Mijoz',
        deliveryType: data.deliveryType,
        deliveryRegion: 'Sirdaryo tumani',
        mahalla: data.mahalla,
        street: data.street,
        houseNumber: data.houseNumber,
        phone: data.phone || data.customerPhone,
        deliveryAddress: data.deliveryAddress,
        latitude: lat,
        longitude: lng,
        paymentMode: data.paymentMode,
        paymentReceiptUrl: data.paymentReceiptUrl,
        paymentStatus: initialPaymentStatus,
        totalAmount,
        notes: data.notes,
        status: initialStatus,
        items: itemsWithPrices.map((item, idx) => ({
          id: `item-${Date.now()}-${idx}`,
          productId: item.productId,
          productName: item.productName,
          price: item.price,
          quantity: item.quantity,
          createdAt: new Date().toISOString(),
        })),
        user: {
          id: userId,
          firstName: data.customerName || 'Mijoz',
          phone: data.phone || data.customerPhone || '',
        },
      });
    }
  }

  async findById(id: string) {
    try {
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          items: {
            include: { product: true },
          },
          user: true,
        },
      });
      if (order) return order;
      return OrderFileStore.findById(id);
    } catch (err) {
      return OrderFileStore.findById(id);
    }
  }

  async findAll(filter: { telegramId?: number; status?: OrderStatus; query?: string; phone?: string }) {
    try {
      const where: any = {};
      if (filter.telegramId) {
        where.user = { telegramId: BigInt(filter.telegramId) };
      }
      if (filter.status) {
        where.status = filter.status;
      }
      if (filter.phone || filter.query) {
        const q = (filter.phone || filter.query || '').trim();
        where.OR = [
          { phone: { contains: q } },
          { deliveryAddress: { contains: q } },
          { user: { phone: { contains: q } } },
          { user: { firstName: { contains: q } } },
        ];
      }

      const orders = await prisma.order.findMany({
        where,
        include: {
          items: true,
          user: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (orders && orders.length > 0) return orders;
      return OrderFileStore.findOrders(filter as any);
    } catch (err) {
      return OrderFileStore.findOrders(filter as any);
    }
  }

  async updateStatus(id: string, data: UpdateOrderStatusDTO & { isArchived?: boolean }) {
    try {
      const updateData: any = {};
      if (data.status !== undefined) {
        updateData.status = data.status;
      }
      if (data.adminNotes !== undefined) {
        updateData.adminNotes = data.adminNotes;
      }
      if (data.paymentStatus !== undefined) {
        updateData.paymentStatus = data.paymentStatus;
      }
      if (data.isArchived !== undefined) {
        updateData.isArchived = data.isArchived;
      }

      const updated = await prisma.$transaction(async (tx) => {
        return await tx.order.update({
          where: { id },
          data: updateData,
          include: {
            items: true,
            user: true,
          },
        });
      });
      OrderFileStore.updateOrder(id, updateData);
      return updated;
    } catch (err) {
      return OrderFileStore.updateOrder(id, {
        ...(data.status !== undefined && { status: data.status }),
        ...(data.adminNotes !== undefined && { adminNotes: data.adminNotes }),
        ...(data.paymentStatus !== undefined && { paymentStatus: data.paymentStatus }),
        ...(data.isArchived !== undefined && { isArchived: data.isArchived }),
      });
    }
  }

  async updateReceiptUrl(id: string, receiptUrl: string) {
    try {
      const updated = await prisma.order.update({
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
      OrderFileStore.updateOrder(id, {
        paymentReceiptUrl: receiptUrl,
        paymentStatus: PaymentStatus.PENDING_VERIFICATION,
        status: OrderStatus.RECEIPT_SUBMITTED,
      });
      return updated;
    } catch (err) {
      return OrderFileStore.updateOrder(id, {
        paymentReceiptUrl: receiptUrl,
        paymentStatus: PaymentStatus.PENDING_VERIFICATION,
        status: OrderStatus.RECEIPT_SUBMITTED,
      });
    }
  }

  async rateOrder(id: string, rating: number, review?: string) {
    const updateData = {
      rating,
      review: review || null,
      ratedAt: new Date().toISOString(),
      status: OrderStatus.COMPLETED,
    };
    try {
      const updated = await prisma.order.update({
        where: { id },
        data: {
          status: OrderStatus.COMPLETED,
        },
        include: {
          items: true,
          user: true,
        },
      });
      OrderFileStore.updateOrder(id, updateData);
      return { ...updated, ...updateData };
    } catch (err) {
      return OrderFileStore.updateOrder(id, updateData);
    }
  }
}
