import { badRequest, notFound } from '../lib/errors.js';
import prisma from '../lib/prisma.js';
import { serializeOrder } from '../lib/serialize.js';
import { requestCart } from '../middleware/cartContext.js';
import { validateCartForCheckout } from '../services/cart.service.js';
import {
  cancelOrder,
  createOrder,
  getOrderForUser,
  listOrdersForUser,
} from '../services/order.service.js';
import { cancelOrderSchema, checkoutSchema, orderQuerySchema } from '../validators/commerce.validator.js';
import { parse } from '../validators/common.js';

/** Shipping details come from a saved address or from the checkout form. */
async function resolveShipping(userId, input) {
  if (input.addressId) {
    const address = await prisma.address.findUnique({ where: { id: input.addressId } });
    if (!address || address.userId !== userId) throw notFound('Address not found');
    return address;
  }

  if (!input.shipping) throw badRequest('A shipping address is required');
  return input.shipping;
}

export async function checkout(request, reply) {
  const input = parse(checkoutSchema, request.body);

  const cart = await requestCart(request, reply, { create: false });
  validateCartForCheckout(cart);

  const shipping = await resolveShipping(request.user.id, input);

  const order = await createOrder({
    user: request.user,
    cart,
    shipping,
    contactEmail: input.contactEmail,
    couponCode: input.couponCode,
    notes: input.notes,
  });

  if (input.saveAddress && !input.addressId && input.shipping) {
    const duplicate = await prisma.address.findFirst({
      where: {
        userId: request.user.id,
        line1: input.shipping.line1,
        postalCode: input.shipping.postalCode,
        city: input.shipping.city,
      },
      select: { id: true },
    });

    if (!duplicate) {
      await prisma.address.create({ data: { ...input.shipping, userId: request.user.id } });
    }
  }

  return reply.code(201).send({ data: serializeOrder(order) });
}

export async function listMyOrders(request, reply) {
  const { page, limit } = parse(orderQuerySchema, request.query);
  const { items, pagination } = await listOrdersForUser(request.user.id, { page, limit });

  return reply.send({
    data: items.map((order) => serializeOrder(order)),
    meta: { pagination },
  });
}

export async function getMyOrder(request, reply) {
  const order = await getOrderForUser(request.params.id, request.user.id);
  return reply.send({ data: serializeOrder(order) });
}

export async function cancelMyOrder(request, reply) {
  const { reason } = parse(cancelOrderSchema, request.body ?? {});
  const order = await cancelOrder(request.params.id, { actor: request.user, reason });

  return reply.send({ data: serializeOrder(order) });
}
