import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { ENV } from '../config/env.config';
import { showToast } from '../components/ui/ToastNotification';

export const apiClient: AxiosInstance = axios.create({
  baseURL: ENV.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach Auth Tokens & Telegram WebApp initData
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 1. Check for Telegram Mini App initData
    const initData = window.Telegram?.WebApp?.initData;
    if (initData) {
      config.headers['X-Telegram-Init-Data'] = initData;
    }

    // 2. Attach JWT Bearer Token if logged in
    const token = localStorage.getItem('dinora_admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Track recent 401 toast to avoid duplicate toasts
let isUnauthorizedToastShown = false;

// Response Interceptor: Global Error Toast Handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';
    const isAuthRoute = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/me') || requestUrl.includes('/auth/telegram-login');
    const message = error.response?.data?.message || error.message;

    // Do NOT trigger global session invalidation if 401 comes from login or token check routes
    if (status === 401 && !isAuthRoute) {
      const isCurrentlyLoggedIn = !!localStorage.getItem('dinora_admin_token');
      localStorage.removeItem('dinora_admin_token');
      localStorage.removeItem('dinora_admin_user');

      if (isCurrentlyLoggedIn && !isUnauthorizedToastShown) {
        isUnauthorizedToastShown = true;
        showToast('Sessiya muddati tugadi. Qayta kirishingiz shart!', 'error', 'Avtorizatsiya xatosi');
        setTimeout(() => {
          isUnauthorizedToastShown = false;
        }, 5000);
      }

      // Notify AuthContext without triggering window.location.href reload loop
      window.dispatchEvent(new Event('auth:unauthorized'));
    } else if (status === 403) {
      showToast('Sizda ushbu amalni bajarish uchun ruxsat yetarli emas!', 'warning', 'Ruxsat yo\'q');
    } else if (status === 422) {
      showToast(message || "Kiritilgan ma'lumotlarda xatolik bor!", 'warning', 'Tekshiruv xatosi');
    } else if (status === 500 && !isAuthRoute) {
      showToast("Serverda ichki xatolik yuz berdi. Keyinroq qayta urinib ko'ring.", 'error', 'Server xatosi');
    }

    return Promise.reject(error);
  }
);
