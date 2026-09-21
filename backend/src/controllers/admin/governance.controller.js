import { badRequest, conflict, notFound } from '../../lib/errors.js';
import prisma from '../../lib/prisma.js';
import { sendQuietly } from '../../lib/email.js';
import { ticketReply, verificationCode } from '../../emails/templates.js';
import { serializeAuditEntry, serializeTicket, serializeUser } from '../../lib/serialize.js';
import { listAuditActions, listAuditLog, record } from '../../services/audit.service.js';
import { issueOtp } from '../../services/otp.service.js';
import {
  addMessage,
  getTicket,
  listTicketsForAdmin,
  setTicketStatus,
} from '../../services/support.service.js';
import { paginationSchema, parse } from '../../validators/common.js';
import {
  adminTicketQuerySchema,
  replySchema,
  ticketStatusSchema,
} from '../../validators/support.validator.js';
import {
  auditQuerySchema,
  inviteAdminSchema,
} from '../../validators/governance.validator.js';

/* ------------------------------------------------------------- issue desk */

export async function listTickets(request, reply) {
  const filters = parse(adminTicketQuerySchema, request.query);
  const { items, pagination, openCount } = await listTicketsForAdmin(filters);

  return reply.send({
    data: items.map((ticket) => serializeTicket(ticket, { admin: true })),
    meta: { pagination, openCount },
  });
}

export async function getTicketDetail(request, reply) {
  const ticket = await getTicket({ id: request.params.id, actor: request.user });
  return reply.send({ data: serializeTicket(ticket, { admin: true }) });
}

export async function postReply(request, reply) {
  const { body } = parse(replySchema, request.body);
  const ticket = await addMessage({ ticketId: request.params.id, actor: request.user, body });

  // The customer has no reason to keep checking the site, so tell them.
  await sendQuietly(
    { to: ticket.user.email, ...ticketReply({ ticket, body }) },
    request.log,
  );

  await record(request, {
    action: 'support.replied',
    entityType: 'SupportTicket',
    entityId: ticket.id,
    summary: `Replied to issue ${ticket.reference}`,
  });

  return reply.code(201).send({ data: serializeTicket(ticket, { admin: true }) });
}

export async function patchTicketStatus(request, reply) {
  const { status } = parse(ticketStatusSchema, request.body);
  const ticket = await setTicketStatus({ ticketId: request.params.id, status });

  await record(request, {
    action: 'support.status_changed',
    entityType: 'SupportTicket',
    entityId: ticket.id,
    summary: `Issue ${ticket.reference} marked ${status.toLowerCase()}`,
  });

  return reply.send({ data: serializeTicket(ticket, { admin: true }) });
}

/* -------------------------------------------------------------- audit log */

export async function getAuditLog(request, reply) {
  const filters = parse(auditQuerySchema, request.query);
  const { items, pagination } = await listAuditLog(filters);

  return reply.send({
    data: items.map(serializeAuditEntry),
    meta: { pagination },
  });
}

export async function getAuditActions(request, reply) {
  return reply.send({ data: await listAuditActions() });
}

/* -------------------------------------------------------- administrators */

export async function listAdmins(request, reply) {
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    orderBy: { createdAt: 'asc' },
    include: {
      _count: { select: { auditLogs: true } },
      sessions: {
        where: { revokedAt: null, expiresAt: { gt: new Date() } },
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { createdAt: true },
      },
    },
  });

  return reply.send({
    data: admins.map((admin) => ({
      ...serializeUser(admin),
      isYou: admin.id === request.user.id,
      actionCount: admin._count.auditLogs,
      activeSessions: admin.sessions.length,
      lastSignedInAt: admin.sessions[0]?.createdAt ?? null,
    })),
  });
}

/**
 * Invites an administrator. An existing customer is promoted; a new address
 * gets an account with a random password it can never use — the person sets
 * their own through the normal "forgot password" flow, which proves they
 * control the inbox.
 */
