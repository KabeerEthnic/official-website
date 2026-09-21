import { randomBytes } from 'node:crypto';

import env from '../config/env.js';
import prisma from '../lib/prisma.js';
import { badRequest, conflict, forbidden, notFound } from '../lib/errors.js';
import { percentOf } from '../lib/money.js';
import { evaluateCoupon } from './coupon.service.js';

export const ORDER_INCLUDE = {
  items: { orderBy: { id: 'asc' } },
  payments: { orderBy: { createdAt: 'desc' } },
};

const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

/** Human-quotable reference, e.g. KAB-7K2M19. */
function generateOrderNumber() {
  const bytes = randomBytes(6);
  let suffix = '';
  for (const byte of bytes) suffix += ALPHABET[byte % ALPHABET.length];
  return `KAB-${suffix}`;
}

/**
 * Picks a free order number. The unique constraint is the real guarantee; this
 * loop just keeps a one-in-a-billion collision from failing a checkout.
 */
async function nextOrderNumber(tx) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = generateOrderNumber();
    const taken = await tx.order.findUnique({
      where: { orderNumber: candidate },
      select: { id: true },
    });
    if (!taken) return candidate;
  }
  throw conflict('Could not allocate an order number, please try again');
}

/**
 * The authoritative price calculation. Every number comes from the database:
 * unit prices from the product rows, the discount from the coupon rules, tax
 * and shipping from server configuration. Nothing the client sends is used.
 */
export function priceOrder({ items, discount = 0 }) {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const discountable = Math.max(0, subtotal - discount);

  const shipping =
    env.SHIPPING_FLAT > 0 &&
    (env.FREE_SHIPPING_THRESHOLD === 0 || discountable < env.FREE_SHIPPING_THRESHOLD)
      ? env.SHIPPING_FLAT
      : 0;

  const tax = percentOf(discountable, env.TAX_PERCENT);

  return { subtotal, discount, shipping, tax, total: discountable + shipping + tax };
}

/** Line items priced from the catalogue, with a snapshot of what was bought. */
function buildLineItems(cartItems) {
  return cartItems.map((item) => {
    const product = item.product;
    const unitPrice = product.salePrice ?? product.price;

    return {
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      productSlug: product.slug,
      imageUrl: product.images?.[0]?.url ?? null,
      unitPrice,
      quantity: item.quantity,
      lineTotal: unitPrice * item.quantity,
    };
  });
}

/**
 * Quote for the checkout screen. Same maths as the real order, but nothing is
 * written and no stock is held.
 */
export async function quoteCart(cart, { couponCode, userId } = {}) {
  const items = buildLineItems(cart.items);
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

  let discount = 0;
  let appliedCoupon = null;

  if (couponCode) {
    const result = await evaluateCoupon({ code: couponCode, subtotal, userId });
    discount = result.discount;
    appliedCoupon = result.coupon;
  }

  return {
    ...priceOrder({ items, discount }),
    currency: 'INR',
    couponCode: appliedCoupon?.code ?? null,
    items,
  };
}

/**
 * Creates an order inside a single transaction:
 * validate -> price server-side -> reserve stock -> write order, items and
 * payment -> redeem coupon -> empty the cart. A failure at any step rolls the
 * whole thing back, so stock and orders can never drift apart.
 */
