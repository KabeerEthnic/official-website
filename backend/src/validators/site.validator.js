import { z } from 'zod';

export const updateCurtainSchema = z
  .object({
    enabled: z.boolean().optional(),
    title: z.string().trim().min(1).max(120).optional(),
    message: z.string().trim().max(600).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, 'Nothing to update');
