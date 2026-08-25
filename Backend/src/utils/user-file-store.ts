import fs from 'fs';
import path from 'path';
import { env, isTelegramAdmin } from '../config/env.js';
import { OrderFileStore } from './order-file-store.js';
import { CustomCakeFileStore } from './custom-cake-file-store.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users_store.json');

export interface StoredUser {
  id: string;
  telegramId: string | null;
  firstName: string;
  lastName: string;
  username: string | null;
  phone: string;
  role: 'USER' | 'ADMIN';
  preferredLanguage?: string;
  ordersCount: number;
  customCakesCount: number;
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
}

export class UserFileStore {
  private static ensureFile() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
  }

  private static getStoredExplicitUsers(): StoredUser[] {
    try {
      this.ensureFile();
      const raw = fs.readFileSync(USERS_FILE, 'utf-8');
      return JSON.parse(raw) || [];
    } catch {
      return [];
    }
  }

  private static saveStoredExplicitUsers(users: StoredUser[]) {
    try {
      this.ensureFile();
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save users to disk store:', err);
    }
  }

  /**
   * Generates and merges unified users from Orders Store, Custom Cake Requests, and Explicit Users (Excluding Admins)
   */
  static getUsers(): StoredUser[] {
    const explicitUsers = this.getStoredExplicitUsers();
    const orders = OrderFileStore.getOrders();
    const customCakes = CustomCakeFileStore.getRequests();

    const userMap = new Map<string, StoredUser>();

    // 1. Merge Explicitly Stored Users (Only if role === 'USER' and not telegram admin)
    explicitUsers.forEach((u) => {
      if (u.role !== 'ADMIN' && !isTelegramAdmin(u.telegramId)) {
        userMap.set(u.id, { ...u, role: 'USER' });
      }
    });

    // 2. Aggregate Users from Orders
    orders.forEach((order) => {
      const orderUser = order.user || {};
      const rawUserId = order.userId || orderUser.id;
      const rawPhone = order.phone || orderUser.phone || order.customerPhone || '';
      const cleanPhoneDigits = rawPhone.replace(/\D/g, '');
      const rawTgId = orderUser.telegramId ? String(orderUser.telegramId) : (order.telegramId ? String(order.telegramId) : null);
      
      // Skip system administrators from users management page
      if (isTelegramAdmin(rawTgId)) {
        return;
      }

      // Determine canonical user key
      let userKey = rawUserId;
      if (!userKey || userKey === 'usr-undefined' || userKey === 'null') {
        userKey = rawTgId ? `tg-${rawTgId}` : (cleanPhoneDigits ? `phone-${cleanPhoneDigits}` : `ord-usr-${order.id}`);
      }

      const existing = userMap.get(userKey) || Array.from(userMap.values()).find((u) => (rawTgId && u.telegramId === rawTgId) || (cleanPhoneDigits && u.phone.replace(/\D/g, '') === cleanPhoneDigits));

      const userName = order.customerName || orderUser.firstName || existing?.firstName || 'Mijoz';
      const orderAmount = Number(order.totalAmount || 0);
      const isCountableSpend = order.status !== 'CANCELED' && order.status !== 'REJECTED';

      if (existing) {
        existing.ordersCount = (existing.ordersCount || 0) + 1;
        if (isCountableSpend) {
          existing.totalSpent = (existing.totalSpent || 0) + orderAmount;
        }
        if (!existing.phone || existing.phone === 'Biriktirilmagan') {
          existing.phone = rawPhone || existing.phone;
        }
        if (!existing.firstName || existing.firstName === 'Mijoz') {
          existing.firstName = userName;
        }
        if (rawTgId && !existing.telegramId) {
          existing.telegramId = rawTgId;
        }
      } else {
        userMap.set(userKey, {
          id: userKey,
          telegramId: rawTgId,
          firstName: userName,
          lastName: orderUser.lastName || '',
          username: orderUser.username || null,
          phone: rawPhone || 'Biriktirilmagan',
          role: 'USER',
          ordersCount: 1,
          customCakesCount: 0,
          totalSpent: isCountableSpend ? orderAmount : 0,
          createdAt: order.createdAt || new Date().toISOString(),
          updatedAt: order.updatedAt || new Date().toISOString(),
        });
      }
    });

    // 3. Aggregate Users from Custom Cake Requests
    customCakes.forEach((cake) => {
      const rawPhone = cake.phone || cake.user?.phone || '';
      const cleanPhoneDigits = rawPhone.replace(/\D/g, '');
      const rawTgId = cake.telegramId ? String(cake.telegramId) : (cake.user?.telegramId ? String(cake.user.telegramId) : null);
      
      // Skip system administrators
      if (isTelegramAdmin(rawTgId)) {
        return;
      }

      const rawUserId = cake.userId || cake.user?.id || (rawTgId ? `tg-${rawTgId}` : (cleanPhoneDigits ? `phone-${cleanPhoneDigits}` : `cake-usr-${cake.id}`));

      const existing = userMap.get(rawUserId) || Array.from(userMap.values()).find((u) => (rawTgId && u.telegramId === rawTgId) || (cleanPhoneDigits && u.phone.replace(/\D/g, '') === cleanPhoneDigits));

      const customerName = cake.customerName || cake.firstName || cake.user?.firstName || 'Mijoz';

      if (existing) {
        existing.customCakesCount = (existing.customCakesCount || 0) + 1;
        if (!existing.phone || existing.phone === 'Biriktirilmagan') {
          existing.phone = rawPhone || existing.phone;
        }
        if (!existing.firstName || existing.firstName === 'Mijoz') {
          existing.firstName = customerName;
        }
      } else {
        userMap.set(rawUserId, {
          id: rawUserId,
          telegramId: rawTgId,
          firstName: customerName,
          lastName: cake.lastName || cake.user?.lastName || '',
          username: cake.username || cake.user?.username || null,
          phone: rawPhone || 'Biriktirilmagan',
          role: 'USER',
          ordersCount: 0,
          customCakesCount: 1,
          totalSpent: 0,
          createdAt: cake.createdAt || new Date().toISOString(),
          updatedAt: cake.updatedAt || new Date().toISOString(),
        });
      }
    });

    return Array.from(userMap.values())
      .filter((u) => u.role !== 'ADMIN' && !isTelegramAdmin(u.telegramId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static findUsers(filter?: { search?: string; role?: string }): StoredUser[] {
    let users = this.getUsers();

    if (filter?.search) {
      const q = filter.search.toLowerCase().trim();
      users = users.filter(
        (u) =>
          u.firstName?.toLowerCase().includes(q) ||
          u.lastName?.toLowerCase().includes(q) ||
          u.phone?.toLowerCase().includes(q) ||
          u.username?.toLowerCase().includes(q)
      );
    }

    return users;
  }

  static findById(id: string): StoredUser | null {
    const users = this.getUsers();
    return users.find((u) => u.id === id || u.telegramId === id) || null;
  }

  static updateRole(id: string, role: 'USER' | 'ADMIN'): StoredUser {
    const explicitUsers = this.getStoredExplicitUsers();
    const allUsers = this.getUsers();
    const target = allUsers.find((u) => u.id === id || u.telegramId === id);

    if (!target) {
      throw new Error(`User with ID ${id} not found`);
    }

    const updatedUser: StoredUser = {
      ...target,
      role,
      updatedAt: new Date().toISOString(),
    };

    const idx = explicitUsers.findIndex((u) => u.id === id || u.telegramId === id);
    if (idx !== -1) {
      explicitUsers[idx] = updatedUser;
    } else {
      explicitUsers.unshift(updatedUser);
    }

    this.saveStoredExplicitUsers(explicitUsers);
    return updatedUser;
  }

  static deleteUser(id: string): boolean {
    const explicitUsers = this.getStoredExplicitUsers();
    const filtered = explicitUsers.filter((u) => u.id !== id && u.telegramId !== id);
    this.saveStoredExplicitUsers(filtered);
    return true;
  }

  static saveUsers(users: StoredUser[] = []) {
    this.saveStoredExplicitUsers(users);
  }

  static clearUsers() {
    this.saveStoredExplicitUsers([]);
  }
}
