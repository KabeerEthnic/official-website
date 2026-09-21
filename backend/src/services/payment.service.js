import env from '../config/env.js';
import prisma from '../lib/prisma.js';
import { sendQuietly } from '../lib/email.js';
import { paymentConfirmation } from '../emails/templates.js';
import { badRequest, conflict, forbidden, notFound, serviceUnavailable } from '../lib/errors.js';
import {
  createRazorpayOrder,
  fetchRazorpayPayment,
  verifyCheckoutSignature,
  verifyWebhookSignature,
} from '../lib/razorpay.js';
import { attachProviderOrder, markOrderPaid, markPaymentFailed } from './order.service.js';

/**
 * Opens a Razorpay order for an existing, server-priced order and returns only
 * what the browser checkout widget needs. The amount always comes from the
 * order row — the client cannot influence what is charged.
 */
export async function startPayment({ orderId, user }) {
  if (!env.razorpayEnabled) {
    throw serviceUnavailable('Online payments are not configured on this server');
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payments: { orderBy: { createdAt: 'desc' }, take: 1 } },
  });

  if (!order) throw notFound('Order not found');
  if (order.userId !== user.id) throw forbidden('This order belongs to someone else');
  if (order.paymentStatus === 'PAID') throw conflict('This order has already been paid');
  if (order.status === 'CANCELLED') throw conflict('This order was cancelled');

  const payment = order.payments[0];

  // Reuse the provider order when the customer reopens checkout, so a retry
  // never creates a second charge attempt for the same money.
  let providerOrderId = payment?.providerOrderId ?? null;

  if (!providerOrderId) {
    const created = await createRazorpayOrder({
      amount: order.total,
      currency: order.currency,
      receipt: order.orderNumber,
      notes: { orderId: order.id, orderNumber: order.orderNumber },
    });
    providerOrderId = created.id;
    await attachProviderOrder(order.id, providerOrderId);
  }

  return {
    keyId: env.RAZORPAY_KEY_ID,
    providerOrderId,
    orderId: order.id,
    orderNumber: order.orderNumber,
    amount: order.total,
    currency: order.currency,
    customer: { name: order.shippingName, email: order.contactEmail, contact: order.shippingPhone },
  };
}

/**
 * Sends the payment receipt, once, outside the transaction. Delivery failure is
 * logged and swallowed — a receipt must never undo a completed payment.
 */
async function sendPaymentReceipt({ order, alreadyPaid }, paymentId, logger) {
  if (alreadyPaid) return;

  await sendQuietly(
    { to: order.contactEmail, ...paymentConfirmation({ order, paymentId }) },
    logger,
  );
}

/**
 * Handles the browser's success callback. The signature proves the callback
 * came from Razorpay, and the payment is then re-read from the provider so a
 * forged or replayed callback cannot mark an order paid.
 */
export async function verifyCheckoutPayment({
  orderId,
  razorpayOrderId,
  razorpayPaymentId,
  signature,
  user,
  logger,
}) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payments: { orderBy: { createdAt: 'desc' }, take: 1 } },
  });

  if (!order) throw notFound('Order not found');
  if (order.userId !== user.id) throw forbidden('This order belongs to someone else');
  if (order.paymentStatus === 'PAID') return order;

  const expectedProviderOrderId = order.payments[0]?.providerOrderId;
  if (!expectedProviderOrderId || expectedProviderOrderId !== razorpayOrderId) {
    throw badRequest('Payment reference does not match this order');
  }

  if (!verifyCheckoutSignature({ razorpayOrderId, razorpayPaymentId, signature })) {
    throw badRequest('Payment signature verification failed');
  }

  const providerPayment = await fetchRazorpayPayment(razorpayPaymentId);

  if (providerPayment.order_id !== razorpayOrderId) {
    throw badRequest('Payment does not belong to this order');
  }
  if (!['captured', 'authorized'].includes(providerPayment.status)) {
    throw conflict(`Payment is ${providerPayment.status}`);
  }
  if (providerPayment.amount !== order.total) {
    throw conflict('Captured amount does not match the order total');
  }

  const result = await markOrderPaid(order.id, {
    providerPaymentId: razorpayPaymentId,
    providerOrderId: razorpayOrderId,
    amount: providerPayment.amount,
  });

  await sendPaymentReceipt(result, razorpayPaymentId, logger);

  return result.order;
}

/** Maps a Razorpay order id back to our order via the payment row. */
async function findOrderIdByProviderOrder(providerOrderId) {
  if (!providerOrderId) return null;
  const payment = await prisma.payment.findFirst({
    where: { providerOrderId },
    orderBy: { createdAt: 'desc' },
    select: { orderId: true },
  });
  return payment?.orderId ?? null;
}

/**
 * Webhook entry point. Razorpay retries deliveries, so each event id is
 * recorded once and replays become no-ops.
 */
export async function handleRazorpayWebhook({ rawBody, signature, eventId, logger }) {
  if (!env.RAZORPAY_WEBHOOK_SECRET) {
    throw serviceUnavailable('Webhooks are not configured on this server');
  }

  if (!verifyWebhookSignature(rawBody, signature)) {
    throw badRequest('Invalid webhook signature');
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    throw badRequest('Webhook payload is not valid JSON');
  }

  const dedupeKey = eventId ?? `${event.event}:${event.payload?.payment?.entity?.id ?? ''}`;

  try {
    await prisma.webhookEvent.create({
      data: { provider: 'razorpay', eventId: dedupeKey, eventType: event.event ?? 'unknown' },
    });
  } catch (error) {
    // Unique violation: this delivery has already been processed.
    if (error.code === 'P2002') return { status: 'duplicate' };
    throw error;
  }

  const entity = event.payload?.payment?.entity ?? null;
  const orderId =
    entity?.notes?.orderId ?? (await findOrderIdByProviderOrder(entity?.order_id ?? event.payload?.order?.entity?.id));

  if (orderId) {
    switch (event.event) {
      case 'payment.captured':
      case 'order.paid': {
        const result = await markOrderPaid(orderId, {
          providerPaymentId: entity?.id,
          providerOrderId: entity?.order_id,
          amount: entity?.amount,
        });
        await sendPaymentReceipt(result, entity?.id, logger);
        break;
      }

      case 'payment.failed':
        await markPaymentFailed(orderId, {
          providerPaymentId: entity?.id,
          reason: entity?.error_description ?? entity?.error_reason ?? 'Payment failed',
        });
        break;

      default:
        break;
    }
  }

  await prisma.webhookEvent.updateMany({
    where: { provider: 'razorpay', eventId: dedupeKey },
    data: { processedAt: new Date() },
  });

  return { status: 'processed', event: event.event, orderId };
}
