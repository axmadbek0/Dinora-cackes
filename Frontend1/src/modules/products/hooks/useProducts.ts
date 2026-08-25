import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../api/axios.client';
import { ENDPOINTS } from '../../../api/endpoints';
import { Product, Category, CreateProductDTO, UpdateProductDTO, ProductFilterParams } from '../../../types/product.types';
import { ApiResponse } from '../../../types/api.types';

const MOCK_PRODUCTS: Product[] = [];

const MOCK_CATEGORIES: Category[] = [
  { id: 'cat-all', name: 'Barchasi', slug: 'all', isActive: true, createdAt: '', updatedAt: '' },
  { id: 'cat-1', name: 'Tortlar', slug: 'tortlar', isActive: true, createdAt: '', updatedAt: '' },
  { id: 'cat-2', name: 'Pirojniylar', slug: 'pirojniylar', isActive: true, createdAt: '', updatedAt: '' },
  { id: 'cat-3', name: 'Art Desertlar', slug: 'art-desertlar', isActive: true, createdAt: '', updatedAt: '' },
  { id: 'cat-4', name: 'Korpus Pirojniylar', slug: 'korpus-pirojniylar', isActive: true, createdAt: '', updatedAt: '' },
];

import { showToast } from '../../../components/ui/ToastNotification';

export const useProducts = (params?: ProductFilterParams) => {
  return useQuery<Product[]>({
    queryKey: ['products', params],
    queryFn: async () => {
      try {
        const response = await apiClient.get<ApiResponse<Product[]>>(ENDPOINTS.PRODUCTS.BASE, {
          params,
        });
        return response.data.data || [];
      } catch (err) {
        return [];
      }
    },
    staleTime: 1000 * 10,
  });
};

export const useCategories = () => {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const response = await apiClient.get<ApiResponse<Category[]>>(
          ENDPOINTS.PRODUCTS.CATEGORIES
        );
        return response.data.data || MOCK_CATEGORIES;
      } catch (err) {
        return MOCK_CATEGORIES;
      }
    },
    staleTime: 1000 * 60 * 10,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateProductDTO) => {
      const response = await apiClient.post<ApiResponse<Product>>(ENDPOINTS.PRODUCTS.BASE, dto);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-summary'] });
      showToast('Yangi mahsulot ma\'lumotlar bazasiga muvaffaqiyatli saqlandi! 🎂', 'success', 'Saqlandi');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || 'Mahsulot saqlashda xatolik';
      showToast(msg, 'error', 'Xatolik');
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: UpdateProductDTO }) => {
      const response = await apiClient.put<ApiResponse<Product>>(
        ENDPOINTS.PRODUCTS.BY_ID(id),
        dto
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-summary'] });
      showToast('Mahsulot tahrirlandi va bazada yangilandi!', 'success', 'Yangilandi');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || 'Tahrirlashda xatolik';
      showToast(msg, 'error', 'Xatolik');
    },
  });
};

export const useUpdateStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isAvailable }: { id: string; isAvailable: boolean }) => {
      try {
        const response = await apiClient.patch<ApiResponse<Product>>(
          ENDPOINTS.PRODUCTS.TOGGLE_STOCK(id),
          { isAvailable }
        );
        return response.data.data;
      } catch (err) {
        const response = await apiClient.put<ApiResponse<Product>>(
          ENDPOINTS.PRODUCTS.BY_ID(id),
          { isAvailable }
        );
        return response.data.data;
      }
    },
    onMutate: async ({ id, isAvailable }) => {
      await queryClient.cancelQueries({ queryKey: ['products'] });
      const previousProducts = queryClient.getQueryData<Product[]>(['products']);

      if (previousProducts) {
        queryClient.setQueryData<Product[]>(
          ['products'],
          previousProducts.map((p) => (p.id === id ? { ...p, isAvailable } : p))
        );
      }

      return { previousProducts };
    },
    onError: (_err, _newVal, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(['products'], context.previousProducts);
      }
      showToast('Zaxira holatini o\'zgartirishda xatolik', 'error', 'Xatolik');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-summary'] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(ENDPOINTS.PRODUCTS.BY_ID(id));
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-summary'] });
      showToast('Mahsulot ma\'lumotlar bazasidan o\'chirildi!', 'success', 'O\'chirildi');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || 'O\'chirishda xatolik';
      showToast(msg, 'error', 'Xatolik');
    },
  });
};
