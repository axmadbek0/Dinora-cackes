import { Context, SessionFlavor } from 'grammy';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface SessionData {
  step?:
    | 'IDLE'
    | 'AWAITING_PHONE'
    | 'AWAITING_NAME'
    | 'AWAITING_DELIVERY_TYPE'
    | 'AWAITING_DISTRICT'
    | 'AWAITING_LOCATION'
    | 'AWAITING_ADDRESS'
    | 'AWAITING_PAYMENT_MODE'
    | 'AWAITING_PAYMENT_RECEIPT'
    | 'AWAITING_CUSTOM_SHAPE_INPUT'
    | 'AWAITING_CUSTOM_LAYER_INPUT'
    | 'AWAITING_CUSTOM_BASE_INPUT'
    | 'AWAITING_CUSTOM_CREAM_INPUT'
    | 'AWAITING_CUSTOM_FILLING_INPUT'
    | 'AWAITING_CUSTOM_PHOTO'
    | 'AWAITING_CUSTOM_DESCRIPTION'
    | 'AWAITING_CUSTOM_LOCATION'
    | 'AWAITING_CUSTOM_TEXT'
    | 'AWAITING_ADMIN_PRICE_INPUT';
  adminPriceTargetRequestId?: string;
  cart: CartItem[];
  pendingOrder?: {
    orderId?: string;
    customerName?: string;
    deliveryDistrict?: string;
    deliveryType?: 'DELIVERY' | 'PICKUP';
    mahalla?: string;
    street?: string;
    houseNumber?: string;
    phone?: string;
    deliveryAddress?: string;
    latitude?: number;
    longitude?: number;
    paymentMode?: 'CLICK' | 'PAYME' | 'CARD_TRANSFER' | 'CASH';
    notes?: string;
    deliveryDate?: string;
  };
  pendingCustomCake?: {
    shape?: string;
    layers?: string;
    base?: string;
    cream?: string;
    filling?: string;
    customText?: string;
    referenceImageUrl?: string;
    description?: string;
    deliveryType?: 'DELIVERY' | 'PICKUP';
    deliveryAddress?: string;
    deliveryDate?: string;
    latitude?: number;
    longitude?: number;
    distanceKm?: number;
    deliveryFee?: number;
  };
}

export type BotContext = Context & SessionFlavor<SessionData>;
