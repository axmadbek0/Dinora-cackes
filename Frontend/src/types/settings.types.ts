export interface SystemSetting {
  id: string;
  isStoreOpen: boolean;
  deliveryFee: number;
  minOrderAmount: number;
  workingHoursStart: string;
  workingHoursEnd: string;
  workingDays?: string;
  deliveryAddressText?: string;
  adminPhonePrimary: string;
  adminPhoneSecondary: string;
  instagramUrl: string;
  instagramUsername?: string;
  autoAcceptOrders: boolean;
  maintenanceMode: boolean;
  updatedAt: string;
}

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
