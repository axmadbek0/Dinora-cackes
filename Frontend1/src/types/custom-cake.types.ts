import { User } from './user.types';
import { DeliveryType } from './order.types';

export enum CustomCakeStatus {
  PENDING_PRICING = 'PENDING_PRICING',
  PRICE_OFFERED = 'PRICE_OFFERED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface CustomCakeDetails {
  shape?: string;
  layers?: string;
  base?: string;
  cream?: string;
  filling?: string;
  customText?: string;
}

export interface CustomCakeRequest {
  id: string;
  requestNumber: number;
  userId: string;
  user?: User;
  referenceImageUrl?: string | null;
  photos?: string[]; // Fallback list support
  description: string;
  customDetails?: CustomCakeDetails;
  deliveryType: DeliveryType;
  deliveryAddress?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  distanceKm?: number | null;
  deliveryFee?: number | null;
  estimatedPrice?: number | string | null;
  status: CustomCakeStatus;
  adminNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateCustomCakeStatusDTO {
  status: CustomCakeStatus;
  estimatedPrice?: number;
  adminNotes?: string;
}
