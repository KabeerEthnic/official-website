import prisma from '../lib/prisma.js';

/**
 * Append-only record of administrator actions.
 *
 * Nothing in this application updates or deletes an AuditLog row — that is the
 * whole point. `actorEmail` is a snapshot so the trail stays readable even
 * after the account is removed, which is exactly when you most want to read it.
 *
 * Recording must never break the action it describes: a failure here is logged
 * and swallowed, because refusing a legitimate price change because the audit
 * write failed would be worse than the missing line.
 */
export async function record(request, { action, entityType, entityId, summary, metadata }) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: request.user?.id ?? null,
        actorEmail: request.user?.email ?? 'system',
        action,
        entityType,
        entityId: entityId ?? null,
        summary,
        metadata: metadata ?? undefined,
        ip: request.ip?.slice(0, 64) ?? null,
      },
    });
  } catch (error) {
    request.log?.error({ err: error, action }, 'Failed to write audit log entry');
  }
}

/**
 * Compares two objects and returns only what changed, as { before, after }.
 * Keeps entries small and readable instead of dumping whole records.
 */
export function diff(before, after, fields) {
  const changed = {};

  for (const field of fields) {
    const from = before?.[field];
    const to = after?.[field];
    if (from === to) continue;
    if (from instanceof Date && to instanceof Date && from.getTime() === to.getTime()) continue;
    changed[field] = { from: from ?? null, to: to ?? null };
  }

  return Object.keys(changed).length > 0 ? changed : null;
}

export async function listAuditLog({ page = 1, limit = 50, action, actorId, search } = {}) {
  const where = {
    ...(action ? { action: { startsWith: action } } : {}),
    ...(actorId ? { actorId } : {}),
    ...(search
      ? {
          OR: [
            { summary: { contains: search, mode: 'insensitive' } },
            { actorEmail: { contains: search, mode: 'insensitive' } },
            { entityId: { contains: search } },
          ],
        }
      : {}),
  };

  const [total, items] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return {
    items,
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
}

/** The distinct action names present, so the admin can offer a real filter. */
export async function listAuditActions() {
  const rows = await prisma.auditLog.findMany({
    select: { action: true },
    distinct: ['action'],
    orderBy: { action: 'asc' },
  });

  return rows.map((row) => row.action);
}
