import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Product name must be at least 2 characters'),
    nameUz: z.string().optional().nullable(),
    nameUzCyrl: z.string().optional().nullable(),
    nameRu: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    descriptionUz: z.string().optional().nullable(),
    descriptionUzCyrl: z.string().optional().nullable(),
    descriptionRu: z.string().optional().nullable(),
    price: z.number().positive('Price must be greater than zero'),
    categoryId: z.string().min(1, 'Category ID is required'),
    imageUrl: z.string().optional().nullable(),
    isAvailable: z.boolean().optional().default(true),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Product ID parameter is required'),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    nameUz: z.string().optional().nullable(),
    nameUzCyrl: z.string().optional().nullable(),
    nameRu: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    descriptionUz: z.string().optional().nullable(),
    descriptionUzCyrl: z.string().optional().nullable(),
    descriptionRu: z.string().optional().nullable(),
    price: z.number().positive().optional(),
    categoryId: z.string().optional(),
    imageUrl: z.string().optional().nullable(),
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
