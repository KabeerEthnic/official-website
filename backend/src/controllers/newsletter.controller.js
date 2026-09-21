import { z } from 'zod';

import prisma from '../lib/prisma.js';
import { parse } from '../validators/common.js';

const subscribeSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
});

/**
 * Stores a storefront sign-up. Re-subscribing an address that unsubscribed
 * clears the flag; an address that is already active is a silent no-op, so the
 * endpoint cannot be used to probe who is on the list.
 */
export async function subscribe(request, reply) {
  const { email } = parse(subscribeSchema, request.body);

  await prisma.newsletterSubscriber.upsert({
    where: { email },
    create: { email },
    update: { unsubscribedAt: null },
  });

  return reply.code(201).send({ data: { subscribed: true } });
}
