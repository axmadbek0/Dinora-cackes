import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../api/axios.client';
import { ENDPOINTS } from '../../../api/endpoints';
import { Order, UpdateOrderStatusDTO, OrderFilterParams } from '../../../types/order.types';
import { ApiResponse } from '../../../types/api.types';

const MOCK_ORDERS: Order[] = [];

export const useOrders = (params?: OrderFilterParams) => {
  return useQuery<Order[]>({
    queryKey: ['orders', params],
    queryFn: async () => {
      try {
        const response = await apiClient.get<ApiResponse<Order[]>>(ENDPOINTS.ORDERS.BASE, {
          params,
        });
        return response.data.data || [];
      } catch (err) {
        let filtered = [...MOCK_ORDERS];
        if (params?.status) {
          filtered = filtered.filter((o) => o.status === params.status);
        }
        if (params?.search) {
          const q = params.search.toLowerCase();
          filtered = filtered.filter(
            (o) =>
              o.orderNumber.toString().includes(q) ||
              o.user?.firstName?.toLowerCase().includes(q) ||
              o.user?.phone?.includes(q)
          );
        }
        return filtered;
      }
    },
    staleTime: 1000 * 30, // 30 sec cache
    refetchInterval: 15000, // Poll orders every 15 seconds
    enabled: !!localStorage.getItem('dinora_admin_token'),
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: UpdateOrderStatusDTO }) => {
      const response = await apiClient.patch<ApiResponse<Order>>(
        ENDPOINTS.ORDERS.UPDATE_STATUS(id),
        dto
      );
      return response.data.data;
    },
    onMutate: async ({ id, dto }) => {
      await queryClient.cancelQueries({ queryKey: ['orders'] });
      const previousOrders = queryClient.getQueryData<Order[]>(['orders']);

      if (previousOrders) {
        queryClient.setQueryData<Order[]>(
          ['orders'],
          previousOrders.map((o) =>
            o.id === id
              ? {
                  ...o,
                  ...(dto.status ? { status: dto.status } : {}),
                  ...(dto.isArchived !== undefined ? { isArchived: dto.isArchived } : {}),
                }
              : o
          )
        );
      }

      return { previousOrders };
    },
    onError: (_err, _newVal, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(['orders'], context.previousOrders);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-summary'] });
    },
  });
};