export async function createOrder({ user, cart, shipping, contactEmail, couponCode, notes }) {
  if (!cart || cart.items.length === 0) throw badRequest('Your cart is empty');

  return prisma.$transaction(async (tx) => {
    // Re-read the catalogue inside the transaction: the cart snapshot the
    // request was built from may be seconds old.
    const productIds = cart.items.map((item) => item.productId);
    const products = await tx.product.findMany({
      where: { id: { in: productIds } },
      include: { images: { where: { visible: true }, orderBy: { position: 'asc' }, take: 1 } },
    });
    const byId = new Map(products.map((product) => [product.id, product]));

    const cartItems = cart.items.map((item) => {
      const product = byId.get(item.productId);
      if (!product || product.status !== 'ACTIVE') {
        throw conflict(`${item.product?.name ?? 'An item'} is no longer available`);
      }
      return { product, quantity: item.quantity };
    });

    const items = buildLineItems(cartItems);
    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

    let discount = 0;
    let coupon = null;
    if (couponCode) {
      const evaluated = await evaluateCoupon({ code: couponCode, subtotal, userId: user.id }, tx);
      discount = evaluated.discount;
      coupon = evaluated.coupon;
    }

    const totals = priceOrder({ items, discount });

    // Conditional decrement: PostgreSQL re-checks the predicate against the
    // locked row, so two concurrent checkouts can never oversell the last
    // piece — the loser gets zero rows updated and the transaction aborts.
    for (const item of items) {
      const updated = await tx.inventory.updateMany({
        where: { productId: item.productId, quantity: { gte: item.quantity } },
        data: { quantity: { decrement: item.quantity }, reserved: { increment: item.quantity } },
      });

      if (updated.count !== 1) {
        const current = await tx.inventory.findUnique({ where: { productId: item.productId } });
        throw conflict(`${item.productName} does not have enough stock left`, {
          productId: item.productId,
          available: Math.max(0, current?.quantity ?? 0),
        });
      }
    }

    const order = await tx.order.create({
      data: {
        orderNumber: await nextOrderNumber(tx),
        userId: user.id,
        subtotal: totals.subtotal,
        discount: totals.discount,
        shipping: totals.shipping,
        tax: totals.tax,
        total: totals.total,
        couponCode: coupon?.code ?? null,
        contactEmail,
        shippingName: shipping.name,
        shippingPhone: shipping.phone,
        shippingLine1: shipping.line1,
        shippingLine2: shipping.line2 ?? null,
        shippingCity: shipping.city,
        shippingState: shipping.state,
        shippingPostalCode: shipping.postalCode,
        shippingCountry: shipping.country ?? 'India',
        notes: notes ?? null,
        items: { create: items },
        payments: {
          create: { provider: 'razorpay', amount: totals.total, currency: 'INR', status: 'PENDING' },
        },
      },
      include: ORDER_INCLUDE,
    });

    if (coupon) {
      await tx.couponRedemption.create({
        data: { couponId: coupon.id, userId: user.id, orderId: order.id },
      });
      await tx.coupon.update({
        where: { id: coupon.id },
        data: { usageCount: { increment: 1 } },
      });
    }

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return order;
  });
}

/**
 * Moves reserved stock out of reservation. `sold` consumes it; `restock`
 * returns it to the sellable pool. The inventorySettledAt marker makes both
 * safe to call twice — webhooks retry, and customers double-click.
 */
async function settleInventory(tx, orderId, mode) {
  const claimed = await tx.order.updateMany({
    where: { id: orderId, inventorySettledAt: null },
    data: { inventorySettledAt: new Date() },
  });

  if (claimed.count !== 1) return false;

  const items = await tx.orderItem.findMany({ where: { orderId } });

  for (const item of items) {
    if (!item.productId) continue;

    await tx.inventory.updateMany({
      where: { productId: item.productId },
      data:
        mode === 'sold'
          ? { reserved: { decrement: item.quantity } }
          : { reserved: { decrement: item.quantity }, quantity: { increment: item.quantity } },
    });
  }

  return true;
}

/**
 * Confirms a paid order. Idempotent: a repeated webhook or a second verify
 * call finds the order already paid and changes nothing.
 */
export async function markOrderPaid(orderId, { providerPaymentId, providerOrderId, amount }) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId }, include: ORDER_INCLUDE });
    if (!order) throw notFound('Order not found');

    // Already settled by the other path (browser callback vs webhook, or a
    // webhook retry). Reporting that keeps the receipt exactly-once.
    if (order.paymentStatus === 'PAID') return { order, alreadyPaid: true };

    if (amount !== undefined && amount !== order.total) {
      throw conflict('Captured amount does not match the order total');
    }

    const payment = order.payments[0];
    if (payment) {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'PAID',
          providerPaymentId: providerPaymentId ?? payment.providerPaymentId,
          providerOrderId: providerOrderId ?? payment.providerOrderId,
        },
      });
    }

    await settleInventory(tx, orderId, 'sold');

    const updated = await tx.order.update({
      where: { id: orderId },
      data: { paymentStatus: 'PAID', status: 'CONFIRMED' },
      include: ORDER_INCLUDE,
    });

    return { order: updated, alreadyPaid: false };
  });
}

