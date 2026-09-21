import { createHmac, timingSafeEqual } from 'node:crypto';

import env from '../config/env.js';
import { serviceUnavailable } from './errors.js';

const API_BASE = 'https://api.razorpay.com/v1';

/**
 * Razorpay is used through its REST API rather than the SDK: the three calls
 * this application needs (create order, read payment, verify signatures) are
 * thin, and a direct fetch keeps the dependency surface small.
 */
function authHeader() {
  if (!env.razorpayEnabled) {
    throw serviceUnavailable('Online payments are not configured on this server');
  }
  const token = Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString('base64');
  return `Basic ${token}`;
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: authHeader(),
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const description = payload?.error?.description ?? 'Payment gateway request failed';
    const error = new Error(description);
    error.statusCode = response.status;
    error.providerCode = payload?.error?.code;
    throw error;
  }

  return payload;
}

/** @param amount in paise. */
export function createRazorpayOrder({ amount, currency = 'INR', receipt, notes }) {
  return request('/orders', {
    method: 'POST',
    body: JSON.stringify({ amount, currency, receipt, notes, payment_capture: 1 }),
  });
}

export function fetchRazorpayPayment(paymentId) {
  return request(`/payments/${encodeURIComponent(paymentId)}`);
}

function safeEquals(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  return left.length === right.length && timingSafeEqual(left, right);
}

/**
 * Checkout handshake signature: HMAC-SHA256("<order_id>|<payment_id>") keyed
 * with the API secret. Proves the browser callback really came from Razorpay.
 */
export function verifyCheckoutSignature({ razorpayOrderId, razorpayPaymentId, signature }) {
  if (!env.razorpayEnabled || !signature) return false;
  const expected = createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');
  return safeEquals(expected, signature);
}

/** Webhook signature is computed over the exact raw request body. */
export function verifyWebhookSignature(rawBody, signature) {
  if (!env.RAZORPAY_WEBHOOK_SECRET || !signature) return false;
  const expected = createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');
  return safeEquals(expected, signature);
}
