import prisma from '../lib/prisma.js';
import { serializeUser } from '../lib/serialize.js';
import {
  CART_COOKIE,
  SESSION_COOKIE,
  clearCookieOptions,
  sessionCookieOptions,
} from '../lib/session.js';
import {
  authenticateUser,
  changePassword,
  createSession,
  registerUser,
  revokeAllSessions,
  revokeSession,
} from '../services/auth.service.js';
import { mergeGuestCart } from '../services/cart.service.js';
import {
  changePasswordSchema,
  loginSchema,
  registerSchema,
  updateProfileSchema,
} from '../validators/auth.validator.js';
import { parse } from '../validators/common.js';

async function startSession(request, reply, user) {
  const token = await createSession(user.id, {
    userAgent: request.headers['user-agent'],
    ip: request.ip,
  });

  reply.setCookie(SESSION_COOKIE, token, sessionCookieOptions());

  // Anything the visitor added before signing in follows them into the account.
  const guestCartToken = request.cookies?.[CART_COOKIE];
  if (guestCartToken) {
    await mergeGuestCart({ userId: user.id, cartToken: guestCartToken });
    reply.clearCookie(CART_COOKIE, clearCookieOptions());
  }

  return token;
}

export async function register(request, reply) {
  const input = parse(registerSchema, request.body);
  const user = await registerUser(input);

  await startSession(request, reply, user);

  return reply.code(201).send({ data: { user: serializeUser(user) } });
}

export async function login(request, reply) {
  const input = parse(loginSchema, request.body);
  const user = await authenticateUser(input);

  await startSession(request, reply, user);

  return reply.send({ data: { user: serializeUser(user) } });
}

export async function logout(request, reply) {
  await revokeSession(request.cookies?.[SESSION_COOKIE]);
  reply.clearCookie(SESSION_COOKIE, clearCookieOptions());
  return reply.send({ data: { success: true } });
}

export async function me(request, reply) {
  return reply.send({ data: { user: serializeUser(request.user) } });
}

export async function updateProfile(request, reply) {
  const input = parse(updateProfileSchema, request.body);

  const user = await prisma.user.update({
    where: { id: request.user.id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.phone !== undefined ? { phone: input.phone || null } : {}),
    },
  });

  return reply.send({ data: { user: serializeUser(user) } });
}

export async function updatePassword(request, reply) {
  const input = parse(changePasswordSchema, request.body);

  await changePassword(request.user.id, input);
  // Keep this device signed in, sign every other one out.
  await revokeAllSessions(request.user.id, { exceptToken: request.cookies?.[SESSION_COOKIE] });

  return reply.send({ data: { success: true } });
}
