import fs from 'fs';
import path from 'path';
import { ProductFileStore } from './product-file-store.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders_store.json');

export class OrderFileStore {
  private static ensureFile() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(ORDERS_FILE)) {
      fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
  }

  static getOrders(): any[] {
    try {
      this.ensureFile();
      const raw = fs.readFileSync(ORDERS_FILE, 'utf-8');
      const orders = JSON.parse(raw) || [];
      const products = ProductFileStore.getProducts();

      // Ensure every order item has accurate product imageUrl
      return orders.map((o: any) => {
        const enrichedItems = (o.items || []).map((item: any) => {
          let itemImg = item.imageUrl || item.product?.imageUrl;
          if (!itemImg && item.productId) {
            const matchedProd = products.find((p) => p.id === item.productId);
            if (matchedProd?.imageUrl) {
              itemImg = matchedProd.imageUrl;
            }
          }
          return {
            ...item,
            imageUrl: itemImg || null,
          };
        });

        return {
          ...o,
          isArchived: Boolean(o.isArchived),
          items: enrichedItems,
        };
      });
    } catch {
      return [];
    }
  }

  static saveOrders(orders: any[]) {
    try {
      this.ensureFile();
      fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save orders to disk store:', err);
    }
  }

  static getNextOrderNumber(): number {
    const orders = this.getOrders();
    if (orders.length === 0) return 1;
    const maxNumber = Math.max(...orders.map((o) => o.orderNumber || 0));
    return maxNumber >= 1 ? maxNumber + 1 : 1;
  }

  static createOrder(data: any): any {
    const orders = this.getOrders();
    const orderNumber = data.orderNumber || this.getNextOrderNumber();
    const products = ProductFileStore.getProducts();

    const items = (data.items || []).map((item: any, idx: number) => {
      let itemImg = item.imageUrl || item.product?.imageUrl;
      if (!itemImg && item.productId) {
        const matchedProd = products.find((p) => p.id === item.productId);
        if (matchedProd?.imageUrl) {
          itemImg = matchedProd.imageUrl;
        }
      }
      return {
        id: item.id || `item-${Date.now()}-${idx}`,
        productId: item.productId || null,
        productName: item.productName || 'Mahsulot',
        price: Number(item.price || 0),
        quantity: Number(item.quantity || 1),
        imageUrl: itemImg || null,
        createdAt: item.createdAt || new Date().toISOString(),
      };
    });

    const newOrder = {
      id: data.id || `ord-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      orderNumber,
      userId: data.userId || `usr-${Date.now()}`,
      status: data.status || (data.paymentReceiptUrl ? 'RECEIPT_SUBMITTED' : 'AWAITING_RECEIPT'),
      isArchived: Boolean(data.isArchived) || false,
      deliveryType: data.deliveryType || 'DELIVERY',
      deliveryRegion: data.deliveryRegion || 'Sirdaryo tumani',
      mahalla: data.mahalla || null,
      street: data.street || null,
      houseNumber: data.houseNumber || null,
      phone: data.phone || data.customerPhone || null,
      customerName: data.customerName || data.user?.firstName || 'Mijoz',
      deliveryAddress: data.deliveryAddress || null,
      deliveryDate: data.deliveryDate || null,
      latitude: typeof data.latitude === 'number' ? data.latitude : (data.latitude ? parseFloat(data.latitude) : null),
      longitude: typeof data.longitude === 'number' ? data.longitude : (data.longitude ? parseFloat(data.longitude) : null),
      paymentMethod: data.paymentMethod || 'CLICK',
      paymentMode: data.paymentMode || 'CARD_TRANSFER',
      paymentReceiptUrl: data.paymentReceiptUrl || null,
      paymentStatus: data.paymentStatus || (data.paymentReceiptUrl ? 'PENDING_VERIFICATION' : 'UNPAID'),
      totalAmount: data.totalAmount || 0,
      notes: data.notes || null,
      adminNotes: data.adminNotes || null,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items,
      user: data.user || {
        id: data.userId || `usr-${Date.now()}`,
        firstName: data.customerName || 'Mijoz',
        phone: data.phone || data.customerPhone || '',
        telegramId: data.telegramId || null,
      },
    };

    orders.unshift(newOrder);
    this.saveOrders(orders);
    return newOrder;
  }

  static findById(id: string): any | null {
    const orders = this.getOrders();
    return orders.find((o) => o.id === id || String(o.orderNumber) === id) || null;
  }

  static findOrders(filter: { telegramId?: number; status?: string; query?: string; phone?: string; id?: string; isArchived?: boolean }): any[] {
    let orders = this.getOrders();

    if (filter.id) {
      return orders.filter((o) => o.id === filter.id || String(o.orderNumber) === filter.id);
    }

    if (filter.status === 'ARCHIVED') {
      orders = orders.filter((o) => o.isArchived === true);
    } else if (filter.status) {
      if (filter.status === 'PENDING_APPROVAL') {
        orders = orders.filter((o) =>
          !o.isArchived && (
            o.status === 'PENDING_APPROVAL' ||
            o.status === 'AWAITING_RECEIPT' ||
            o.status === 'RECEIPT_SUBMITTED'
          )
        );
      } else if (filter.status === 'CANCELLED' || filter.status === 'CANCELED') {
        orders = orders.filter((o) =>
          !o.isArchived && (
            o.status === 'CANCELLED' ||
            o.status === 'CANCELED' ||
            o.status === 'REJECTED'
          )
        );
      } else {
        orders = orders.filter((o) => !o.isArchived && o.status === filter.status);
      }
    } else if (filter.isArchived !== undefined) {
      orders = orders.filter((o) => Boolean(o.isArchived) === filter.isArchived);
    }

    if (filter.telegramId) {
      const tgStr = String(filter.telegramId);
      orders = orders.filter(
        (o) => String(o.user?.telegramId) === tgStr || String(o.telegramId) === tgStr
      );
    }

    const searchQuery = filter.query || filter.phone;
    if (searchQuery && searchQuery.trim()) {
      const rawQuery = searchQuery.trim().toLowerCase();
      const queryDigits = rawQuery.replace(/\D/g, '');

      orders = orders.filter((o) => {
        const orderPhone = (o.phone || o.user?.phone || '').replace(/\D/g, '');
        const orderName = (o.customerName || o.user?.firstName || '').toLowerCase();
        const orderNum = String(o.orderNumber);
        const orderId = String(o.id).toLowerCase();

        if (queryDigits && queryDigits.length >= 4) {
          if (orderPhone.includes(queryDigits) || queryDigits.includes(orderPhone)) {
            return true;
          }
        }

        if (orderName.includes(rawQuery) || orderNum === rawQuery || orderId.includes(rawQuery)) {
          return true;
        }

        return false;
      });
    }

    return orders;
  }

  static updateOrder(id: string, updateData: any): any {
    const orders = this.getOrders();
    const index = orders.findIndex((o) => o.id === id || String(o.orderNumber) === id);

    if (index !== -1) {
      orders[index] = {
        ...orders[index],
        ...updateData,
        updatedAt: new Date().toISOString(),
      };
      this.saveOrders(orders);
      return orders[index];
    }
    throw new Error(`Order ${id} not found in store`);
  }
}
