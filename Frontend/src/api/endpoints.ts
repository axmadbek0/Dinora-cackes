export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    TELEGRAM_LOGIN: '/auth/telegram-login',
    ME: '/auth/me',
  },
  PRODUCTS: {
    BASE: '/products',
    BY_ID: (id: string) => `/products/${id}`,
    CATEGORIES: '/products/categories',
    TOGGLE_STOCK: (id: string) => `/products/${id}/toggle-stock`,
  },
  ORDERS: {
    BASE: '/orders',
    BY_ID: (id: string) => `/orders/${id}`,
    UPDATE_STATUS: (id: string) => `/orders/${id}/status`,
  },
  CUSTOM_CAKES: {
    BASE: '/custom-cakes',
    BY_ID: (id: string) => `/custom-cakes/${id}`,
    UPDATE_STATUS: (id: string) => `/custom-cakes/${id}/status`,
  },
  SETTINGS: {
    BASE: '/settings',
    CLEAR_ALL: '/settings/clear-all-data',
  },
  BLOCKED_DATES: {
    BASE: '/blocked-dates',
    BY_DATE: (date: string) => `/blocked-dates/${date}`,
  },
  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard',
    SUMMARY: '/analytics/summary',
  },
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
    UPDATE_ROLE: (id: string) => `/users/${id}/role`,
  },
};
