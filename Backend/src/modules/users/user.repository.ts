import { prisma } from '../../config/database.js';
import { UserRole } from '@prisma/client';
import { UserFileStore } from '../../utils/user-file-store.js';

export class UserRepository {
  /**
   * Get all registered users with order stats
   */
  async findAll(filter?: { search?: string; role?: UserRole }) {
    try {
      const where: any = {
        role: UserRole.USER,
      };
      if (filter?.search) {
        const q = filter.search.toLowerCase();
        where.OR = [
          { firstName: { contains: q, mode: 'insensitive' } },
          { lastName: { contains: q, mode: 'insensitive' } },
          { username: { contains: q, mode: 'insensitive' } },
          { phone: { contains: q, mode: 'insensitive' } },
        ];
      }

      const users = await prisma.user.findMany({
        where,
        include: {
          orders: {
            select: {
              id: true,
              totalAmount: true,
              status: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              orders: true,
              customCakeRequests: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (users && users.length > 0) {
        return users.map((user) => {
          const totalSpent = user.orders.reduce((sum, order) => {
            if (order.status !== 'CANCELED' && order.status !== 'REJECTED') {
              return sum + Number(order.totalAmount);
            }
            return sum;
          }, 0);

          return {
            id: user.id,
            telegramId: user.telegramId ? user.telegramId.toString() : null,
            firstName: user.firstName || 'Foydalanuvchi',
            lastName: user.lastName || '',
            username: user.username || null,
            phone: user.phone || 'Biriktirilmagan',
            role: user.role,
            ordersCount: user._count.orders,
            customCakesCount: user._count.customCakeRequests,
            totalSpent,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          };
        });
      }

      // Fallback to unified UserFileStore
      return UserFileStore.findUsers(filter);
    } catch (err) {
      return UserFileStore.findUsers(filter);
    }
  }

  async findById(id: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          orders: {
            orderBy: { createdAt: 'desc' },
            include: { items: true },
          },
          customCakeRequests: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (user) {
        const totalSpent = user.orders.reduce((sum, order) => {
          if (order.status !== 'CANCELED' && order.status !== 'REJECTED') {
            return sum + Number(order.totalAmount);
          }
          return sum;
        }, 0);

        return {
          id: user.id,
          telegramId: user.telegramId ? user.telegramId.toString() : null,
          firstName: user.firstName || 'Foydalanuvchi',
          lastName: user.lastName || '',
          username: user.username || null,
          phone: user.phone || 'Biriktirilmagan',
          role: user.role,
          ordersCount: user.orders.length,
          customCakesCount: user.customCakeRequests.length,
          totalSpent,
          orders: user.orders,
          customCakeRequests: user.customCakeRequests,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        };
      }

      return UserFileStore.findById(id);
    } catch {
      return UserFileStore.findById(id);
    }
  }

  async updateRole(id: string, role: UserRole) {
    try {
      const updated = await prisma.user.update({
        where: { id },
        data: { role },
      });
      UserFileStore.updateRole(id, role as any);
      return updated;
    } catch {
      return UserFileStore.updateRole(id, role as any);
    }
  }

  async deleteUser(id: string) {
    try {
      await prisma.user.delete({
        where: { id },
      });
      UserFileStore.deleteUser(id);
      return true;
    } catch {
      return UserFileStore.deleteUser(id);
    }
  }
}
