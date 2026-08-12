export enum OrderStatus {
  AWAITING_RECEIPT = 'AWAITING_RECEIPT',
  RECEIPT_SUBMITTED = 'RECEIPT_SUBMITTED',
  APPROVED = 'APPROVED',
  PREPARING = 'PREPARING',
  DELIVERING = 'DELIVERING',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
}

export interface ProductDto {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  imageUrl: string;
  weight?: string;
  ingredients?: string;
  shelfLife?: string;
  isAvailable: boolean;
}

export interface CreateOrderDto {
  customerName: string;
  customerPhone: string;
  mahalla: string;
  street: string;
  houseNumber: string;
  deliveryDistrict?: string;
  cartItems: Array<{ productId: string; quantity: number }>;
  totalAmount: number;
}

export interface SystemSettingDto {
  id?: string;
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

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}
