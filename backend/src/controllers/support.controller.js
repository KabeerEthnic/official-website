import { sendQuietly } from '../lib/email.js';
import { ticketReceived } from '../emails/templates.js';
import { serializeTicket } from '../lib/serialize.js';
import {
  addMessage,
  createTicket,
  getTicket,
  listTicketsForUser,
} from '../services/support.service.js';
import { parse } from '../validators/common.js';
import { createTicketSchema, replySchema, ticketQuerySchema } from '../validators/support.validator.js';

/** Raise an issue. The customer gets an acknowledgement with the reference. */
export async function postTicket(request, reply) {
  const input = parse(createTicketSchema, request.body);
  const ticket = await createTicket({ user: request.user, ...input });

  await sendQuietly(
    { to: request.user.email, ...ticketReceived({ ticket }) },
    request.log,
  );

  return reply.code(201).send({ data: serializeTicket(ticket) });
}

export async function listMyTickets(request, reply) {
  const { page, limit } = parse(ticketQuerySchema, request.query);
  const { items, pagination } = await listTicketsForUser(request.user.id, { page, limit });

  return reply.send({ data: items.map((t) => serializeTicket(t)), meta: { pagination } });
}

export async function getMyTicket(request, reply) {
  const ticket = await getTicket({ id: request.params.id, actor: request.user });
  return reply.send({ data: serializeTicket(ticket) });
}

export async function postMyReply(request, reply) {
  const { body } = parse(replySchema, request.body);
  const ticket = await addMessage({ ticketId: request.params.id, actor: request.user, body });

  return reply.code(201).send({ data: serializeTicket(ticket) });
}
