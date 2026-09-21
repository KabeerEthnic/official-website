import { serializeCartItem } from '../lib/serialize.js';
import { requestCart } from '../middleware/cartContext.js';
import { addItem, removeItem, updateItem } from '../services/cart.service.js';
import { quoteCart } from '../services/order.service.js';
import { addToCartSchema, updateCartItemSchema } from '../validators/commerce.validator.js';
import { parse } from '../validators/common.js';

function emptyCart() {
  return {
    items: [],
    totals: { subtotal: 0, discount: 0, shipping: 0, tax: 0, total: 0, currency: 'INR' },
    itemCount: 0,
  };
}

/** One cart shape for every endpoint, totals always computed server-side. */
async function presentCart(cart, { couponCode, userId } = {}) {
  if (!cart || cart.items.length === 0) return emptyCart();

  const quote = await quoteCart(cart, { couponCode, userId });

  return {
    items: cart.items.map(serializeCartItem),
    totals: {
      subtotal: quote.subtotal,
      discount: quote.discount,
      shipping: quote.shipping,
      tax: quote.tax,
      total: quote.total,
      currency: quote.currency,
    },
    couponCode: quote.couponCode,
    itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
  };
}

export async function getCart(request, reply) {
  const cart = await requestCart(request, reply, { create: false });
  return reply.send({ data: await presentCart(cart, { userId: request.user?.id }) });
}

export async function addToCart(request, reply) {
  const input = parse(addToCartSchema, request.body);
  const cart = await requestCart(request, reply);
  const updated = await addItem(cart, input);

  return reply.code(201).send({ data: await presentCart(updated, { userId: request.user?.id }) });
}

export async function updateCartItem(request, reply) {
  const { quantity } = parse(updateCartItemSchema, request.body);
  const cart = await requestCart(request, reply);
  const updated = await updateItem(cart, { itemId: request.params.itemId, quantity });

  return reply.send({ data: await presentCart(updated, { userId: request.user?.id }) });
}

export async function removeCartItem(request, reply) {
  const cart = await requestCart(request, reply);
  const updated = await removeItem(cart, request.params.itemId);

  return reply.send({ data: await presentCart(updated, { userId: request.user?.id }) });
}

/**
 * Re-prices the cart with a coupon applied. Nothing is stored: the discount is
 * recalculated from scratch when the order is actually created.
 */
export async function previewCoupon(request, reply) {
  const cart = await requestCart(request, reply, { create: false });
  const code = String(request.query?.code ?? '').trim();

  return reply.send({
    data: await presentCart(cart, { couponCode: code || undefined, userId: request.user?.id }),
  });
}
