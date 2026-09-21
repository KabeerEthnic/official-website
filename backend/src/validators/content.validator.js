import { z } from 'zod';

import { slug } from './common.js';

export const pageParamsSchema = z.object({ slug });

export const updateSectionSchema = z
  .object({
    /** Validated a second time against the section's registered type. */
    data: z.record(z.any()).optional(),
    visible: z.boolean().optional(),
  })
  .refine((value) => value.data !== undefined || value.visible !== undefined, 'Nothing to update');

export const reorderSectionsSchema = z.object({
  keys: z.array(z.string().trim().min(1).max(60)).min(1).max(30),
});

export const updatePageSchema = z
  .object({
    title: z.string().trim().min(2).max(120).optional(),
    description: z.string().trim().max(300).optional(),
    published: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, 'Nothing to update');
