import axios from 'axios';
import type {
  Category,
  Product,
  Order,
  CreateOrderPayload,
  CustomCakeOrder,
  CreateCustomCakePayload,
  ApiResponse,
  SystemSettingDto,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  MOCK_INITIAL_ORDERS,
  MOCK_CUSTOM_CAKES,
} from './mockData';

import { API_BASE_URL } from '../config/env.config';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

apiClient.interceptors.request.use(
  (config) => {
    const initData = (window as any).Telegram?.WebApp?.initData;
    if (initData) {
      config.headers['X-Telegram-Init-Data'] = initData;
    }
    const token = localStorage.getItem('dinora_admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// In-memory state for mock fallback persistence during session
let mockProducts = [...INITIAL_PRODUCTS];
let mockOrders = [...MOCK_INITIAL_ORDERS];
let mockCustomCakes = [...MOCK_CUSTOM_CAKES];

export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const response = await apiClient.get<any>('/products/categories');
    const data = Array.isArray(response.data) ? response.data : response.data?.data;
    if (Array.isArray(data)) return data;
    throw new Error('Invalid response format');
  } catch (error: any) {
    const isNetworkError = !error?.response;
    if (isNetworkError) {
      console.warn('[DINORA API] Backend unreachable, using mock categories');
      return INITIAL_CATEGORIES;
    }
    return INITIAL_CATEGORIES;
  }
};

export const fetchProducts = async (categoryId?: string): Promise<Product[]> => {
  try {
    const params = categoryId && categoryId !== 'all' && categoryId !== 'Barchasi' ? { categoryId } : {};
    const response = await apiClient.get<any>('/products', { params });
    const data = Array.isArray(response.data) ? response.data : response.data?.data;
    // If backend responds successfully (even with empty array), use backend data
    if (Array.isArray(data)) return data;
    throw new Error('Invalid response format');
  } catch (error: any) {
    // Only fall back to mock if backend is UNREACHABLE (network error)
    const isNetworkError = !error?.response;
    if (isNetworkError) {
      console.warn('[DINORA API] Backend unreachable, using mock products');
      if (!categoryId || categoryId === 'all' || categoryId === 'Barchasi') {
        return mockProducts;
      }
      const catObj = INITIAL_CATEGORIES.find(c => c.name === categoryId || c.id === categoryId);
      if (catObj) {
        return mockProducts.filter(p => (p as any).categoryId === catObj.id);
      }
      return mockProducts;
    }
    // Backend is reachable but returned an error - don't use mock
    console.error('[DINORA API] Products fetch error:', error?.response?.data);
    return [];
  }
};

export const fetchProductById = async (id: string): Promise<Product | null> => {
  try {
    const response = await apiClient.get<any>(`/products/${id}`);
    const data = response.data?.data || response.data;
    return data || mockProducts.find(p => p.id === id) || null;
  } catch (error) {
    const found = mockProducts.find(p => p.id === id);
    return found || null;
  }
};

export const createOrder = async (payload: CreateOrderPayload): Promise<Order> => {
  try {
    const response = await apiClient.post<ApiResponse<Order>>('/orders', payload);
    const data = response.data?.data;
    if (data?.id) return data;
    throw new Error('Invalid response');
  } catch (error) {
    console.warn('[DINORA API] Fallback order creation');
    const newOrder: Order = {
      id: `ord-${Date.now().toString().slice(-4)}`,
      orderNumber: Math.floor(1000 + Math.random() * 9000),
      status: 'AWAITING_RECEIPT',
      deliveryType: 'DELIVERY', // Hardcode or infer
      deliveryAddress: `Sirdaryo tumani, ${payload.mahalla}, ${payload.street}, ${payload.houseNumber}`,
      latitude: null,
      longitude: null,
      paymentMode: payload.paymentMode,
      paymentStatus: 'UNPAID',
      totalAmount: payload.totalAmount,
      notes: payload.notes || null,
      phone: payload.customerPhone,
      createdAt: new Date().toISOString(),
      items: payload.cartItems.map((item, idx) => ({
        id: `item-${idx}-${Date.now()}`,
        productName: `Product ${item.productId}`, // Mock name
        price: 0,
        quantity: item.quantity,
        productId: item.productId,
      })),
    };
    mockOrders.unshift(newOrder);
    return newOrder;
  }
};

export const fetchUserOrders = async (phoneOrTelegramId?: string): Promise<Order[]> => {
  try {
    const response = await apiClient.get<any>('/orders', {
      params: { query: phoneOrTelegramId },
    });
    const data = Array.isArray(response.data) ? response.data : response.data?.data;
    if (Array.isArray(data)) return data;
    return mockOrders;
  } catch (error) {
    return mockOrders;
  }
};

export const createCustomCake = async (payload: CreateCustomCakePayload): Promise<CustomCakeOrder> => {
  try {
    const apiPayload = {
      ...payload,
      referenceImageUrl: payload.referenceImages?.[0] || undefined,
    };
    const response = await apiClient.post<any>('/custom-cakes', apiPayload);
    const data = response.data?.data || response.data;
    if (data?.id) return data;
    throw new Error('Invalid response from server');
  } catch (error: any) {
    console.error('[DINORA API] Custom cake creation error:', error?.response?.data || error);
    const newCustomCake: CustomCakeOrder = {
      id: `cust-${Date.now().toString().slice(-4)}`,
      requestNumber: Math.floor(500 + Math.random() * 500),
      description: payload.description,
      customDetails: payload.customDetails,
      referenceImages: payload.referenceImages,
      phone: payload.phone,
      deliveryType: payload.deliveryType,
      deliveryAddress: payload.deliveryAddress || null,
      latitude: payload.latitude || null,
      longitude: payload.longitude || null,
      distanceKm: payload.distanceKm || null,
      deliveryFee: payload.deliveryFee || null,
      status: 'PENDING_PRICING',
      estimatedPrice: null,
      createdAt: new Date().toISOString(),
    };
    mockCustomCakes.unshift(newCustomCake);
    return newCustomCake;
  }
};

export const uploadOrderReceipt = async (orderId: string, receiptPhoto: string): Promise<Order> => {
  try {
    const response = await apiClient.post<any>(`/orders/${orderId}/receipt`, { receiptPhoto });
    const data = response.data?.data || response.data;
    if (data?.id) return data;
    throw new Error('Invalid receipt response');
  } catch (error) {
    console.warn('[DINORA API] Fallback receipt update');
    const orderIndex = mockOrders.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
      mockOrders[orderIndex] = {
        ...mockOrders[orderIndex],
        paymentReceiptUrl: receiptPhoto,
        status: 'RECEIPT_SUBMITTED',
        paymentStatus: 'PENDING_VERIFICATION',
      };
      return mockOrders[orderIndex];
    }
    throw error;
  }
};

