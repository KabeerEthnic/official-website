import env from '../config/env.js';
import { serviceUnavailable } from './errors.js';

const API = 'https://api.resend.com/emails';

/**
 * Resend over its REST API. Like Razorpay and Supabase Storage, this is one
 * endpoint with a bearer token, so a direct fetch avoids an SDK dependency.
 *
 * Two ways to send:
 *   send()        throws — for mail the user is waiting on (OTP codes)
 *   sendQuietly() logs and continues — for mail that must never fail the
 *                 operation that triggered it (order and payment receipts)
 */
export async function send({ to, subject, html, text, replyTo }) {
  if (!env.emailEnabled) {
    throw serviceUnavailable('Email is not configured on this server');
  }

  const response = await fetch(API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: [to],
      subject,
      html,
      text,
      ...(replyTo ?? env.EMAIL_REPLY_TO ? { reply_to: replyTo ?? env.EMAIL_REPLY_TO } : {}),
    }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const detail = payload?.message ?? `HTTP ${response.status}`;
    const error = new Error(`Email delivery failed: ${detail}`);
    error.statusCode = response.status;
    // Resend's own message can name the recipient; keep it out of the response.
    error.expose = false;
    throw error;
  }

  return { id: payload?.id ?? null };
}

/**
 * Best-effort delivery. A receipt that fails to send must not roll back a paid
 * order, so the failure is logged and swallowed.
 */
export async function sendQuietly(message, logger) {
  if (!env.emailEnabled) {
    logger?.warn({ subject: message.subject }, 'Email not configured; skipping delivery');
    return { skipped: true };
  }

  try {
    return await send(message);
  } catch (error) {
    logger?.error({ err: error, subject: message.subject }, 'Email delivery failed');
    return { failed: true };
  }
}
