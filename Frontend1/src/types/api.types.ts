export const OrderStatus = {
  AWAITING_RECEIPT: 'AWAITING_RECEIPT',
  RECEIPT_SUBMITTED: 'RECEIPT_SUBMITTED',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  PREPARING: 'PREPARING',
  DELIVERING: 'DELIVERING',
  COMPLETED: 'COMPLETED',
  CANCELED: 'CANCELED',
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export interface ProductDto {
  id: string;
  name: string;
  nameUz?: string | null;
  nameUzCyrl?: string | null;
  nameRu?: string | null;
  price: number;
  description?: string | null;
  descriptionUz?: string | null;
  descriptionUzCyrl?: string | null;
  descriptionRu?: string | null;
  category?: string | { id: string; name: string; slug?: string };
  categoryId?: string;
  imageUrl?: string | null;
  weight?: string;
  ingredients?: string | null;        // Tarkibi va masalliqlar
  storageConditions?: string | null;  // Saqlash sharoiti
  deliveryTerms?: string | null;      // Yetkazib berish shartlari
  shelfLife?: string;
  isAvailable: boolean;
  portion?: string;
  weightGrams?: number;
  calories?: number;
  createdAt?: string;
  updatedAt?: string;
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
  timestamp?: string;
  error?: string;
}

export interface AnalyticsSummary {
  totalRevenue: number;
  totalOrders: number;
  pendingCustomCakes: number;
  activeProducts: number;
  monthlyRevenue: { month: string; revenue: number; orders: number }[];
  categoryDistribution: { category: string; count: number }[];
  orderStatusCounts: { status: string; count: number }[];
  topProduct?: string | null;
}
