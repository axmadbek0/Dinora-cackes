import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const CUSTOM_CAKES_FILE = path.join(DATA_DIR, 'custom_cakes_store.json');

export class CustomCakeFileStore {
  private static ensureFile() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(CUSTOM_CAKES_FILE)) {
      fs.writeFileSync(CUSTOM_CAKES_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
  }

  static getRequests(): any[] {
    try {
      this.ensureFile();
      const raw = fs.readFileSync(CUSTOM_CAKES_FILE, 'utf-8');
      return JSON.parse(raw) || [];
    } catch {
      return [];
    }
  }

  static saveRequests(requests: any[]) {
    try {
      this.ensureFile();
      fs.writeFileSync(CUSTOM_CAKES_FILE, JSON.stringify(requests, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save custom cakes to disk store:', err);
    }
  }

  static getNextRequestNumber(): number {
    const requests = this.getRequests();
    if (requests.length === 0) return 1;
    const maxNumber = Math.max(...requests.map((r) => r.requestNumber || 0));
    return maxNumber >= 1 ? maxNumber + 1 : 1;
  }

  static createRequest(data: any): any {
    const requests = this.getRequests();
    const requestNumber = data.requestNumber || this.getNextRequestNumber();
    const newRequest = {
      id: data.id || `cust-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      requestNumber,
      userId: data.userId || `usr-${Date.now()}`,
      referenceImageUrl: data.referenceImageUrl || (data.referenceImages?.[0] || null),
      referenceImages: data.referenceImages || (data.referenceImageUrl ? [data.referenceImageUrl] : []),
      description: data.description || '',
      customDetails: data.customDetails || null,
      phone: data.phone || null,
      customerName: data.customerName || data.user?.firstName || 'Mijoz',
      deliveryType: data.deliveryType || 'DELIVERY',
      deliveryRegion: data.deliveryRegion || 'Sirdaryo tumani',
      addressDetails: data.addressDetails || null,
      deliveryAddress: data.deliveryAddress || null,
      deliveryDate: data.deliveryDate || null,
      latitude: typeof data.latitude === 'number' ? data.latitude : (data.latitude ? parseFloat(data.latitude) : null),
      longitude: typeof data.longitude === 'number' ? data.longitude : (data.longitude ? parseFloat(data.longitude) : null),
      distanceKm: typeof data.distanceKm === 'number' ? data.distanceKm : (data.distanceKm ? parseFloat(data.distanceKm) : null),
      deliveryFee: typeof data.deliveryFee === 'number' ? data.deliveryFee : (data.deliveryFee ? parseFloat(data.deliveryFee) : null),
      estimatedPrice: data.estimatedPrice || null,
      status: data.status || 'PENDING_PRICING',
      adminNotes: data.adminNotes || null,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: data.user || {
        id: data.userId || `usr-${Date.now()}`,
        firstName: data.customerName || 'Mijoz',
        phone: data.phone || '',
        telegramId: data.telegramId || null,
      },
    };

    requests.unshift(newRequest);
    this.saveRequests(requests);
    return newRequest;
  }

  static findById(id: string): any | null {
    const requests = this.getRequests();
    return requests.find((r) => r.id === id || String(r.requestNumber) === id) || null;
  }

  static findRequests(filter: { telegramId?: number; status?: string; query?: string; phone?: string }): any[] {
    let requests = this.getRequests();

    if (filter.status) {
      requests = requests.filter((r) => r.status === filter.status);
    }

    if (filter.telegramId) {
      const tgStr = String(filter.telegramId);
      requests = requests.filter(
        (r) => String(r.user?.telegramId) === tgStr || String(r.telegramId) === tgStr
      );
    }

    const searchQuery = filter.query || filter.phone;
    if (searchQuery && searchQuery.trim()) {
      const rawQuery = searchQuery.trim().toLowerCase();
      const queryDigits = rawQuery.replace(/\D/g, '');

      requests = requests.filter((r) => {
        const reqPhone = (r.phone || r.user?.phone || '').replace(/\D/g, '');
        const reqName = (r.customerName || r.user?.firstName || '').toLowerCase();
        const reqNum = String(r.requestNumber);

        if (queryDigits && queryDigits.length >= 4) {
          if (reqPhone.includes(queryDigits) || queryDigits.includes(reqPhone)) {
            return true;
          }
        }

        if (reqName.includes(rawQuery) || reqNum === rawQuery) {
          return true;
        }

        return false;
      });
    }

    return requests;
  }

  static updateRequest(id: string, updateData: any): any {
    const requests = this.getRequests();
    const index = requests.findIndex((r) => r.id === id || String(r.requestNumber) === id);

    if (index !== -1) {
      requests[index] = {
        ...requests[index],
        ...updateData,
        updatedAt: new Date().toISOString(),
      };
      this.saveRequests(requests);
      return requests[index];
    }
    throw new Error(`Custom cake request ${id} not found in store`);
  }
}
