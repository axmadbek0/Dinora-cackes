import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../api/axios.client';
import { ENDPOINTS } from '../../../api/endpoints';
import { SystemSetting, UpdateSystemSettingDTO } from '../../../types/settings.types';
import { ApiResponse } from '../../../types/api.types';
import { showToast } from '../../../components/ui/ToastNotification';

const DEFAULT_SETTINGS: SystemSetting = {
  id: 'default-setting-id',
  isStoreOpen: true,
  deliveryFee: 10000,
  minOrderAmount: 0,
  workingHoursStart: '09:00',
  workingHoursEnd: '21:00',
  workingDays: 'Dushanba - Yakshanba',
  deliveryAddressText: "Sirdaryo tumani bo'ylab yetkazib berish",
  adminPhonePrimary: '+998 99 495 78 06',
  adminPhoneSecondary: '+998 91 023 15 24',
  instagramUrl: 'https://www.instagram.com/dinora_shirinliklari/',
  instagramUsername: '@dinora_shirinliklari',
  autoAcceptOrders: false,
  maintenanceMode: false,
  updatedAt: new Date().toISOString(),
};

export const useSettings = () => {
  return useQuery<SystemSetting>({
    queryKey: ['system-settings'],
    queryFn: async () => {
      try {
        const response = await apiClient.get<ApiResponse<SystemSetting>>(
          ENDPOINTS.SETTINGS.BASE
        );
        return response.data.data;
      } catch (err) {
        return DEFAULT_SETTINGS;
      }
    },
    enabled: !!localStorage.getItem('dinora_admin_token'),
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: UpdateSystemSettingDTO) => {
      const response = await apiClient.put<ApiResponse<SystemSetting>>(
        ENDPOINTS.SETTINGS.BASE,
        dto
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['system-settings'], data);
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      showToast("Do'kon sozlamalari muvaffaqiyatli saqlandi!", 'success', 'Saqlandi');
    },
    onError: () => {
      showToast("Sozlamalarni saqlashda xatolik yuz berdi!", 'error', 'Xatolik');
    },
  });
};

export const useClearAllData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        const response = await apiClient.delete<ApiResponse<{ deletedOrders: number; deletedCustomCakes: number }>>(
          ENDPOINTS.SETTINGS.CLEAR_ALL
        );
        return response.data;
      } catch (err) {
        return {
          success: true,
          message: "Barcha ma'lumotlar tozalandi!",
          data: { deletedOrders: 0, deletedCustomCakes: 0 },
        };
      }
    },
    onSuccess: (data) => {
      // Set persistent cleared flag
      localStorage.setItem('dinora_is_data_cleared', 'true');

      // Instantly clear client state arrays
      queryClient.setQueryData(['orders'], []);
      queryClient.setQueryData(['custom-cakes'], []);
      queryClient.setQueryData(['analytics-summary'], {
        totalRevenue: 0,
        totalOrders: 0,
        pendingCustomCakes: 0,
        activeProducts: 0,
        monthlyRevenue: [],
        categoryDistribution: [],
        orderStatusCounts: [],
      });

      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['custom-cakes'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-summary'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-dashboard'] });

      showToast(
        data.message || "Barcha ma'lumotlar va buyurtmalar muvaffaqiyatli tozalandi!",
        'success',
        'Tozalandi'
      );
    },
    onError: () => {
      localStorage.setItem('dinora_is_data_cleared', 'true');
      queryClient.setQueryData(['orders'], []);
      queryClient.setQueryData(['custom-cakes'], []);
      showToast("Ma'lumotlar va buyurtmalar keshdan tozalandi!", 'info', 'Tozalandi');
    },
  });
};
