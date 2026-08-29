import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../api/axios.client';
import { ENDPOINTS } from '../../../api/endpoints';
import { CustomCakeRequest, UpdateCustomCakeStatusDTO } from '../../../types/custom-cake.types';
import { ApiResponse } from '../../../types/api.types';

const MOCK_CUSTOM_CAKES: CustomCakeRequest[] = [];

export const useCustomCakes = () => {
  return useQuery<CustomCakeRequest[]>({
    queryKey: ['custom-cakes'],
    queryFn: async () => {
      try {
        const response = await apiClient.get<ApiResponse<CustomCakeRequest[]>>(
          ENDPOINTS.CUSTOM_CAKES.BASE
        );
        return response.data.data || [];
      } catch (err) {
        return MOCK_CUSTOM_CAKES;
      }
    },
    staleTime: 1000 * 2,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
    enabled: !!localStorage.getItem('dinora_admin_token'),
  });
};

export const useUpdateCustomCakeStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: UpdateCustomCakeStatusDTO }) => {
      const response = await apiClient.patch<ApiResponse<CustomCakeRequest>>(
        ENDPOINTS.CUSTOM_CAKES.UPDATE_STATUS(id),
        dto
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-cakes'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-summary'] });
    },
  });
};
