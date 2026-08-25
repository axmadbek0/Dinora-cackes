import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../api/axios.client';
import { ENDPOINTS } from '../../../api/endpoints';
import { showToast } from '../../../components/ui/ToastNotification';

export interface BlockedDateItem {
  id: string;
  date: string;
  reason?: string | null;
  createdBy?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  createdAt?: string;
}

export const useBlockedDates = () => {
  return useQuery<BlockedDateItem[]>({
    queryKey: ['blocked-dates'],
    queryFn: async () => {
      try {
        const response = await apiClient.get(ENDPOINTS.BLOCKED_DATES.BASE);
        return response.data?.data || [];
      } catch (err) {
        return [];
      }
    },
    staleTime: 1000 * 30, // 30s cache
  });
};

export const useBlockDate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { date?: string; startDate?: string; endDate?: string; reason?: string }) => {
      const response = await apiClient.post(ENDPOINTS.BLOCKED_DATES.BASE, payload);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['blocked-dates'] });
      showToast(data.message || 'Sana(lar) muvaffaqiyatli band qilindi!', 'success', 'Band qilindi');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || 'Band qilishda xatolik yuz berdi';
      showToast(msg, 'error', 'Xatolik');
    },
  });
};

export const useUnblockDate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (date: string) => {
      const response = await apiClient.delete(ENDPOINTS.BLOCKED_DATES.BY_DATE(date));
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['blocked-dates'] });
      showToast(data.message || 'Sana muvaffaqiyatli qayta ochildi!', 'success', 'Ochildi');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || 'Ochishda xatolik yuz berdi';
      showToast(msg, 'error', 'Xatolik');
    },
  });
};
