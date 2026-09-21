import { z } from 'zod';

import { cuid, paginationSchema } from './common.js';

export const auditQuerySchema = paginationSchema.extend({
  /** Matches by prefix, so "product" covers product.updated, product.archived. */
  action: z.string().trim().min(1).max(60).optional(),
  actorId: cuid.optional(),
  search: z.string().trim().min(1).max(120).optional(),
});

export const inviteAdminSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  name: z.string().trim().min(2).max(80).optional(),
});
