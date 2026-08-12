import { z } from 'zod';

export const createCustomCakeSchema = z.object({
  body: z.object({
    telegramId: z.union([z.number(), z.string()]).optional(),
    phone: z.string().min(7, 'Valid phone number is required'),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    username: z.string().optional(),
    referenceImageUrl: z.string().optional(),
    referenceImages: z.array(z.string()).optional(),
    description: z.string().min(3, 'Detailed description is required'),
    deliveryType: z.enum(['DELIVERY', 'PICKUP']).default('DELIVERY'),
    deliveryAddress: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    desiredWeightKg: z.number().optional(),
  }),
});

export const updateCustomCakeStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Request ID is required'),
  }),
  body: z.object({
    status: z.enum(['PENDING_PRICING', 'PRICE_OFFERED', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED']),
    estimatedPrice: z.number().positive().optional(),
    adminNotes: z.string().optional(),
  }),
});

export type CreateCustomCakeDTO = z.infer<typeof createCustomCakeSchema>['body'];
export type UpdateCustomCakeStatusDTO = z.infer<typeof updateCustomCakeStatusSchema>['body'];
