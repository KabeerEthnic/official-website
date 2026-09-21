import { conflict, notFound } from '../../lib/errors.js';
import prisma from '../../lib/prisma.js';
import { serializeOrder } from '../../lib/serialize.js';
import { ORDER_INCLUDE, cancelOrder } from '../../services/order.service.js';
import {
  adminOrderQuerySchema,
  cancelOrderSchema,
  updateOrderStatusSchema,
} from '../../validators/commerce.validator.js';
import { parse } from '../../validators/common.js';
import { record } from '../../services/audit.service.js';

const ADMIN_ORDER_INCLUDE = { ...ORDER_INCLUDE, user: true };

export async function listAdminOrders(request, reply) {
  const filters = parse(adminOrderQuerySchema, request.query);

  const where = {
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.paymentStatus ? { paymentStatus: filters.paymentStatus } : {}),
    ...(filters.search
      ? {
          OR: [
            { orderNumber: { contains: filters.search, mode: 'insensitive' } },
            { contactEmail: { contains: filters.search, mode: 'insensitive' } },
            { shippingName: { contains: filters.search, mode: 'insensitive' } },
            { shippingPhone: { contains: filters.search } },
          ],
        }
      : {}),
  };

  const [total, items] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      include: ADMIN_ORDER_INCLUDE,
      orderBy: { createdAt: 'desc' },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    }),
  ]);

  return reply.send({
    data: items.map((order) => serializeOrder(order, { admin: true })),
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

export async function getAdminOrder(request, reply) {
  const order = await prisma.order.findUnique({
    where: { id: request.params.id },
    include: ADMIN_ORDER_INCLUDE,
  });

  if (!order) throw notFound('Order not found');
  return reply.send({ data: serializeOrder(order, { admin: true }) });
}

const FULFILMENT_FLOW = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

export async function patchAdminOrder(request, reply) {
  const input = parse(updateOrderStatusSchema, request.body);

  const order = await prisma.order.findUnique({ where: { id: request.params.id } });
  if (!order) throw notFound('Order not found');
  if (order.status === 'CANCELLED') throw conflict('A cancelled order can no longer be updated');

  if (input.status) {
    // Fulfilment only moves forward; cancelling has its own endpoint because
    // it has to return stock.
    if (FULFILMENT_FLOW.indexOf(input.status) < FULFILMENT_FLOW.indexOf(order.status)) {
      throw conflict(`An order cannot go back from ${order.status} to ${input.status}`);
    }
    if (input.status !== 'PENDING' && order.paymentStatus !== 'PAID' && input.paymentStatus !== 'PAID') {
      throw conflict('Mark the payment as received before moving this order forward');
    }
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      ...(input.status ? { status: input.status } : {}),
      ...(input.paymentStatus ? { paymentStatus: input.paymentStatus } : {}),
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
    },
    include: ADMIN_ORDER_INCLUDE,
  });

  const moves = [
    input.status ? `status ${order.status} to ${input.status}` : null,
    input.paymentStatus ? `payment ${order.paymentStatus} to ${input.paymentStatus}` : null,
  ].filter(Boolean);

  await record(request, {
    action: input.paymentStatus ? 'order.payment_changed' : 'order.status_changed',
    entityType: 'Order',
    entityId: order.id,
    summary: `Order ${order.orderNumber}: ${moves.join(', ') || 'notes updated'}`,
    metadata: {
      status: input.status ? { from: order.status, to: input.status } : undefined,
      paymentStatus: input.paymentStatus
        ? { from: order.paymentStatus, to: input.paymentStatus }
        : undefined,
    },
  });

  return reply.send({ data: serializeOrder(updated, { admin: true }) });
}

export async function postCancelAdminOrder(request, reply) {
  const { reason } = parse(cancelOrderSchema, request.body ?? {});
  const order = await cancelOrder(request.params.id, { actor: request.user, reason });

  await record(request, {
    action: 'order.cancelled',
    entityType: 'Order',
    entityId: order.id,
    summary: `Cancelled order ${order.orderNumber} and returned its stock`,
    metadata: { reason: reason ?? null },
  });

  return reply.send({ data: serializeOrder(order, { admin: true }) });
}
