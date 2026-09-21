import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';

import env from '../config/env.js';
import prisma from '../lib/prisma.js';
import { badRequest, tooManyRequests } from '../lib/errors.js';

/**
 * Emailed one-time codes, used for email verification and password reset.
 *
 * Properties that matter:
 *  - six digits from a cryptographic source, never Math.random
 *  - only an HMAC of the code is stored, so a database dump cannot be replayed
 *  - comparison is constant-time
 *  - a wrong guess counts; OTP_MAX_ATTEMPTS burns the code
 *  - issuing a new code invalidates the previous one for that purpose
 *  - a short cooldown stops the send endpoint being used to spam an inbox
 */
const RESEND_COOLDOWN_SECONDS = 60;

const normalize = (email) => email.trim().toLowerCase();

function hashCode(email, purpose, code) {
  return createHmac('sha256', env.AUTH_SECRET)
    .update(`${normalize(email)}:${purpose}:${code}`)
    .digest('hex');
}

function generateCode() {
  return String(randomInt(0, 1_000_000)).padStart(6, '0');
}

function equal(a, b) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

/**
 * Issues a code and returns it in plain text exactly once, for the caller to
 * email. It is never returned by any route.
 */
export async function issueOtp({ email, purpose }) {
  const address = normalize(email);

  const recent = await prisma.emailOtp.findFirst({
    where: { email: address, purpose, consumedAt: null },
    orderBy: { createdAt: 'desc' },
  });

  if (recent) {
    const age = (Date.now() - recent.createdAt.getTime()) / 1000;
    if (age < RESEND_COOLDOWN_SECONDS) {
      throw tooManyRequests(
        `Please wait ${Math.ceil(RESEND_COOLDOWN_SECONDS - age)} seconds before requesting another code.`,
      );
    }
  }

  const code = generateCode();

  // Supersede anything outstanding, so only the newest code works.
  await prisma.$transaction([
    prisma.emailOtp.updateMany({
      where: { email: address, purpose, consumedAt: null },
      data: { consumedAt: new Date() },
    }),
    prisma.emailOtp.create({
      data: {
        email: address,
        purpose,
        codeHash: hashCode(address, purpose, code),
        expiresAt: new Date(Date.now() + env.OTP_TTL_MINUTES * 60 * 1000),
      },
    }),
  ]);

  return { code, minutes: env.OTP_TTL_MINUTES };
}

/**
 * Checks a submitted code and consumes it on success. Every failure path
 * returns the same message so the response cannot be used to tell "wrong code"
 * from "no code was ever issued".
 */
export async function consumeOtp({ email, purpose, code }) {
  const address = normalize(email);
  const invalid = () => badRequest('That code is not valid or has expired. Request a new one.');

  const record = await prisma.emailOtp.findFirst({
    where: { email: address, purpose, consumedAt: null },
    orderBy: { createdAt: 'desc' },
  });

  if (!record) throw invalid();

  if (record.expiresAt <= new Date()) {
    await prisma.emailOtp.update({ where: { id: record.id }, data: { consumedAt: new Date() } });
    throw invalid();
  }

  if (record.attempts >= env.OTP_MAX_ATTEMPTS) {
    await prisma.emailOtp.update({ where: { id: record.id }, data: { consumedAt: new Date() } });
    throw invalid();
  }

  if (!equal(record.codeHash, hashCode(address, purpose, String(code)))) {
    await prisma.emailOtp.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    throw invalid();
  }

  await prisma.emailOtp.update({ where: { id: record.id }, data: { consumedAt: new Date() } });
  return true;
}

/** Housekeeping: codes that can no longer be used are not worth keeping. */
export function purgeExpiredOtps() {
  return prisma.emailOtp.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { consumedAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      ],
    },
  });
}
