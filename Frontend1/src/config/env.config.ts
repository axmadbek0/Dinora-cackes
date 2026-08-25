/**
 * Environment configuration for DINORA Admin Dashboard
 */
export const ENV = {
  API_BASE_URL: (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  IS_DEV: (import.meta as any).env?.DEV ?? true,
  TELEGRAM_WEBAPP: typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined,
  APP_NAME: 'DINORA Pastry Admin',
};
