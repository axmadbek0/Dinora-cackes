import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({
    customerName: z.string().optional(),
    customerPhone: z.string().optional(),
    phone: z.string().optional(),
    mahalla: z.string().optional().nullable(),
    street: z.string().optional().nullable(),
    houseNumber: z.string().optional().nullable(),
    deliveryDistrict: z.string().optional().nullable(),
    cartItems: z
      .array(
        z.object({
          productId: z.string(),
          quantity: z.number().int().positive('Quantity must be at least 1'),
        })
      )
      .optional(),
    items: z
      .array(
        z.object({
          productId: z.string(),
          quantity: z.number().int().positive(),
          productName: z.string().optional(),
          price: z.number().optional(),
        })
      )
      .optional(),
    totalAmount: z.number().optional(),
    paymentMode: z.string().optional().nullable(),
    telegramId: z.union([z.number(), z.string()]).optional().nullable(),
    notes: z.string().optional().nullable(),
    deliveryType: z.string().optional().nullable(),
    addressDetails: z.string().optional().nullable(),
  }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Order ID is required'),
  }),
  body: z.object({
    status: z.preprocess((val) => {
      if (val === 'PENDING_APPROVAL') return 'AWAITING_RECEIPT';
      if (val === 'CANCELLED') return 'CANCELED';
      return val;
    }, z.enum([
      'AWAITING_RECEIPT',
      'RECEIPT_SUBMITTED',
      'APPROVED',
      'REJECTED',
      'PREPARING',
      'DELIVERING',
      'COMPLETED',
      'CANCELED',
      'CANCELLED',
      'PENDING_APPROVAL',
    ])),
    adminNotes: z.string().optional(),
    paymentStatus: z.enum(['UNPAID', 'PENDING_VERIFICATION', 'PAID', 'REJECTED']).optional(),
  }),
});

export const getOrdersQuerySchema = z.object({
  query: z.object({
    telegramId: z.string().optional(),
    status: z.string().optional(),
  }),
});

export type CreateOrderDTO = z.infer<typeof createOrderSchema>['body'];
export type UpdateOrderStatusDTO = z.infer<typeof updateOrderStatusSchema>['body'];
