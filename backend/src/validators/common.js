import { z } from 'zod';

import { AppError } from '../lib/errors.js';

export const cuid = z.string().trim().min(1).max(40);
export const slug = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers and hyphens only');

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(60).default(12),
});

/** Rupee amount from an admin form, stored as paise. */
export const rupees = z
  .coerce.number()
  .min(0)
  .max(10_000_000)
  .transform((value) => Math.round(value * 100));

export const paise = z.coerce.number().int().min(0).max(1_000_000_000);

/**
 * Parses a payload and raises the shared 422 response shape on failure. Used
 * instead of Fastify's JSON-schema validation so one Zod schema can serve the
 * route, the service and the seed.
 */
export function parse(schema, payload) {
  const result = schema.safeParse(payload);
  if (result.success) return result.data;

  throw new AppError(
    422,
    'VALIDATION_ERROR',
    'Some of the submitted values are invalid',
    result.error.issues.map((issue) => ({
      field: issue.path.join('.') || '(root)',
      message: issue.message,
    })),
  );
}
