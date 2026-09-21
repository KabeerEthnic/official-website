import prisma from '../lib/prisma.js';
import { notFound } from '../lib/errors.js';

/** Relations every product response needs, loaded in one query (no N+1). */
export const PRODUCT_INCLUDE = {
  category: { select: { id: true, name: true, slug: true } },
  images: { where: { visible: true }, orderBy: { position: 'asc' } },
  inventory: true,
};

const SORTS = {
  newest: [{ createdAt: 'desc' }],
  oldest: [{ createdAt: 'asc' }],
  price_asc: [{ price: 'asc' }],
  price_desc: [{ price: 'desc' }],
  rating: [{ ratingAvg: 'desc' }, { reviewCount: 'desc' }],
  featured: [{ featured: 'desc' }, { position: 'asc' }, { createdAt: 'desc' }],
};

export function buildProductWhere(filters = {}, { includeUnpublished = false } = {}) {
  const where = {};

  if (!includeUnpublished) where.status = 'ACTIVE';
  else if (filters.status) where.status = filters.status;

  if (filters.category) where.category = { slug: filters.category };
  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.color) where.color = filters.color;
  if (filters.featured !== undefined) where.featured = filters.featured;

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {
      ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}),
      ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {}),
    };
  }

  if (filters.search) {
    const term = filters.search.trim();
    where.OR = [
      { name: { contains: term, mode: 'insensitive' } },
      { subtitle: { contains: term, mode: 'insensitive' } },
      { description: { contains: term, mode: 'insensitive' } },
      { sku: { contains: term, mode: 'insensitive' } },
    ];
  }

  if (filters.inStock) where.inventory = { quantity: { gt: 0 } };

  return where;
}

export async function listProducts(filters = {}, options = {}) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 12;
  const where = buildProductWhere(filters, options);

  // Deliberately not a transaction: these are two independent reads, and
  // Prisma's array form would serialize them behind BEGIN/COMMIT. A count that
  // is a few milliseconds stale is fine for pagination.
  const [total, items] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: PRODUCT_INCLUDE,
      orderBy: SORTS[filters.sort] ?? SORTS.featured,
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return {
    items,
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
}

export async function getProductBySlug(slug, { includeUnpublished = false } = {}) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      ...PRODUCT_INCLUDE,
      images: { where: includeUnpublished ? {} : { visible: true }, orderBy: { position: 'asc' } },
    },
  });

  if (!product || (!includeUnpublished && product.status !== 'ACTIVE')) {
    throw notFound('Product not found');
  }

  return product;
}

export async function getProductById(id, { includeUnpublished = false } = {}) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      ...PRODUCT_INCLUDE,
      images: { where: includeUnpublished ? {} : { visible: true }, orderBy: { position: 'asc' } },
    },
  });

  if (!product || (!includeUnpublished && product.status !== 'ACTIVE')) {
    throw notFound('Product not found');
  }

  return product;
}

/** Same category, excluding the product itself. */
export function listRelatedProducts(product, limit = 4) {
  return prisma.product.findMany({
    where: { status: 'ACTIVE', categoryId: product.categoryId, NOT: { id: product.id } },
    include: PRODUCT_INCLUDE,
    orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    take: limit,
  });
}

/** Distinct colour facet for the shop filters, scoped to what is on sale. */
export async function listColorFacets(categorySlug) {
  const rows = await prisma.product.findMany({
    where: {
      status: 'ACTIVE',
      color: { not: null },
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    },
    select: { color: true },
    distinct: ['color'],
    orderBy: { color: 'asc' },
  });

  return rows.map((row) => row.color);
}

/**
 * Recomputes the denormalised rating on a product. Called whenever an approved
 * review appears or disappears, so product cards never have to aggregate.
 */
export async function refreshProductRating(productId, tx = prisma) {
  const aggregate = await tx.review.aggregate({
    where: { productId, status: 'APPROVED' },
    _avg: { rating: true },
    _count: { _all: true },
  });

  await tx.product.update({
    where: { id: productId },
    data: {
      ratingAvg: Math.round((aggregate._avg.rating ?? 0) * 10) / 10,
      reviewCount: aggregate._count._all,
    },
  });
}
