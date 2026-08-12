import { User } from './user.types';
import { Product } from './product.types';

export enum OrderStatus {
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PREPARING = 'PREPARING',
  DELIVERING = 'DELIVERING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum DeliveryType {
  DELIVERY = 'DELIVERY',
  PICKUP = 'PICKUP',
}

export enum PaymentMode {
  CARD_TRANSFER = 'CARD_TRANSFER',
  CASH = 'CASH',
}

export enum PaymentStatus {
  UNPAID = 'UNPAID',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  PAID = 'PAID',
  REJECTED = 'REJECTED',
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId?: string | null;
  product?: Product | null;
  productName: string;
  price: number | string;
  quantity: number;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: number;
  userId: string;
  user?: User;
  status: OrderStatus;
  deliveryType: DeliveryType;
  deliveryAddress?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  paymentMode: PaymentMode;
  paymentReceiptUrl?: string | null;
  paymentStatus: PaymentStatus;
  totalAmount: number | string;
  notes?: string | null;
  adminNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface OrderFilterParams {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  search?: string;
}

export interface UpdateOrderStatusDTO {
  status: OrderStatus;
  adminNotes?: string;
}