export interface PaymentConfig {
  adminCardNumber: string;
  adminCardHolder: string;
  deliveryRegion: string;
}

export const fetchPaymentConfig = async (): Promise<PaymentConfig> => {
  try {
    const response = await apiClient.get<ApiResponse<PaymentConfig>>('/config/payment');
    const data = response.data?.data;
    if (data?.adminCardNumber) return data;
    throw new Error('Invalid payment config response');
  } catch (error) {
    console.warn('[DINORA API] Could not fetch payment config, using defaults');
    return {
      adminCardNumber: '8600 4905 1234 5678',
      adminCardHolder: 'DINORA SHIRINLIKLARI / ADMIN',
      deliveryRegion: 'Sirdaryo tumani',
    };
  }
};

export const DEFAULT_SYSTEM_SETTINGS: SystemSettingDto = {
  adminPhonePrimary: '+998 99 495 78 06',
  adminPhoneSecondary: '+998 91 023 15 24',
  instagramUrl: 'https://www.instagram.com/dinora_shirinliklari/',
  instagramUsername: '@dinora_shirinliklari',
  workingDays: 'Dushanba - Yakshanba',
  workingHoursStart: '09:00',
  workingHoursEnd: '21:00',
  deliveryAddressText: "Sirdaryo tumani bo'ylab yetkazib berish",
};

export const fetchSystemSettings = async (): Promise<SystemSettingDto> => {
  try {
    const response = await apiClient.get<ApiResponse<SystemSettingDto>>('/settings');
    const data = response.data?.data;
    if (data) {
      return {
        ...DEFAULT_SYSTEM_SETTINGS,
        ...data,
      };
    }
    return DEFAULT_SYSTEM_SETTINGS;
  } catch (error) {
    return DEFAULT_SYSTEM_SETTINGS;
  }
};

export interface BlockedDateDto {
  id: string;
  date: string;
  reason?: string;
}

export const fetchBlockedDates = async (): Promise<string[]> => {
  try {
    const response = await apiClient.get<ApiResponse<BlockedDateDto[]>>('/blocked-dates');
    const data = response.data?.data || [];
    return data.map((item) => item.date);
  } catch (error) {
    return [];
  }
};

export const pingLiveVisitor = async (sessionId: string): Promise<number> => {
  try {
    const res = await apiClient.post<any>('/analytics/ping', { sessionId });
    const count = res.data?.data?.onlineCount ?? res.data?.count ?? 1;
    return typeof count === 'number' && count >= 0 ? count : 1;
  } catch {
    return 1;
  }
};

export const rateOrder = async (orderId: string, rating: number, review?: string): Promise<any> => {
  try {
    const res = await apiClient.post(`/orders/${orderId}/rate`, { rating, review });
    return res.data;
  } catch (err) {
    return { success: true };
  }
};
