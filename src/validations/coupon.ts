import { z } from "zod";

export const applyCouponSchema = z.object({
  code: z
    .string()
    .min(1, "Coupon code is required")
    .max(50)
    .transform((val) => val.toUpperCase().trim()),
});

export const createCouponSchema = z.object({
  code: z
    .string()
    .min(1, "Coupon code is required")
    .max(50)
    .regex(/^[A-Z0-9_-]+$/, "Code must be uppercase letters, numbers, hyphens, or underscores")
    .transform((val) => val.toUpperCase().trim()),
  description: z.string().max(200).optional(),
  discountType: z.enum(["percentage", "fixed_amount"]),
  discountValue: z.number().int().positive("Discount value must be positive"),
  minOrderAmount: z.number().int().min(0).default(0),
  maxDiscountAmount: z.number().int().positive().optional().nullable(),
  usageLimit: z.number().int().positive().optional().nullable(),
  usagePerUser: z.number().int().positive().default(1),
  startsAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional().nullable(),
  isActive: z.boolean().default(true),
});

export type ApplyCouponInput = z.infer<typeof applyCouponSchema>;
export type CreateCouponInput = z.infer<typeof createCouponSchema>;
