import env from '../config/env.js';
import { serializeOrder } from '../lib/serialize.js';
import { handleRazorpayWebhook, startPayment, verifyCheckoutPayment } from '../services/payment.service.js';
import { verifyPaymentSchema } from '../validators/commerce.validator.js';
import { parse } from '../validators/common.js';

/** Lets the storefront hide or explain the online-payment step. */
export async function getPaymentConfig(request, reply) {
  return reply.send({
    data: { provider: 'razorpay', enabled: env.razorpayEnabled, currency: 'INR' },
  });
}

export async function createPaymentSession(request, reply) {
  const session = await startPayment({ orderId: request.params.id, user: request.user });
  return reply.send({ data: session });
}

export async function verifyPayment(request, reply) {
  const input = parse(verifyPaymentSchema, request.body);
  const order = await verifyCheckoutPayment({ ...input, user: request.user });

  return reply.send({ data: serializeOrder(order) });
}

/**
 * Razorpay webhook. Authenticated by HMAC over the raw body, so this route is
 * exempt from the cookie/Origin checks that protect browser endpoints.
 */
export async function razorpayWebhook(request, reply) {
  const result = await handleRazorpayWebhook({
    rawBody: request.rawBody,
    signature: request.headers['x-razorpay-signature'],
    eventId: request.headers['x-razorpay-event-id'],
  });

  return reply.send(result);
}
