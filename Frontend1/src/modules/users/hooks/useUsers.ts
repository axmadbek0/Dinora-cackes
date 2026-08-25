import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../api/axios.client';
import { ENDPOINTS } from '../../../api/endpoints';
import { showToast } from '../../../components/ui/ToastNotification';

export interface UserItem {
  id: string;
  telegramId: string | null;
  firstName: string;
  lastName: string;
  username: string | null;
  phone: string;
  role: 'USER' | 'ADMIN';
  ordersCount: number;
  customCakesCount: number;
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
}

export const useUsers = (params?: { search?: string; role?: string }) => {
  return useQuery<UserItem[]>({
    queryKey: ['users', params],
    queryFn: async () => {
      try {
        const response = await apiClient.get(ENDPOINTS.USERS.BASE, { params });
        return response.data?.data || [];
      } catch (err) {
        return [];
      }
    },
    staleTime: 1000 * 30,
    enabled: !!localStorage.getItem('dinora_admin_token'),
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: 'USER' | 'ADMIN' }) => {
      const response = await apiClient.patch(ENDPOINTS.USERS.UPDATE_ROLE(id), { role });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showToast(data.message || 'Huquq muvaffaqiyatli o\'zgardi!', 'success', 'Yangilandi');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || 'Xatolik yuz berdi';
      showToast(msg, 'error', 'Xatolik');
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(ENDPOINTS.USERS.BY_ID(id));
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showToast(data.message || 'Foydalanuvchi tizimdan o\'chirildi!', 'success', 'O\'chirildi');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || 'O\'chirishda xatolik yuz berdi';
      showToast(msg, 'error', 'Xatolik');
    },
  });
};
