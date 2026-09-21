import { notFound } from '../lib/errors.js';
import prisma from '../lib/prisma.js';
import { serializeAddress, serializeProduct } from '../lib/serialize.js';
import { PRODUCT_INCLUDE } from '../services/product.service.js';
import { addressSchema, updateAddressSchema } from '../validators/commerce.validator.js';
import { parse } from '../validators/common.js';

/* --------------------------------------------------------------- addresses */

export async function listAddresses(request, reply) {
  const addresses = await prisma.address.findMany({
    where: { userId: request.user.id },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });

  return reply.send({ data: addresses.map(serializeAddress) });
}

/** Exactly one address can be the default, enforced in a transaction. */
async function clearOtherDefaults(tx, userId, exceptId) {
  await tx.address.updateMany({
    where: { userId, isDefault: true, ...(exceptId ? { NOT: { id: exceptId } } : {}) },
    data: { isDefault: false },
  });
}

export async function createAddress(request, reply) {
  const input = parse(addressSchema, request.body);

  const address = await prisma.$transaction(async (tx) => {
    const count = await tx.address.count({ where: { userId: request.user.id } });
    const isDefault = input.isDefault || count === 0;

    if (isDefault) await clearOtherDefaults(tx, request.user.id);

    return tx.address.create({
      data: { ...input, line2: input.line2 || null, isDefault, userId: request.user.id },
    });
  });

  return reply.code(201).send({ data: serializeAddress(address) });
}

export async function updateAddress(request, reply) {
  const input = parse(updateAddressSchema, request.body);
  const existing = await prisma.address.findUnique({ where: { id: request.params.id } });

  if (!existing || existing.userId !== request.user.id) throw notFound('Address not found');

  const address = await prisma.$transaction(async (tx) => {
    if (input.isDefault) await clearOtherDefaults(tx, request.user.id, existing.id);

    return tx.address.update({
      where: { id: existing.id },
      data: { ...input, ...(input.line2 !== undefined ? { line2: input.line2 || null } : {}) },
    });
  });

  return reply.send({ data: serializeAddress(address) });
}

export async function deleteAddress(request, reply) {
  const existing = await prisma.address.findUnique({ where: { id: request.params.id } });
  if (!existing || existing.userId !== request.user.id) throw notFound('Address not found');

  await prisma.address.delete({ where: { id: existing.id } });

  return reply.send({ data: { success: true } });
}

/* ---------------------------------------------------------------- wishlist */

export async function listWishlist(request, reply) {
  const items = await prisma.wishlistItem.findMany({
    where: { userId: request.user.id },
    orderBy: { createdAt: 'desc' },
    include: { product: { include: PRODUCT_INCLUDE } },
  });

  return reply.send({
    data: items
      .filter((item) => item.product.status === 'ACTIVE')
      .map((item) => serializeProduct(item.product)),
  });
}

export async function addToWishlist(request, reply) {
  const productId = String(request.body?.productId ?? '');
  const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true, status: true } });

  if (!product || product.status !== 'ACTIVE') throw notFound('Product not found');

  await prisma.wishlistItem.upsert({
    where: { userId_productId: { userId: request.user.id, productId } },
    create: { userId: request.user.id, productId },
    update: {},
  });

  return reply.code(201).send({ data: { productId, saved: true } });
}

export async function removeFromWishlist(request, reply) {
  await prisma.wishlistItem.deleteMany({
    where: { userId: request.user.id, productId: request.params.productId },
  });

  return reply.send({ data: { productId: request.params.productId, saved: false } });
}
