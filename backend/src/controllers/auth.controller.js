import prisma from '../lib/prisma.js';
import { sendQuietly, send } from '../lib/email.js';
import { passwordResetCode, verificationCode } from '../emails/templates.js';
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
  markEmailVerified,
  registerUser,
  resetPassword,
  revokeAllSessions,
  revokeSession,
} from '../services/auth.service.js';
import { mergeGuestCart } from '../services/cart.service.js';
import { consumeOtp, issueOtp } from '../services/otp.service.js';
import {
  changePasswordSchema,
  emailOnlySchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  updateProfileSchema,
  verifyEmailSchema,
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

/**
 * Issues a verification code and emails it. The code is generated server-side
 * and returned to nobody — it only ever leaves through the mail.
 */
async function sendVerificationCode(user) {
  const { code, minutes } = await issueOtp({
    email: user.email,
    purpose: 'EMAIL_VERIFICATION',
  });

  await send({
    to: user.email,
    ...verificationCode({ name: user.name, code, minutes }),
  });

  return minutes;
}

/**
 * Creates the account but does NOT sign the visitor in: the session is only
 * granted once the emailed code has been entered, so every account maps to a
 * reachable address.
 */
export async function register(request, reply) {
  const input = parse(registerSchema, request.body);
  const user = await registerUser(input);

  try {
    const minutes = await sendVerificationCode(user);
    return reply.code(201).send({
      data: { email: user.email, verificationRequired: true, expiresInMinutes: minutes },
    });
  } catch (error) {
    // The account exists but the code never arrived. Remove it so the address
    // is free to try again rather than being stuck in limbo.
    await prisma.user.delete({ where: { id: user.id } }).catch(() => {});
    throw error;
  }
}

/** Re-sends a verification code. Rate limited, and silent about who exists. */
export async function resendVerification(request, reply) {
  const { email } = parse(emailOnlySchema, request.body);
  const user = await prisma.user.findUnique({ where: { email } });

  if (user && !user.emailVerifiedAt) {
    await sendVerificationCode(user);
  }

  return reply.send({
    data: { sent: true },
    meta: { message: 'If that address needs verifying, a new code is on its way.' },
  });
}

/** Confirms the code and signs the customer in, in one step. */
export async function verifyEmail(request, reply) {
  const { email, code } = parse(verifyEmailSchema, request.body);

  await consumeOtp({ email, purpose: 'EMAIL_VERIFICATION', code });
  const user = await markEmailVerified(email);

  await startSession(request, reply, user);

  return reply.send({ data: { user: serializeUser(user) } });
}

/**
 * Starts a password reset. Always answers the same way, so the endpoint cannot
 * be used to find out which addresses have accounts.
 */
export async function forgotPassword(request, reply) {
  const { email } = parse(emailOnlySchema, request.body);
  const user = await prisma.user.findUnique({ where: { email } });

  if (user && user.status === 'ACTIVE') {
    const { code, minutes } = await issueOtp({ email, purpose: 'PASSWORD_RESET' });

    // Best effort: a delivery failure must not change the response, or the
    // difference would itself reveal whether the account exists.
    await sendQuietly(
      { to: user.email, ...passwordResetCode({ name: user.name, code, minutes }) },
      request.log,
    );
  }

  return reply.send({
    data: { sent: true },
    meta: { message: 'If that address has an account, a reset code is on its way.' },
  });
}

/** Completes the reset and signs the customer in on this device only. */
export async function completePasswordReset(request, reply) {
  const { email, code, newPassword } = parse(resetPasswordSchema, request.body);

  await consumeOtp({ email, purpose: 'PASSWORD_RESET', code });
  const user = await resetPassword({ email, newPassword });

  await startSession(request, reply, user);

  return reply.send({ data: { user: serializeUser(user) } });
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
