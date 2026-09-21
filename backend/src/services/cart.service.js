import prisma from '../lib/prisma.js';
import { badRequest, conflict, notFound } from '../lib/errors.js';
import { hashToken } from '../lib/session.js';

export const MAX_QUANTITY_PER_ITEM = 10;

const CART_INCLUDE = {
  items: {
    orderBy: { createdAt: 'asc' },
    include: {
      product: {
        include: {
          images: { where: { visible: true }, orderBy: { position: 'asc' }, take: 1 },
          inventory: true,
          category: { select: { slug: true } },
        },
      },
    },
  },
};

/**
 * Finds (or creates) the cart for this request: the signed-in user's cart, or
 * the anonymous cart keyed by the browser's cart cookie.
 */
export async function resolveCart({ userId, cartToken }, { create = true } = {}) {
  if (userId) {
    const existing = await prisma.cart.findUnique({ where: { userId }, include: CART_INCLUDE });
    if (existing) return existing;
    if (!create) return null;
    return prisma.cart.create({ data: { userId }, include: CART_INCLUDE });
  }

  if (!cartToken) return null;

  const sessionToken = hashToken(cartToken);
  const existing = await prisma.cart.findUnique({ where: { sessionToken }, include: CART_INCLUDE });
  if (existing) return existing;
  if (!create) return null;

  return prisma.cart.create({ data: { sessionToken }, include: CART_INCLUDE });
}

function assertPurchasable(product, quantity) {
  if (!product || product.status !== 'ACTIVE') throw notFound('Product not found');

  if (quantity > MAX_QUANTITY_PER_ITEM) {
    throw badRequest(`You can order at most ${MAX_QUANTITY_PER_ITEM} of one item`);
  }

  const available = product.inventory?.quantity ?? 0;
  if (available < quantity) {
    throw conflict(
      available === 0
        ? `${product.name} is out of stock`
        : `Only ${available} left of ${product.name}`,
      { productId: product.id, available },
    );
  }
}

export async function addItem(cart, { productId, quantity }) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { inventory: true },
  });

  const existing = cart.items.find((item) => item.productId === productId);
  const nextQuantity = (existing?.quantity ?? 0) + quantity;

  assertPurchasable(product, nextQuantity);

  await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId } },
    create: { cartId: cart.id, productId, quantity },
    update: { quantity: nextQuantity },
  });

  await prisma.cart.update({ where: { id: cart.id }, data: { updatedAt: new Date() } });
  return prisma.cart.findUnique({ where: { id: cart.id }, include: CART_INCLUDE });
}

export async function updateItem(cart, { itemId, quantity }) {
  const item = cart.items.find((entry) => entry.id === itemId);
  if (!item) throw notFound('That item is not in your cart');

  if (quantity === 0) return removeItem(cart, itemId);

  assertPurchasable(item.product, quantity);

  await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
  await prisma.cart.update({ where: { id: cart.id }, data: { updatedAt: new Date() } });

  return prisma.cart.findUnique({ where: { id: cart.id }, include: CART_INCLUDE });
}

export async function removeItem(cart, itemId) {
  const item = cart.items.find((entry) => entry.id === itemId);
  if (!item) throw notFound('That item is not in your cart');

  await prisma.cartItem.delete({ where: { id: itemId } });
  await prisma.cart.update({ where: { id: cart.id }, data: { updatedAt: new Date() } });

  return prisma.cart.findUnique({ where: { id: cart.id }, include: CART_INCLUDE });
}

export async function clearCart(cartId, tx = prisma) {
  await tx.cartItem.deleteMany({ where: { cartId } });
}

/**
 * On login the anonymous cart is folded into the user's cart: quantities add
 * up, capped by stock and the per-item limit, and the guest cart is dropped.
 */
export async function mergeGuestCart({ userId, cartToken }) {
  if (!cartToken) return;

  const sessionToken = hashToken(cartToken);
  const guestCart = await prisma.cart.findUnique({
    where: { sessionToken },
    include: { items: { include: { product: { include: { inventory: true } } } } },
  });

  if (!guestCart) return;

  if (guestCart.items.length === 0) {
    await prisma.cart.delete({ where: { id: guestCart.id } });
    return;
  }

  await prisma.$transaction(async (tx) => {
    const userCart =
      (await tx.cart.findUnique({ where: { userId } })) ??
      (await tx.cart.create({ data: { userId } }));

    const existingItems = await tx.cartItem.findMany({ where: { cartId: userCart.id } });
    const byProduct = new Map(existingItems.map((item) => [item.productId, item]));

    for (const guestItem of guestCart.items) {
      if (guestItem.product.status !== 'ACTIVE') continue;

      const available = guestItem.product.inventory?.quantity ?? 0;
      if (available <= 0) continue;

      const current = byProduct.get(guestItem.productId)?.quantity ?? 0;
      const quantity = Math.min(current + guestItem.quantity, available, MAX_QUANTITY_PER_ITEM);
      if (quantity <= 0) continue;

      await tx.cartItem.upsert({
        where: { cartId_productId: { cartId: userCart.id, productId: guestItem.productId } },
        create: { cartId: userCart.id, productId: guestItem.productId, quantity },
        update: { quantity },
      });
    }

    await tx.cart.delete({ where: { id: guestCart.id } });
  });
}

/** Rejects a checkout whose cart no longer matches live catalogue state. */
export function validateCartForCheckout(cart) {
  if (!cart || cart.items.length === 0) throw badRequest('Your cart is empty');

  const problems = [];

  for (const item of cart.items) {
    if (item.product.status !== 'ACTIVE') {
      problems.push({ productId: item.productId, name: item.product.name, reason: 'UNAVAILABLE' });
      continue;
    }
    const available = item.product.inventory?.quantity ?? 0;
    if (available < item.quantity) {
      problems.push({
        productId: item.productId,
        name: item.product.name,
        reason: 'INSUFFICIENT_STOCK',
        available,
      });
    }
  }

  if (problems.length > 0) {
    throw conflict('Some items in your cart are no longer available', { items: problems });
  }
}

export { CART_INCLUDE };
