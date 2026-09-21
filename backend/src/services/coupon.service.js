import prisma from '../lib/prisma.js';
import { badRequest, notFound } from '../lib/errors.js';

const normalizeCode = (code) => code.trim().toUpperCase();

/**
 * Validates a coupon against the live rules and returns the discount in paise.
 * The caller passes the server-computed subtotal — a client-sent total is
 * never accepted anywhere in this flow.
 */
export async function evaluateCoupon({ code, subtotal, userId }, tx = prisma) {
  const coupon = await tx.coupon.findUnique({ where: { code: normalizeCode(code) } });

  if (!coupon || !coupon.active) throw notFound('That coupon code is not valid');

  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) throw badRequest('This coupon is not active yet');
  if (coupon.expiresAt && coupon.expiresAt < now) throw badRequest('This coupon has expired');

  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
    throw badRequest('This coupon has reached its usage limit');
  }

  if (subtotal < coupon.minOrderValue) {
    throw badRequest(
      `Add ${formatPaise(coupon.minOrderValue - subtotal)} more to use this coupon`,
      { minOrderValue: coupon.minOrderValue },
    );
  }

  if (coupon.perUserLimit !== null && userId) {
    const used = await tx.couponRedemption.count({ where: { couponId: coupon.id, userId } });
    if (used >= coupon.perUserLimit) throw badRequest('You have already used this coupon');
  }

  return { coupon, discount: calculateDiscount(coupon, subtotal) };
}

export function calculateDiscount(coupon, subtotal) {
  let discount =
    coupon.discountType === 'PERCENTAGE'
      ? Math.round((subtotal * coupon.value) / 100)
      : coupon.value;

  if (coupon.maxDiscount !== null && coupon.maxDiscount !== undefined) {
    discount = Math.min(discount, coupon.maxDiscount);
  }

  // A coupon can never make an order negative.
  return Math.max(0, Math.min(discount, subtotal));
}

function formatPaise(paise) {
  return `INR ${(paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`;
}
