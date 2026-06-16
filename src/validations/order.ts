import { z } from "zod";

export const createOrderSchema = z.object({
  addressId: z.string().uuid("Select a delivery address"),
  couponCode: z.string().optional(),
  customerNotes: z.string().max(500).optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "pending", "confirmed", "processing", "shipped",
    "out_for_delivery", "delivered", "cancelled",
    "returned", "refund_initiated", "refunded",
  ]),
  note: z.string().max(500).optional(),
  trackingNumber: z.string().max(100).optional(),
  shippingCarrier: z.string().max(100).optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
