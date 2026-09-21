import prisma from '../lib/prisma.js';
import { conflict, forbidden, notFound } from '../lib/errors.js';
import { refreshProductRating } from './product.service.js';

const AUTHOR_SELECT = { select: { id: true, name: true } };

export async function listProductReviews(productId, { page = 1, limit = 10 } = {}) {
  const where = { productId, status: 'APPROVED' };

  const [total, items] = await Promise.all([
    prisma.review.count({ where }),
    prisma.review.findMany({
      where,
      include: { user: AUTHOR_SELECT },
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

/**
 * New reviews land in moderation. Nothing a customer writes is published — or
 * counted towards a rating — until an administrator approves it.
 */
export async function createReview({ userId, productId, rating, title, body }) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, status: true },
  });
  if (!product || product.status !== 'ACTIVE') throw notFound('Product not found');

  const existing = await prisma.review.findUnique({
    where: { userId_productId: { userId, productId } },
    select: { id: true },
  });
  if (existing) throw conflict('You have already reviewed this product');

  return prisma.review.create({
    data: { userId, productId, rating, title: title ?? null, body },
    include: { user: AUTHOR_SELECT },
  });
}

export async function updateOwnReview({ reviewId, userId, rating, title, body }) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw notFound('Review not found');
  if (review.userId !== userId) throw forbidden('This review belongs to someone else');

  const updated = await prisma.review.update({
    where: { id: reviewId },
    // An edited review goes back through moderation.
    data: { rating, title: title ?? null, body, status: 'PENDING' },
    include: { user: AUTHOR_SELECT },
  });

  await refreshProductRating(review.productId);
  return updated;
}

export async function deleteReview({ reviewId, actor }) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw notFound('Review not found');

  if (actor.role !== 'ADMIN' && review.userId !== actor.id) {
    throw forbidden('This review belongs to someone else');
  }

  await prisma.review.delete({ where: { id: reviewId } });
  await refreshProductRating(review.productId);
}

export async function moderateReview({ reviewId, status }) {
  const review = await prisma.review.update({
    where: { id: reviewId },
    data: { status },
    include: { user: AUTHOR_SELECT, product: { select: { id: true, name: true, slug: true } } },
  });

  await refreshProductRating(review.productId);
  return review;
}

export async function listReviewsForAdmin({ status, page = 1, limit = 20 } = {}) {
  const where = status ? { status } : {};

  const [total, items] = await Promise.all([
    prisma.review.count({ where }),
    prisma.review.findMany({
      where,
      include: { user: AUTHOR_SELECT, product: { select: { id: true, name: true, slug: true } } },
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
