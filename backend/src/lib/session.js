import { createHmac, randomBytes } from 'node:crypto';

import env from '../config/env.js';

export const SESSION_COOKIE = 'kes_session';
export const CART_COOKIE = 'kes_cart';

const SESSION_TTL_MS = env.SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;
const CART_TTL_MS = 90 * 24 * 60 * 60 * 1000;

/** Opaque, unguessable token handed to the browser. */
export function createToken() {
  return randomBytes(32).toString('base64url');
}

/**
 * Tokens are stored keyed by their HMAC, never in the clear: a database dump
 * cannot be replayed as a login, and rotating AUTH_SECRET invalidates every
 * outstanding session.
 */
export function hashToken(token) {
  return createHmac('sha256', env.AUTH_SECRET).update(token).digest('hex');
}

function baseCookieOptions(maxAgeMs) {
  return {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: env.COOKIE_SAMESITE,
    path: '/',
    maxAge: Math.floor(maxAgeMs / 1000),
    ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
  };
}

export const sessionCookieOptions = () => baseCookieOptions(SESSION_TTL_MS);
export const cartCookieOptions = () => baseCookieOptions(CART_TTL_MS);

export const sessionExpiry = () => new Date(Date.now() + SESSION_TTL_MS);

export function clearCookieOptions() {
  return {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: env.COOKIE_SAMESITE,
    path: '/',
    ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
  };
}
