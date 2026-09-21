import { z } from 'zod';

import { cuid, paginationSchema, rupees, slug } from './common.js';

export const productQuerySchema = paginationSchema.extend({
  category: slug.optional(),
  color: z.string().trim().max(40).optional(),
  search: z.string().trim().min(1).max(120).optional(),
  minPrice: rupees.optional(),
  maxPrice: rupees.optional(),
  sort: z.enum(['newest', 'oldest', 'price_asc', 'price_desc', 'rating', 'featured']).default('featured'),
  featured: z.enum(['true', 'false']).transform((v) => v === 'true').optional(),
  inStock: z.enum(['true', 'false']).transform((v) => v === 'true').optional(),
});

export const adminProductQuerySchema = productQuerySchema.extend({
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).optional(),
});

const detailRow = z.object({
  name: z.string().trim().min(1).max(60),
  value: z.string().trim().min(1).max(200),
});

const imageInput = z.object({
  url: z.string().trim().url().max(2048),
  storagePath: z.string().trim().max(400).optional(),
  altText: z.string().trim().max(200).optional(),
  position: z.coerce.number().int().min(0).max(50).optional(),
});

const inventoryInput = z.object({
  quantity: z.coerce.number().int().min(0).max(1_000_000).optional(),
  capacity: z.coerce.number().int().min(0).max(1_000_000).optional(),
  lowStockThreshold: z.coerce.number().int().min(0).max(10_000).optional(),
});

export const createProductSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: slug.optional(),
  subtitle: z.string().trim().max(160).optional(),
  description: z.string().trim().min(10).max(5000),
  sku: z.string().trim().min(2).max(64).regex(/^[A-Za-z0-9._-]+$/, 'Use letters, numbers, dot, dash or underscore'),
  price: rupees,
  salePrice: rupees.nullable().optional(),
  categoryId: cuid,
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).default('DRAFT'),
  color: z.string().trim().max(40).optional(),
  tag: z.string().trim().max(40).optional(),
  details: z.array(detailRow).max(20).default([]),
  featured: z.boolean().default(false),
  position: z.coerce.number().int().min(0).max(10_000).default(0),
  inventory: inventoryInput.optional(),
  images: z.array(imageInput).max(12).optional(),
});

export const updateProductSchema = createProductSchema.partial().extend({
  images: z.undefined().optional(),
});

export const setStockSchema = inventoryInput.refine(
  (value) => Object.keys(value).length > 0,
  'Provide at least one inventory field',
);

export const productImagesSchema = z.object({
  images: z.array(imageInput).min(1).max(12),
});

export const reorderSchema = z.object({
  ids: z.array(cuid).min(1).max(50),
});

export const categoryQuerySchema = z.object({
  includeHidden: z.enum(['true', 'false']).transform((v) => v === 'true').optional(),
});

export const createCategorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: slug.optional(),
  headline: z.string().trim().max(80).optional().or(z.literal('')),
  description: z.string().trim().max(500).optional(),
  imageUrl: z.string().trim().url().max(2048).optional().or(z.literal('')),
  position: z.coerce.number().int().min(0).max(1000).default(0),
  visible: z.boolean().default(true),
});

export const updateCategorySchema = createCategorySchema.partial();
