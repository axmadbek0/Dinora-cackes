import { prisma } from '../../config/database.js';
import { OrderFileStore } from '../../utils/order-file-store.js';
import { CustomCakeFileStore } from '../../utils/custom-cake-file-store.js';
import { UserFileStore } from '../../utils/user-file-store.js';

export interface UpdateSystemSettingDTO {
  isStoreOpen?: boolean;
  deliveryFee?: number;
  minOrderAmount?: number;
  workingHoursStart?: string;
  workingHoursEnd?: string;
  workingDays?: string;
  deliveryAddressText?: string;
  adminPhonePrimary?: string;
  adminPhoneSecondary?: string;
  instagramUrl?: string;
  instagramUsername?: string;
  autoAcceptOrders?: boolean;
  maintenanceMode?: boolean;
}

const DEFAULT_SETTINGS = {
  id: 'default-setting-id',
  isStoreOpen: true,
  deliveryFee: 10000,
  minOrderAmount: 0,
  workingHoursStart: '09:00',
  workingHoursEnd: '21:00',
  workingDays: 'Dushanba - Yakshanba',
  deliveryAddressText: "Sirdaryo tumani bo'ylab yetkazib berish",
  adminPhonePrimary: '+998 99 495 78 06',
  adminPhoneSecondary: '+998 91 023 15 24',
  instagramUrl: 'https://www.instagram.com/dinora_shirinliklari/',
  instagramUsername: '@dinora_shirinliklari',
  autoAcceptOrders: false,
  maintenanceMode: false,
  updatedAt: new Date().toISOString(),
};

export class SettingService {
  public async getSettings() {
    try {
      // Find first record or create default
      let setting = await prisma.systemSetting.findFirst();
      if (!setting) {
        setting = await prisma.systemSetting.create({
          data: {
            isStoreOpen: true,
            deliveryFee: 10000,
            minOrderAmount: 0,
            workingHoursStart: '09:00',
            workingHoursEnd: '21:00',
            workingDays: 'Dushanba - Yakshanba',
            deliveryAddressText: "Sirdaryo tumani bo'ylab yetkazib berish",
            adminPhonePrimary: '+998 99 495 78 06',
            adminPhoneSecondary: '+998 91 023 15 24',
            instagramUrl: 'https://www.instagram.com/dinora_shirinliklari/',
            instagramUsername: '@dinora_shirinliklari',
            autoAcceptOrders: false,
            maintenanceMode: false,
          },
        });
      }
      return setting;
    } catch (err) {
      // Fallback in-memory defaults if DB is connecting
      return DEFAULT_SETTINGS;
    }
  }

  public async updateSettings(dto: UpdateSystemSettingDTO) {
    try {
      let setting = await prisma.systemSetting.findFirst();
      if (!setting) {
        return await prisma.systemSetting.create({
          data: {
            isStoreOpen: dto.isStoreOpen ?? true,
            deliveryFee: dto.deliveryFee ?? 10000,
            minOrderAmount: dto.minOrderAmount ?? 0,
            workingHoursStart: dto.workingHoursStart ?? '09:00',
            workingHoursEnd: dto.workingHoursEnd ?? '21:00',
            workingDays: dto.workingDays ?? 'Dushanba - Yakshanba',
            deliveryAddressText: dto.deliveryAddressText ?? "Sirdaryo tumani bo'ylab yetkazib berish",
            adminPhonePrimary: dto.adminPhonePrimary ?? '+998 99 495 78 06',
            adminPhoneSecondary: dto.adminPhoneSecondary ?? '+998 91 023 15 24',
            instagramUrl: dto.instagramUrl ?? 'https://www.instagram.com/dinora_shirinliklari/',
            instagramUsername: dto.instagramUsername ?? '@dinora_shirinliklari',
            autoAcceptOrders: dto.autoAcceptOrders ?? false,
            maintenanceMode: dto.maintenanceMode ?? false,
          },
        });
      } else {
        return await prisma.systemSetting.update({
          where: { id: setting.id },
          data: dto,
        });
      }
    } catch (err) {
      return {
        ...DEFAULT_SETTINGS,
        ...dto,
        updatedAt: new Date().toISOString(),
      };
    }
  }
  public async clearAllData(): Promise<{
    deletedOrders: number;
    deletedCustomCakes: number;
  }> {
    let deletedOrdersCount = 0;
    let deletedCustomCakesCount = 0;

    try {
      await prisma.orderItem.deleteMany({});
      const deletedOrders = await prisma.order.deleteMany({});
      deletedOrdersCount = deletedOrders.count;
    } catch (err) {
      console.warn('Orders delete error (safe fallback):', (err as Error).message);
    }

    try {
      const deletedCustomCakes = await prisma.customCakeRequest.deleteMany({});
      deletedCustomCakesCount = deletedCustomCakes.count;
    } catch (err) {
      console.warn('CustomCakes delete error (safe fallback):', (err as Error).message);
    }

    // Also clear persistent disk file stores so new orders start from 1
    const fileOrdersCount = OrderFileStore.getOrders().length;
    const fileCakesCount = CustomCakeFileStore.getRequests().length;
    OrderFileStore.saveOrders([]);
    CustomCakeFileStore.saveRequests([]);
    UserFileStore.saveUsers([]);

    return {
      deletedOrders: Math.max(deletedOrdersCount, fileOrdersCount),
      deletedCustomCakes: Math.max(deletedCustomCakesCount, fileCakesCount),
    };
  }
}
