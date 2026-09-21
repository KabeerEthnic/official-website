import prisma from '../lib/prisma.js';
import { conflict, forbidden, unauthorized } from '../lib/errors.js';
import { hashPassword, verifyPassword } from '../lib/password.js';
import { createToken, hashToken, sessionExpiry } from '../lib/session.js';

const normalizeEmail = (email) => email.trim().toLowerCase();

export async function registerUser({ name, email, password }) {
  const normalized = normalizeEmail(email);

  const existing = await prisma.user.findUnique({ where: { email: normalized }, select: { id: true } });
  if (existing) throw conflict('An account with this email already exists');

  return prisma.user.create({
    data: {
      name: name.trim(),
      email: normalized,
      passwordHash: await hashPassword(password),
    },
  });
}

/**
 * Login always costs one password verification, whether or not the account
 * exists, so response timing does not reveal which emails are registered.
 */
const DUMMY_HASH = await hashPassword('invalid-password-placeholder');

export async function authenticateUser({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email: normalizeEmail(email) } });
  const matches = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);

  if (!user || !matches) throw unauthorized('Incorrect email or password');
  if (user.status !== 'ACTIVE') {
    throw forbidden('This account has been suspended. Contact support for help.');
  }

  return user;
}

export async function createSession(userId, { userAgent, ip } = {}) {
  const token = createToken();

  await prisma.session.create({
    data: {
      tokenHash: hashToken(token),
      userId,
      expiresAt: sessionExpiry(),
      userAgent: userAgent?.slice(0, 255) ?? null,
      ip: ip?.slice(0, 64) ?? null,
    },
  });

  return token;
}

export async function revokeSession(token) {
  if (!token) return;
  await prisma.session.updateMany({
    where: { tokenHash: hashToken(token), revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

/** Used after a password change: every other device is signed out. */
export async function revokeAllSessions(userId, { exceptToken } = {}) {
  await prisma.session.updateMany({
    where: {
      userId,
      revokedAt: null,
      ...(exceptToken ? { NOT: { tokenHash: hashToken(exceptToken) } } : {}),
    },
    data: { revokedAt: new Date() },
  });
}

export async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  if (!(await verifyPassword(currentPassword, user.passwordHash))) {
    throw unauthorized('Your current password is incorrect');
  }

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await hashPassword(newPassword) },
  });
}

/** Housekeeping: drop sessions that can no longer authenticate anyone. */
export function purgeExpiredSessions() {
  return prisma.session.deleteMany({
    where: { OR: [{ expiresAt: { lt: new Date() } }, { revokedAt: { not: null } }] },
  });
}
