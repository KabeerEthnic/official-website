import prisma from '../../lib/prisma.js';
import { serializeOrder, serializeProduct } from '../../lib/serialize.js';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Everything the admin landing page shows, in one round trip. All counts are
 * aggregated in the database rather than by loading rows.
 */
export async function getDashboard(request, reply) {
  const since = new Date(Date.now() - 30 * DAY_MS);

  const [
    revenue,
    ordersLast30,
    pendingOrders,
    productCount,
    activeProductCount,
    customerCount,
    pendingReviews,
    subscribers,
    lowStock,
    recentOrders,
  ] = await Promise.all([ // independent reads, issued concurrently
    prisma.order.aggregate({ where: { paymentStatus: 'PAID' }, _sum: { total: true }, _count: { _all: true } }),
    prisma.order.count({ where: { createdAt: { gte: since } } }),
    prisma.order.count({ where: { status: { in: ['PENDING', 'CONFIRMED', 'PROCESSING'] } } }),
    prisma.product.count(),
    prisma.product.count({ where: { status: 'ACTIVE' } }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.review.count({ where: { status: 'PENDING' } }),
    prisma.newsletterSubscriber.count({ where: { unsubscribedAt: null } }),
    prisma.product.findMany({
      where: { status: 'ACTIVE', inventory: { quantity: { lte: 3 } } },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { where: { visible: true }, orderBy: { position: 'asc' }, take: 1 },
        inventory: true,
      },
      orderBy: { name: 'asc' },
      take: 8,
    }),
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { items: true, payments: true, user: true },
    }),
  ]);

  return reply.send({
    data: {
      revenue: { paidTotal: revenue._sum.total ?? 0, paidOrders: revenue._count._all },
      orders: { last30Days: ordersLast30, open: pendingOrders },
      catalogue: { products: productCount, active: activeProductCount },
      customers: { total: customerCount, newsletterSubscribers: subscribers },
      moderation: { pendingReviews },
      lowStock: lowStock.map((product) => serializeProduct(product, { admin: true })),
      recentOrders: recentOrders.map((order) => serializeOrder(order, { admin: true })),
    },
  });
}
