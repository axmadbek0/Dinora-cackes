export * from './api.types';
import { OrderStatus, ProductDto, CreateOrderDto } from './api.types';

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

export type CustomCakeStatus =
  | 'PENDING_PRICING'
  | 'PRICE_OFFERED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface OrderItemPayload {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

export interface CreateOrderPayload extends CreateOrderDto {
  paymentMode: PaymentMode;
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
  items: {
    id: string;
    productName: string;
    price: number;
    quantity: number;
    productId?: string | null;
  }[];
}

export interface CreateCustomCakePayload {
  description: string;
  referenceImages: string[];
  phone: string;
  deliveryType: DeliveryType;
  deliveryAddress?: string;
  desiredWeightKg?: number;
}

export interface CustomCakeOrder {
  id: string;
  requestNumber: number;
  description: string;
  referenceImages: string[];
  phone: string;
  deliveryType: DeliveryType;
  deliveryAddress?: string | null;
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
