import { getCurtain } from '../services/site.service.js';

/** What the storefront needs to decide whether to show the curtain. */
export function serializeCurtain(curtain, { admin = false } = {}) {
  return {
    enabled: curtain.enabled,
    title: curtain.title,
    message: curtain.message,
    since: curtain.droppedAt,
    ...(admin ? { updatedBy: curtain.updatedBy, updatedAt: curtain.updatedAt } : {}),
  };
}

export async function getSiteStatus(request, reply) {
  const curtain = await getCurtain();

  // Lifting the curtain has to reach shoppers straight away, so browsers and
  // CDNs must revalidate; the service's short memory cache absorbs the load.
  reply.header('Cache-Control', 'no-cache');

  return reply.send({ data: { curtain: serializeCurtain(curtain) } });
}
