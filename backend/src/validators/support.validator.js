import { z } from 'zod';

import { cuid, paginationSchema } from './common.js';

const CATEGORIES = ['ORDER', 'PAYMENT', 'DELIVERY', 'PRODUCT', 'ACCOUNT', 'OTHER'];
const STATUSES = ['OPEN', 'ANSWERED', 'RESOLVED', 'CLOSED'];

export const createTicketSchema = z.object({
  category: z.enum(CATEGORIES).default('OTHER'),
  subject: z.string().trim().min(4, 'Give your issue a short title').max(140),
  body: z.string().trim().min(15, 'Tell us a little more so we can help').max(4000),
  orderId: cuid.optional(),
});

export const replySchema = z.object({
  body: z.string().trim().min(1).max(4000),
});

export const ticketQuerySchema = paginationSchema;

export const adminTicketQuerySchema = paginationSchema.extend({
  status: z.enum(STATUSES).optional(),
  category: z.enum(CATEGORIES).optional(),
  search: z.string().trim().min(1).max(120).optional(),
});

export const ticketStatusSchema = z.object({
  status: z.enum(STATUSES),
});

export { CATEGORIES as TICKET_CATEGORIES, STATUSES as TICKET_STATUSES };