export async function markPaymentFailed(orderId, { providerPaymentId, reason }) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId }, include: ORDER_INCLUDE });
    if (!order || order.paymentStatus === 'PAID') return order;

    const payment = order.payments[0];
    if (payment) {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          failureReason: reason?.slice(0, 500) ?? null,
          providerPaymentId: providerPaymentId ?? payment.providerPaymentId,
        },
      });
    }

    // The order stays PENDING so the customer can retry with the reservation
    // still held; the expiry sweep releases it if they never come back.
    return order;
  });
}

export async function attachProviderOrder(orderId, providerOrderId) {
  const payment = await prisma.payment.findFirst({
    where: { orderId },
    orderBy: { createdAt: 'desc' },
  });
  if (!payment) return;
  await prisma.payment.update({ where: { id: payment.id }, data: { providerOrderId } });
}

const CUSTOMER_CANCELLABLE = new Set(['PENDING', 'CONFIRMED']);
const ADMIN_CANCELLABLE = new Set(['PENDING', 'CONFIRMED', 'PROCESSING']);

export async function cancelOrder(orderId, { actor, reason }) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order) throw notFound('Order not found');

    const isAdmin = actor.role === 'ADMIN';
    if (!isAdmin && order.userId !== actor.id) throw forbidden('This order belongs to someone else');

    const allowed = isAdmin ? ADMIN_CANCELLABLE : CUSTOMER_CANCELLABLE;
    if (!allowed.has(order.status)) {
      throw conflict(`An order that is ${order.status.toLowerCase()} can no longer be cancelled`);
    }
    if (!isAdmin && order.paymentStatus === 'PAID') {
      throw conflict('This order is already paid. Contact support to arrange a return.');
    }

    await settleInventory(tx, orderId, 'restock');

    if (order.couponCode) {
      await tx.coupon.updateMany({
        where: { code: order.couponCode, usageCount: { gt: 0 } },
        data: { usageCount: { decrement: 1 } },
      });
      await tx.couponRedemption.deleteMany({ where: { orderId } });
    }

    return tx.order.update({
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelReason: reason?.slice(0, 500) ?? null,
      },
      include: ORDER_INCLUDE,
    });
  });
}

/**
 * Releases stock held by checkouts that were never paid. Run periodically so
 * an abandoned Razorpay window does not keep a limited piece off the shelf.
 */
export async function releaseExpiredReservations(logger) {
  const cutoff = new Date(Date.now() - env.ORDER_RESERVATION_MINUTES * 60 * 1000);

  const stale = await prisma.order.findMany({
    where: {
      status: 'PENDING',
      paymentStatus: 'PENDING',
      inventorySettledAt: null,
      createdAt: { lt: cutoff },
    },
    select: { id: true, orderNumber: true },
    take: 100,
  });

  for (const order of stale) {
    try {
      await prisma.$transaction(async (tx) => {
        await settleInventory(tx, order.id, 'restock');
        await tx.order.update({
          where: { id: order.id },
          data: {
            status: 'CANCELLED',
            cancelledAt: new Date(),
            cancelReason: 'Payment was not completed in time',
          },
        });
      });
    } catch (error) {
      logger?.error({ err: error, orderId: order.id }, 'Failed to release an expired reservation');
    }
  }

  return stale.length;
}

export async function getOrderForUser(orderId, userId) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: ORDER_INCLUDE });
  if (!order || order.userId !== userId) throw notFound('Order not found');
  return order;
}

export async function listOrdersForUser(userId, { page = 1, limit = 10 } = {}) {
  const [total, items] = await Promise.all([
    prisma.order.count({ where: { userId } }),
    prisma.order.findMany({
      where: { userId },
      include: ORDER_INCLUDE,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return {
    items,
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
}
