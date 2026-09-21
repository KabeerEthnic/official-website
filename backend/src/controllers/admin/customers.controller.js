import { badRequest, notFound } from '../../lib/errors.js';
import prisma from '../../lib/prisma.js';
import { serializeAddress, serializeOrder, serializeUser } from '../../lib/serialize.js';
import { adminCustomerQuerySchema, updateCustomerSchema } from '../../validators/commerce.validator.js';
import { parse } from '../../validators/common.js';

export async function listCustomers(request, reply) {
  const filters = parse(adminCustomerQuerySchema, request.query);

  const where = {
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.role ? { role: filters.role } : {}),
    ...(filters.search
      ? {
          OR: [
            { name: { contains: filters.search, mode: 'insensitive' } },
            { email: { contains: filters.search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [total, items] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
      include: { _count: { select: { orders: true } } },
    }),
  ]);

  return reply.send({
    data: items.map((user) => ({ ...serializeUser(user), orderCount: user._count.orders })),
    meta: {
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / filters.limit)),
      },
    },
  });
}

export async function getCustomer(request, reply) {
  const user = await prisma.user.findUnique({
    where: { id: request.params.id },
    include: {
      addresses: { orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }] },
      orders: { orderBy: { createdAt: 'desc' }, take: 20, include: { items: true, payments: true } },
    },
  });

  if (!user) throw notFound('Customer not found');

  return reply.send({
    data: {
      ...serializeUser(user),
      addresses: user.addresses.map(serializeAddress),
      orders: user.orders.map((order) => serializeOrder(order, { admin: true })),
    },
  });
}

export async function patchCustomer(request, reply) {
  const { status } = parse(updateCustomerSchema, request.body);

  if (request.params.id === request.user.id) {
    throw badRequest('You cannot change the status of your own account');
  }

  const user = await prisma.user.update({ where: { id: request.params.id }, data: { status } });

  // Suspending an account must take effect immediately, not at cookie expiry.
  if (status === 'SUSPENDED') {
    await prisma.session.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  return reply.send({ data: serializeUser(user) });
}
