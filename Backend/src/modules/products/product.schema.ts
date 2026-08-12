import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Product name must be at least 2 characters'),
    description: z.string().optional(),
    price: z.number().positive('Price must be greater than zero'),
    categoryId: z.string().min(1, 'Category ID is required'),
    imageUrl: z.string().optional(),
    isAvailable: z.boolean().optional().default(true),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Product ID parameter is required'),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    price: z.number().positive().optional(),
    categoryId: z.string().optional(),
    imageUrl: z.string().optional(),
    isAvailable: z.boolean().optional(),
  }),
});

export const getProductsQuerySchema = z.object({
  query: z.object({
    categoryId: z.string().optional(),
    isAvailable: z.string().optional().transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined)),
    search: z.string().optional(),
  }),
});

export type CreateProductDTO = z.infer<typeof createProductSchema>['body'];
export type UpdateProductDTO = z.infer<typeof updateProductSchema>['body'];
