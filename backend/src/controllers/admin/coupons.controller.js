import { notFound } from '../../lib/errors.js';
import prisma from '../../lib/prisma.js';
import { serializeCoupon } from '../../lib/serialize.js';
import { createCouponSchema, updateCouponSchema } from '../../validators/commerce.validator.js';
import { paginationSchema, parse } from '../../validators/common.js';

export async function listCoupons(request, reply) {
  const { page, limit } = parse(paginationSchema, request.query);

  const [total, items] = await Promise.all([
    prisma.coupon.count(),
    prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return reply.send({
    data: items.map((coupon) => serializeCoupon(coupon, { admin: true })),
    meta: { pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } },
  });
}

export async function postCoupon(request, reply) {
  const input = parse(createCouponSchema, request.body);
  const coupon = await prisma.coupon.create({ data: input });

  return reply.code(201).send({ data: serializeCoupon(coupon, { admin: true }) });
}

export async function patchCoupon(request, reply) {
  const input = parse(updateCouponSchema, request.body);

  const existing = await prisma.coupon.findUnique({ where: { id: request.params.id } });
  if (!existing) throw notFound('Coupon not found');

  const coupon = await prisma.coupon.update({ where: { id: existing.id }, data: input });

  return reply.send({ data: serializeCoupon(coupon, { admin: true }) });
}

export async function deleteCoupon(request, reply) {
  const existing = await prisma.coupon.findUnique({ where: { id: request.params.id } });
  if (!existing) throw notFound('Coupon not found');

  // Redeemed coupons are deactivated instead of deleted so past orders keep
  // their discount trail.
  const redemptions = await prisma.couponRedemption.count({ where: { couponId: existing.id } });

  if (redemptions > 0) {
    const coupon = await prisma.coupon.update({
      where: { id: existing.id },
      data: { active: false },
    });
    return reply.send({
      data: serializeCoupon(coupon, { admin: true }),
      meta: { message: 'This coupon has been used before, so it was deactivated instead.' },
    });
  }

  await prisma.coupon.delete({ where: { id: existing.id } });
  return reply.send({ data: { success: true } });
}
