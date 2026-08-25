/**
 * Environment configuration for DINORA Admin Dashboard
 */
export const getApiBaseUrl = (): string => {
  const envUrl = (import.meta as any).env?.VITE_API_BASE_URL || (import.meta as any).env?.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.startsWith('http')) {
    return envUrl;
  }
  if (typeof window !== 'undefined') {
    if (window.location.hostname.includes('dinorashirinliklari.uz')) {
      return 'https://dinorashirinliklari.uz/api/v1';
    }
  }
  return 'http://localhost:5000/api/v1';
};

export const API_BASE_URL = getApiBaseUrl();

export const ENV = {
  API_BASE_URL,
  IS_DEV: (import.meta as any).env?.DEV ?? true,
  TELEGRAM_WEBAPP: typeof window !== 'undefined' ? (window as any).Telegram?.WebApp : undefined,
  APP_NAME: 'DINORA Pastry Admin',
};
