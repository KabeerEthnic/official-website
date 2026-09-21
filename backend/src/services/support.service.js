import { randomBytes } from 'node:crypto';

import prisma from '../lib/prisma.js';
import { badRequest, forbidden, notFound } from '../lib/errors.js';

/**
 * Customer support conversations. Raised from the storefront's "raise an
 * issue" page, worked from the admin's governance area.
 *
 * A ticket belongs to the customer who raised it, so every read is scoped by
 * userId — an id in the URL is never enough to open someone else's ticket.
 */
const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

const TICKET_INCLUDE = {
  messages: { orderBy: { createdAt: 'asc' } },
  order: { select: { id: true, orderNumber: true, status: true, total: true } },
};

function generateReference() {
  let suffix = '';
  for (const byte of randomBytes(6)) suffix += ALPHABET[byte % ALPHABET.length];
  return `KES-T-${suffix}`;
}

async function nextReference() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = generateReference();
    const taken = await prisma.supportTicket.findUnique({
      where: { reference: candidate },
      select: { id: true },
    });
    if (!taken) return candidate;
  }
  throw badRequest('Could not allocate a reference, please try again');
}

export async function createTicket({ user, category, subject, body, orderId }) {
  // An order can only be attached if it belongs to the person complaining.
  if (orderId) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { userId: true },
    });
    if (!order || order.userId !== user.id) throw notFound('Order not found');
  }

  return prisma.supportTicket.create({
    data: {
      reference: await nextReference(),
      userId: user.id,
      orderId: orderId ?? null,
      category,
      subject,
      messages: {
        create: { authorId: user.id, authorName: user.name, fromStaff: false, body },
      },
    },
    include: TICKET_INCLUDE,
  });
}

export async function listTicketsForUser(userId, { page = 1, limit = 20 } = {}) {
  const where = { userId };

  const [total, items] = await Promise.all([
    prisma.supportTicket.count({ where }),
    prisma.supportTicket.findMany({
      where,
      include: TICKET_INCLUDE,
      orderBy: { lastReplyAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return {
    items,
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
}

export async function getTicket({ id, actor }) {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: { ...TICKET_INCLUDE, user: { select: { id: true, name: true, email: true } } },
  });

  if (!ticket) throw notFound('Issue not found');

  if (actor.role !== 'ADMIN' && ticket.userId !== actor.id) {
    throw forbidden('This issue belongs to someone else');
  }

  return ticket;
}

/**
 * Adds a message. A customer reply reopens a resolved ticket; a staff reply
 * moves it to ANSWERED so the desk can see what is still waiting.
 */
export async function addMessage({ ticketId, actor, body }) {
  const ticket = await getTicket({ id: ticketId, actor });
  const fromStaff = actor.role === 'ADMIN';

  if (ticket.status === 'CLOSED') {
    throw badRequest('This issue is closed. Raise a new one and quote the old reference.');
  }

  await prisma.supportMessage.create({
    data: {
      ticketId,
      authorId: actor.id,
      authorName: fromStaff ? 'Kabeer Support' : actor.name,
      fromStaff,
      body,
    },
  });

  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { lastReplyAt: new Date(), status: fromStaff ? 'ANSWERED' : 'OPEN' },
  });

  return getTicket({ id: ticketId, actor });
}

export async function setTicketStatus({ ticketId, status }) {
  const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
  if (!ticket) throw notFound('Issue not found');

  return prisma.supportTicket.update({
    where: { id: ticketId },
    data: {
      status,
      closedAt: status === 'CLOSED' ? new Date() : null,
    },
    include: TICKET_INCLUDE,
  });
}

export async function listTicketsForAdmin({ status, category, search, page = 1, limit = 20 } = {}) {
  const where = {
    ...(status ? { status } : {}),
    ...(category ? { category } : {}),
    ...(search
      ? {
          OR: [
            { reference: { contains: search, mode: 'insensitive' } },
            { subject: { contains: search, mode: 'insensitive' } },
            { user: { email: { contains: search, mode: 'insensitive' } } },
          ],
        }
      : {}),
  };

  const [total, items, openCount] = await Promise.all([
    prisma.supportTicket.count({ where }),
    prisma.supportTicket.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        order: { select: { id: true, orderNumber: true } },
        _count: { select: { messages: true } },
      },
      // Oldest waiting first: the desk should work the longest-ignored issue.
      orderBy: [{ status: 'asc' }, { lastReplyAt: 'asc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.supportTicket.count({ where: { status: { in: ['OPEN', 'ANSWERED'] } } }),
  ]);

  return {
    items,
    openCount,
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
}

export { TICKET_INCLUDE };
