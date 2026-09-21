import { z } from 'zod';

import { MAX_QUANTITY_PER_ITEM } from '../services/cart.service.js';
import { cuid, paginationSchema, rupees } from './common.js';

/* -------------------------------------------------------------------- cart */

export const addToCartSchema = z.object({
  productId: cuid,
  quantity: z.coerce.number().int().min(1).max(MAX_QUANTITY_PER_ITEM).default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().min(0).max(MAX_QUANTITY_PER_ITEM),
});

export const couponCodeSchema = z.object({
  code: z.string().trim().min(3).max(32).toUpperCase(),
});

/* ---------------------------------------------------------------- addresses */

export const addressSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().regex(/^[0-9+\-\s()]{6,20}$/, 'Enter a valid phone number'),
  line1: z.string().trim().min(4).max(200),
  line2: z.string().trim().max(200).optional().or(z.literal('')),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  postalCode: z.string().trim().regex(/^[0-9A-Za-z\s-]{4,12}$/, 'Enter a valid postal code'),
  country: z.string().trim().min(2).max(60).default('India'),
  isDefault: z.boolean().default(false),
});

export const updateAddressSchema = addressSchema.partial();

/* ------------------------------------------------------------------ orders */

export const checkoutSchema = z.object({
  contactEmail: z.string().trim().toLowerCase().email().max(200),
  /** Either pick a saved address or send a full one. */
  addressId: cuid.optional(),
  shipping: addressSchema.omit({ isDefault: true }).optional(),
  couponCode: z.string().trim().min(3).max(32).toUpperCase().optional(),
  notes: z.string().trim().max(500).optional(),
  saveAddress: z.boolean().default(false),
});

export const orderQuerySchema = paginationSchema;

export const cancelOrderSchema = z.object({
  reason: z.string().trim().max(300).optional(),
});

export const verifyPaymentSchema = z.object({
  orderId: cuid,
  razorpayOrderId: z.string().trim().min(4).max(120),
  razorpayPaymentId: z.string().trim().min(4).max(120),
  signature: z.string().trim().min(16).max(256),
});

/* ----------------------------------------------------------------- reviews */

export const createReviewSchema = z.object({
  productId: cuid,
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional(),
  body: z.string().trim().min(10, 'Tell us a little more').max(2000),
});

export const updateReviewSchema = createReviewSchema.omit({ productId: true });

export const moderateReviewSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
});

/* ----------------------------------------------------------------- coupons */

export const createCouponSchema = z
  .object({
    code: z.string().trim().min(3).max(32).toUpperCase().regex(/^[A-Z0-9_-]+$/, 'Use letters, numbers, dash or underscore'),
    description: z.string().trim().max(200).optional(),
    discountType: z.enum(['PERCENTAGE', 'FIXED']),
    /** Percent (1-100) for PERCENTAGE coupons, rupees for FIXED ones. */
    value: z.coerce.number().min(1).max(10_000_000),
    minOrderValue: rupees.default(0),
    maxDiscount: rupees.nullable().optional(),
    startsAt: z.coerce.date().nullable().optional(),
    expiresAt: z.coerce.date().nullable().optional(),
    usageLimit: z.coerce.number().int().min(1).max(1_000_000).nullable().optional(),
    perUserLimit: z.coerce.number().int().min(1).max(1000).nullable().optional(),
    active: z.boolean().default(true),
  })
  .transform((value) => ({
    ...value,
    // PERCENTAGE stores whole percent; FIXED stores paise.
    value: value.discountType === 'PERCENTAGE' ? Math.round(value.value) : Math.round(value.value * 100),
  }))
  .refine(
    (value) => value.discountType !== 'PERCENTAGE' || (value.value >= 1 && value.value <= 100),
    { message: 'A percentage discount must be between 1 and 100', path: ['value'] },
  )
  .refine(
    (value) => !value.startsAt || !value.expiresAt || value.startsAt < value.expiresAt,
    { message: 'The end date must come after the start date', path: ['expiresAt'] },
  );

export const updateCouponSchema = createCouponSchema;

/* ------------------------------------------------------------------- admin */

export const adminOrderQuerySchema = paginationSchema.extend({
  status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
  paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional(),
  search: z.string().trim().min(1).max(120).optional(),
});

export const updateOrderStatusSchema = z
  .object({
    status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED']).optional(),
    paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional(),
    notes: z.string().trim().max(500).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, 'Provide something to update');

export const adminCustomerQuerySchema = paginationSchema.extend({
  search: z.string().trim().min(1).max(120).optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED']).optional(),
  role: z.enum(['CUSTOMER', 'ADMIN']).optional(),
});

export const updateCustomerSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED']),
});

export const adminReviewQuerySchema = paginationSchema.extend({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
});
