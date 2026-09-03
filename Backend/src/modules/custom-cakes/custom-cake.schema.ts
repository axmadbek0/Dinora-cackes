import { z } from 'zod';

export const createCustomCakeSchema = z.object({
  body: z.object({
    telegramId: z.union([z.number(), z.string()]).optional().nullable(),
    phone: z.string().min(5, 'Valid phone number is required').optional().nullable(),
    customerPhone: z.string().optional().nullable(),
    firstName: z.string().optional().nullable(),
    lastName: z.string().optional().nullable(),
    username: z.string().optional().nullable(),
    customerName: z.string().optional().nullable(),
    referenceImageUrl: z.string().optional().nullable(),
    referenceImages: z.array(z.string()).optional().nullable(),
    description: z.string().min(1, 'Detailed description is required'),
    customDetails: z
      .object({
        shape: z.string().optional().nullable(),
        layers: z.string().optional().nullable(),
        base: z.string().optional().nullable(),
        cream: z.string().optional().nullable(),
        filling: z.string().optional().nullable(),
        customText: z.string().optional().nullable(),
      })
      .passthrough()
      .optional()
      .nullable(),
    deliveryType: z.enum(['DELIVERY', 'PICKUP']).default('DELIVERY').optional().nullable(),
    deliveryRegion: z.string().optional().nullable(),
    deliveryAddress: z.string().optional().nullable(),
    deliveryDate: z.string().optional().nullable(),
    addressDetails: z.string().optional().nullable(),
    latitude: z.union([z.number(), z.string()]).optional().nullable(),
    longitude: z.union([z.number(), z.string()]).optional().nullable(),
    distanceKm: z.union([z.number(), z.string()]).optional().nullable(),
    deliveryFee: z.union([z.number(), z.string()]).optional().nullable(),
    desiredWeightKg: z.union([z.number(), z.string()]).optional().nullable(),
    specialNotes: z.string().optional().nullable(),
  }).passthrough(),
});

export const updateCustomCakeStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Request ID is required'),
  }),
  body: z.object({
    status: z.preprocess((val) => {
      if (val === 'CANCELED') return 'CANCELLED';
      return val;
    }, z.enum(['PENDING_PRICING', 'PRICE_OFFERED', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED', 'CANCELED'])),
    estimatedPrice: z.union([z.number(), z.string()]).optional().nullable().transform((val) => val ? Number(val) : undefined),
    adminNotes: z.string().optional().nullable(),
  }).passthrough(),
});

export type CreateCustomCakeDTO = z.infer<typeof createCustomCakeSchema>['body'];
export type UpdateCustomCakeStatusDTO = z.infer<typeof updateCustomCakeStatusSchema>['body'];