export async function inviteAdmin(request, reply) {
  const { email, name } = parse(inviteAdminSchema, request.body);

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    if (existing.role === 'ADMIN') throw conflict('That account is already an administrator');

    const promoted = await prisma.user.update({
      where: { id: existing.id },
      data: { role: 'ADMIN', status: 'ACTIVE' },
    });

    await record(request, {
      action: 'admin.granted',
      entityType: 'User',
      entityId: promoted.id,
      summary: `Granted administrator access to ${promoted.email}`,
    });

    return reply.send({
      data: serializeUser(promoted),
      meta: { message: 'Existing account promoted. They keep their current password.' },
    });
  }

  // A password nobody knows, including us: the invitee must reset to sign in.
  const { randomBytes } = await import('node:crypto');
  const { hashPassword } = await import('../../lib/password.js');

  const created = await prisma.user.create({
    data: {
      email,
      name: name ?? email.split('@')[0],
      passwordHash: await hashPassword(randomBytes(32).toString('base64')),
      role: 'ADMIN',
    },
  });

  const { code, minutes } = await issueOtp({ email, purpose: 'PASSWORD_RESET' });
  await sendQuietly(
    {
      to: email,
      ...verificationCode({ name: created.name, code, minutes }),
      subject: `${code} is your Kabeer administrator code`,
    },
    request.log,
  );

  await record(request, {
    action: 'admin.invited',
    entityType: 'User',
    entityId: created.id,
    summary: `Invited ${created.email} as an administrator`,
  });

  return reply.code(201).send({
    data: serializeUser(created),
    meta: { message: 'Invitation sent. They set a password using the emailed code.' },
  });
}

/** Guards shared by every action that touches another administrator. */
async function assertCanActOnAdmin(request, targetId) {
  if (targetId === request.user.id) {
    throw badRequest('You cannot do that to your own account');
  }

  const target = await prisma.user.findUnique({ where: { id: targetId } });
  if (!target || target.role !== 'ADMIN') throw notFound('Administrator not found');

  const remaining = await prisma.user.count({ where: { role: 'ADMIN', status: 'ACTIVE' } });
  if (remaining <= 1) throw conflict('The store must keep at least one administrator');

  return target;
}

/** Demotes an administrator to a normal customer, keeping their order history. */
export async function revokeAdmin(request, reply) {
  const target = await assertCanActOnAdmin(request, request.params.id);

  const updated = await prisma.user.update({
    where: { id: target.id },
    data: { role: 'CUSTOMER' },
  });

  // Their current session still carries admin rights until it is dropped.
  await prisma.session.updateMany({
    where: { userId: target.id, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  await record(request, {
    action: 'admin.revoked',
    entityType: 'User',
    entityId: target.id,
    summary: `Revoked administrator access from ${target.email}`,
  });

  return reply.send({ data: serializeUser(updated) });
}

/** Signs an administrator out of every device without changing their access. */
export async function signOutAdmin(request, reply) {
  const target = await assertCanActOnAdmin(request, request.params.id);

  const { count } = await prisma.session.updateMany({
    where: { userId: target.id, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  await record(request, {
    action: 'admin.signed_out',
    entityType: 'User',
    entityId: target.id,
    summary: `Signed ${target.email} out of ${count} session${count === 1 ? '' : 's'}`,
  });

  return reply.send({ data: { signedOutSessions: count } });
}

/**
 * Deletes an administrator's account outright.
 *
 * Refused when they have orders: Order.userId is onDelete Restrict, because a
 * paid order must keep pointing at a real customer. Revoke access instead —
 * the audit trail survives either way, since it stores the email as a snapshot.
 */
export async function deleteAdmin(request, reply) {
  const target = await assertCanActOnAdmin(request, request.params.id);

  const orders = await prisma.order.count({ where: { userId: target.id } });
  if (orders > 0) {
    throw conflict(
      `${target.email} has ${orders} order${orders === 1 ? '' : 's'} and cannot be deleted. ` +
        'Revoke their administrator access instead.',
    );
  }

  await prisma.user.delete({ where: { id: target.id } });

  await record(request, {
    action: 'admin.deleted',
    entityType: 'User',
    entityId: target.id,
    summary: `Deleted the administrator account ${target.email}`,
  });

  return reply.send({ data: { deleted: true } });
}

/* ---------------------------------------------------------------- summary */

/** Everything the governance landing page needs, in one round trip. */
export async function getGovernanceSummary(request, reply) {
  parse(paginationSchema.partial(), request.query ?? {});

  const [openTickets, waitingTickets, admins, recentActions, policyPages] = await Promise.all([
    prisma.supportTicket.count({ where: { status: 'OPEN' } }),
    prisma.supportTicket.count({ where: { status: { in: ['OPEN', 'ANSWERED'] } } }),
    prisma.user.count({ where: { role: 'ADMIN' } }),
    prisma.auditLog.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 864e5) } } }),
    prisma.page.count({ where: { slug: { startsWith: 'policy-' } } }),
  ]);

  return reply.send({
    data: {
      support: { open: openTickets, awaitingAction: waitingTickets },
      administrators: admins,
      auditEntriesLast7Days: recentActions,
      policyPages,
    },
  });
}
