import prisma from '../lib/prisma.js';
import { forbidden, unauthorized } from '../lib/errors.js';
import { SESSION_COOKIE, clearCookieOptions, hashToken } from '../lib/session.js';

/**
 * Resolves the session cookie to a user, once per request. Authentication is
 * opt-in per route rather than global so public catalogue reads never pay for
 * a session lookup.
 */
async function resolveUser(request, reply) {
  if (request.authResolved) return request.user;
  request.authResolved = true;
  request.user = null;

  const token = request.cookies?.[SESSION_COOKIE];
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });

  // Unknown, revoked or expired token: drop the cookie so the browser stops
  // sending it.
  if (!session || session.revokedAt || session.expiresAt <= new Date()) {
    reply.clearCookie(SESSION_COOKIE, clearCookieOptions());
    return null;
  }

  request.session = session;
  request.user = session.user;
  return request.user;
}

export async function optionalAuth(request, reply) {
  await resolveUser(request, reply);
}

export async function requireAuth(request, reply) {
  const user = await resolveUser(request, reply);
  if (!user) throw unauthorized();
  if (user.status !== 'ACTIVE') {
    throw forbidden('This account has been suspended. Contact support for help.');
  }
}

export async function requireAdmin(request, reply) {
  await requireAuth(request, reply);
  if (request.user.role !== 'ADMIN') throw forbidden('Administrator access required');
}
