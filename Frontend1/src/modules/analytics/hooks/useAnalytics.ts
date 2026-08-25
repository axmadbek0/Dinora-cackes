import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../api/axios.client';
import { ENDPOINTS } from '../../../api/endpoints';
import { AnalyticsSummary, ApiResponse } from '../../../types/api.types';

export const useAnalytics = () => {
  return useQuery<AnalyticsSummary>({
    queryKey: ['analytics-summary'],
    queryFn: async () => {
      const isCleared = localStorage.getItem('dinora_is_data_cleared') === 'true';

      try {
        const response = await apiClient.get<ApiResponse<AnalyticsSummary>>(
          ENDPOINTS.ANALYTICS.SUMMARY
        );
        return response.data.data;
      } catch (err) {
        if (isCleared) {
          return {
            totalRevenue: 0,
            totalOrders: 0,
            pendingCustomCakes: 0,
            activeProducts: 0,
            monthlyRevenue: [],
            categoryDistribution: [],
            orderStatusCounts: [],
          };
        }

        // Clean zero baseline if no data
        return {
          totalRevenue: 0,
          totalOrders: 0,
          pendingCustomCakes: 0,
          activeProducts: 0,
          monthlyRevenue: [],
          categoryDistribution: [],
          orderStatusCounts: [],
        };
      }
    },
    refetchInterval: 15000, // auto refetch every 15s
    enabled: !!localStorage.getItem('dinora_admin_token'),
  });
};
