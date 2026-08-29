export type { OrderStatus, ProductDto, CreateOrderDto, SystemSettingDto, ApiResponse } from './api.types';
export { OrderStatus as OrderStatusObj } from './api.types';
import type { OrderStatus, ProductDto, CreateOrderDto } from './api.types';

export type FilterCategory = 'Barchasi' | 'Tortlar' | 'Pirojniylar' | 'Art Desertlar' | 'Korpus Pirojniylar';

export interface Category {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

export type Product = ProductDto;

export interface CartItem {
  product: Product;
  quantity: number;
}

export type DeliveryType = 'DELIVERY' | 'PICKUP';
export type PaymentMode = 'CLICK' | 'PAYME' | 'CARD_TRANSFER' | 'CASH';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  telegramId: string | number;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  phone?: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

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

export type CustomCakeStatus =
  | 'PENDING_PRICING'
  | 'PRICE_OFFERED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'COMPLETED'
  | 'CANCELLED';

export const CustomCakeStatusEnum = {
  PENDING_PRICING: 'PENDING_PRICING' as CustomCakeStatus,
  PRICE_OFFERED: 'PRICE_OFFERED' as CustomCakeStatus,
  ACCEPTED: 'ACCEPTED' as CustomCakeStatus,
  REJECTED: 'REJECTED' as CustomCakeStatus,
  COMPLETED: 'COMPLETED' as CustomCakeStatus,
  CANCELLED: 'CANCELLED' as CustomCakeStatus,
};

export interface OrderItemPayload {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

export interface CreateOrderPayload extends CreateOrderDto {
  paymentMode: PaymentMode;
  deliveryType?: DeliveryType;
  latitude?: number | null;
  longitude?: number | null;
  paymentReceiptUrl?: string;
  notes?: string;
  telegramId?: number;
}

export interface Order {
  id: string;
  orderNumber: number;
  status: OrderStatus;
  deliveryType: DeliveryType;
  mahalla?: string | null;
  street?: string | null;
  houseNumber?: string | null;
  deliveryAddress?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  paymentMode: PaymentMode;
  paymentReceiptUrl?: string | null;
  paymentStatus: 'UNPAID' | 'PENDING_VERIFICATION' | 'PAID' | 'REJECTED';
  totalAmount: number;
  notes?: string | null;
  createdAt: string;
  phone: string;
  rating?: number | null;
  review?: string | null;
  ratedAt?: string | null;
  items: {
    id: string;
    productName: string;
    price: number;
    quantity: number;
    productId?: string | null;
  }[];
}

export interface CustomCakeDetails {
  shape?: string;
  layers?: string;
  base?: string;
  cream?: string;
  filling?: string;
  customText?: string;
}

export interface CreateCustomCakePayload {
  description: string;
  customDetails?: CustomCakeDetails;
  referenceImages: string[];
  phone: string;
  deliveryType: DeliveryType;
  deliveryAddress?: string;
  desiredWeightKg?: number;
  latitude?: number | null;
  longitude?: number | null;
  distanceKm?: number | null;
  deliveryFee?: number | null;
  telegramId?: number;
}

export interface CustomCakeOrder {
  id: string;
  requestNumber: number;
  description: string;
  customDetails?: CustomCakeDetails;
  referenceImages: string[];
  phone: string;
  deliveryType: DeliveryType;
  deliveryAddress?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  distanceKm?: number | null;
  deliveryFee?: number | null;
  status: CustomCakeStatus;
  estimatedPrice?: number | null;
  createdAt: string;
}

export interface TelegramWebAppUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}
