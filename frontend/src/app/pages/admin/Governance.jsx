import { useState } from 'react';
import {
  ArrowLeft,
  ExternalLink,
  LifeBuoy,
  ScrollText,
  ShieldCheck,
  UserCog,
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router';

import { admin } from '../../../lib/api/index.js';
import { formatDate, titleCase } from '../../../lib/format.js';
import { ErrorState, InlineLoader } from '../../components/Feedback.jsx';
import {
  Button,
  Field,
  Pagination,
  Panel,
  Pill,
  StatusMessage,
  Table,
  inputClass,
} from '../../components/admin/ui.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useDebouncedValue } from '../../hooks/useDebouncedValue.js';
import { useQuery } from '../../hooks/useQuery.js';

const TABS = [
  { id: 'issues', label: 'Issue desk', icon: LifeBuoy },
  { id: 'audit', label: 'Audit log', icon: ScrollText },
  { id: 'policies', label: 'Policies', icon: ShieldCheck },
  { id: 'admins', label: 'Administrators', icon: UserCog },
];

const TICKET_TONES = { OPEN: 'warning', ANSWERED: 'success', RESOLVED: 'neutral', CLOSED: 'neutral' };
const TICKET_STATUSES = ['OPEN', 'ANSWERED', 'RESOLVED', 'CLOSED'];

/** The policy pages the store is expected to publish, with why each exists. */
const POLICIES = [
  { slug: 'policy-terms', path: 'terms', note: 'The contract a shopper accepts at checkout.' },
  { slug: 'policy-privacy', path: 'privacy', note: 'What you collect and why — required by the DPDP Act.' },
  { slug: 'policy-refunds', path: 'refunds', note: 'Returns, exchanges and refund timelines. Razorpay asks for this.' },
  { slug: 'policy-shipping', path: 'shipping', note: 'Dispatch and delivery windows, and who pays for postage.' },
];

/* ------------------------------------------------------------- issue desk */

function TicketThread({ id, onBack, onChanged }) {
  const [reply, setReply] = useState('');
  const [status, setStatus] = useState({ state: 'idle', message: '' });
  const [sending, setSending] = useState(false);

  const { data: ticket, loading, error, refetch, setData } = useQuery(
    (options) => admin.ticket(id, options),
    [id],
  );

  const send = async (event) => {
    event.preventDefault();
    if (!reply.trim()) return;

    setStatus({ state: 'saving', message: '' });
    setSending(true);
    try {
      setData(await admin.replyToTicket(id, reply));
      setReply('');
      setStatus({ state: 'done', message: 'Reply sent and emailed to the customer.' });
      onChanged();
    } catch (sendError) {
      setStatus({ state: 'error', message: sendError.message });
    } finally {
      setSending(false);
    }
  };

  const changeStatus = async (next) => {
    setStatus({ state: 'saving', message: '' });
    try {
      setData(await admin.setTicketStatus(id, next));
      setStatus({ state: 'done', message: `Marked ${next.toLowerCase()}.` });
      onChanged();
    } catch (statusError) {
      setStatus({ state: 'error', message: statusError.message });
    }
  };

  if (loading) return <InlineLoader />;
  if (error) return <ErrorState message={error.message} onRetry={refetch} />;
  if (!ticket) return null;

  return (
    <Panel
      title={ticket.subject}
      description={`${ticket.reference} · ${titleCase(ticket.category)} · raised ${formatDate(ticket.createdAt)}`}
      actions={
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
      }
    >
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Pill tone={TICKET_TONES[ticket.status]}>{titleCase(ticket.status)}</Pill>
        <span className="text-white/45 text-xs">
          {ticket.customer?.name} · {ticket.customer?.email}
        </span>
        {ticket.order ? (
          <Link
            to={`/admin/orders/${ticket.order.id}`}
            className="text-[#E89B3C] text-xs hover:text-white transition-colors"
          >
            {ticket.order.orderNumber}
          </Link>
        ) : null}
      </div>

      <div className="space-y-4">
        {ticket.messages.map((message) => (
          <div
            key={message.id}
            className={`rounded-xl p-5 border ${
              message.fromStaff ? 'bg-[#E89B3C]/10 border-[#E89B3C]/20' : 'bg-white/5 border-white/10'
            }`}
          >
            <div className="flex items-center justify-between gap-4 mb-2">
              <p className="text-sm text-white">
                {message.author}
                {message.fromStaff ? <span className="text-white/40"> · staff</span> : null}
              </p>
              <p className="text-xs text-white/40">{formatDate(message.createdAt)}</p>
            </div>
            <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{message.body}</p>
          </div>
        ))}
      </div>

      <form className="mt-6 pt-6 border-t border-white/10 space-y-4" onSubmit={send}>
        <Field label="Reply" htmlFor="admin-reply" hint="The customer gets this by email as well.">
          <textarea
            id="admin-reply"
            rows={5}
            maxLength={4000}
            value={reply}
            onChange={(event) => setReply(event.target.value)}
            className={`${inputClass} resize-y`}
          />
        </Field>

        <StatusMessage status={status} />

        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" disabled={sending || !reply.trim()}>
            {sending ? 'Sending…' : 'Send reply'}
          </Button>
          {TICKET_STATUSES.filter((value) => value !== ticket.status).map((value) => (
            <Button key={value} variant="ghost" className="text-xs" onClick={() => changeStatus(value)}>
              Mark {value.toLowerCase()}
            </Button>
          ))}
        </div>
      </form>
    </Panel>
  );
}

function IssueDesk() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const debouncedSearch = useDebouncedValue(search, 300);

  const { data, loading, error, refetch } = useQuery(
    (options) =>
      admin.tickets(
        {
          status: filter || undefined,
          search: debouncedSearch || undefined,
          page,
          limit: 20,
        },
        options,
      ),
    [filter, debouncedSearch, page, reloadKey],
  );

  if (openId) {
    return (
      <TicketThread
        id={openId}
        onBack={() => {
          setOpenId(null);
          setReloadKey((key) => key + 1);
        }}
        onChanged={() => setReloadKey((key) => key + 1)}
      />
    );
  }

  return (
    <Panel
      title="Issue desk"
      description="Everything customers have raised, oldest waiting first."
    >
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={filter}
          onChange={(event) => {
            setFilter(event.target.value);
            setPage(1);
          }}
          aria-label="Filter by status"
          className={`${inputClass} max-w-[200px]`}
        >
          <option value="" className="bg-[#0F2418]">All issues</option>
          {TICKET_STATUSES.map((value) => (
            <option key={value} value={value} className="bg-[#0F2418]">
              {titleCase(value)}
            </option>
          ))}
        </select>
        <input
          type="search"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search subject or reference"
          aria-label="Search issues"
          className={`${inputClass} max-w-[280px]`}
        />
      </div>

      {loading ? (
        <InlineLoader />
      ) : error ? (
        <ErrorState message={error.message} onRetry={refetch} />
      ) : data.data.length === 0 ? (
        <p className="text-white/40 text-sm py-6">Nothing here. That is good news.</p>
      ) : (
        <>
          <Table head={['Issue', 'Customer', 'Status', 'Last activity', '']}>
            {data.data.map((ticket) => (
              <tr key={ticket.id} className="text-white/75">
                <td className="py-4 pr-4">
                  <p className="text-white">{ticket.subject}</p>
                  <p className="text-white/40 text-xs mt-1">
                    {ticket.reference} · {titleCase(ticket.category)}
                  </p>
                </td>
                <td className="py-4 pr-4">
                  <p>{ticket.customer?.name}</p>
                  <p className="text-white/40 text-xs">{ticket.customer?.email}</p>
                </td>
                <td className="py-4 pr-4">
                  <Pill tone={TICKET_TONES[ticket.status]}>{titleCase(ticket.status)}</Pill>
                </td>
                <td className="py-4 pr-4 text-white/50 text-xs">{formatDate(ticket.lastReplyAt)}</td>
                <td className="py-4">
                  <Button variant="ghost" className="px-4 py-1.5 text-xs" onClick={() => setOpenId(ticket.id)}>
                    Open
                  </Button>
                </td>
              </tr>
            ))}
          </Table>

          <Pagination pagination={data.meta.pagination} onChange={setPage} />
        </>
      )}
    </Panel>
  );
}

/* -------------------------------------------------------------- audit log */

function AuditLog() {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);

  const { data: actions } = useQuery((options) => admin.auditActions(options), []);
  const { data, loading, error, refetch } = useQuery(
    (options) =>
      admin.auditLog(
        { action: action || undefined, search: debouncedSearch || undefined, page, limit: 30 },
        options,
      ),
    [action, debouncedSearch, page],
  );

  return (
    <Panel
      title="Audit log"
      description="Every change an administrator makes, kept append-only. Nothing here can be edited or deleted."
    >
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={action}
          onChange={(event) => {
            setAction(event.target.value);
            setPage(1);
          }}
          aria-label="Filter by action"
          className={`${inputClass} max-w-[240px]`}
        >
          <option value="" className="bg-[#0F2418]">All actions</option>
          {(actions ?? []).map((value) => (
            <option key={value} value={value} className="bg-[#0F2418]">
              {value}
            </option>
          ))}
        </select>
        <input
          type="search"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search summaries or who did it"
          aria-label="Search the audit log"
          className={`${inputClass} max-w-[280px]`}
        />
      </div>

      {loading ? (
        <InlineLoader />
      ) : error ? (
        <ErrorState message={error.message} onRetry={refetch} />
      ) : data.data.length === 0 ? (
        <p className="text-white/40 text-sm py-6">No entries match that filter.</p>
      ) : (
        <>
          <Table head={['When', 'Who', 'What happened', 'Action']}>
            {data.data.map((entry) => (
              <tr key={entry.id} className="text-white/75 align-top">
                <td className="py-4 pr-4 text-white/50 text-xs whitespace-nowrap">
                  {new Date(entry.createdAt).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td className="py-4 pr-4 text-xs">{entry.actor.email}</td>
                <td className="py-4 pr-4">{entry.summary}</td>
                <td className="py-4 text-white/40 text-xs font-mono">{entry.action}</td>
              </tr>
            ))}
          </Table>

          <Pagination pagination={data.meta.pagination} onChange={setPage} />
        </>
      )}
    </Panel>
  );
}

/* --------------------------------------------------------------- policies */

function Policies() {
  const { data, loading, error, refetch } = useQuery((options) => admin.pages(options), []);

  const pages = (data ?? []).filter((page) => page.slug.startsWith('policy-'));

  return (
    <Panel
      title="Store policies"
      description="The legal pages shoppers and payment providers expect. Edit the wording under Page content — these are ordinary CMS pages."
    >
      {loading ? (
        <InlineLoader />
      ) : error ? (
        <ErrorState message={error.message} onRetry={refetch} />
      ) : (
        <ul className="space-y-3">
          {POLICIES.map((policy) => {
            const page = pages.find((candidate) => candidate.slug === policy.slug);

            return (
              <li
                key={policy.slug}
                className="flex flex-wrap items-center justify-between gap-4 bg-white/5 border border-white/10 rounded-xl p-5"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="text-white">{page?.title ?? policy.slug}</p>
                    {page ? (
                      <Pill tone={page.published ? 'success' : 'warning'}>
                        {page.published ? 'Published' : 'Draft'}
                      </Pill>
                    ) : (
                      <Pill tone="danger">Missing</Pill>
                    )}
                  </div>
                  <p className="text-white/45 text-xs mt-1">{policy.note}</p>
                  {page?.updatedAt ? (
                    <p className="text-white/30 text-xs mt-1">Updated {formatDate(page.updatedAt)}</p>
                  ) : null}
                </div>

                <div className="flex items-center gap-2">
                  {page ? (
                    <>
                      <Link
                        to={`/admin/content/${policy.slug}`}
                        className="px-5 py-2.5 rounded-full text-sm bg-white/5 hover:bg-white/10 text-white border border-white/15 transition-all"
                      >
                        Edit
                      </Link>
                      <a
                        href={`/policies/${policy.path}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm text-white/60 hover:text-white transition-colors"
                      >
                        View <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </>
                  ) : (
                    <span className="text-white/40 text-xs">Run the seed to create it</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}

/* --------------------------------------------------------- administrators */

function Administrators() {
  const { user } = useAuth();
  const [invite, setInvite] = useState({ email: '', name: '' });
  const [status, setStatus] = useState({ state: 'idle', message: '' });
  const [busy, setBusy] = useState(false);

  const { data, loading, error, refetch } = useQuery((options) => admin.admins(options), []);

  const run = async (label, action) => {
    setStatus({ state: 'saving', message: '' });
    setBusy(true);
    try {
      await action();
      setStatus({ state: 'done', message: label });
      refetch();
    } catch (actionError) {
      setStatus({ state: 'error', message: actionError.message });
    } finally {
      setBusy(false);
    }
  };

  const sendInvite = async (event) => {
    event.preventDefault();
    setStatus({ state: 'saving', message: '' });
    setBusy(true);
    try {
      const response = await admin.inviteAdmin(invite);
      setInvite({ email: '', name: '' });
      setStatus({ state: 'done', message: response.meta?.message ?? 'Invitation sent.' });
      refetch();
    } catch (inviteError) {
      setStatus({ state: 'error', message: inviteError.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <Panel
        title="Administrators"
        description="Everyone who can reach this dashboard. The store always keeps at least one."
      >
        {loading ? (
          <InlineLoader />
        ) : error ? (
          <ErrorState message={error.message} onRetry={refetch} />
        ) : (
          <>
            <StatusMessage status={status} />

            <Table head={['Administrator', 'Signed in', 'Actions logged', '']}>
              {data.map((person) => (
                <tr key={person.id} className="text-white/75 align-top">
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white">{person.name}</p>
                      {person.isYou ? <Pill tone="warning">You</Pill> : null}
                      {person.status !== 'ACTIVE' ? <Pill tone="danger">{titleCase(person.status)}</Pill> : null}
                    </div>
                    <p className="text-white/40 text-xs mt-1">{person.email}</p>
                  </td>
                  <td className="py-4 pr-4 text-xs text-white/50">
                    {person.activeSessions > 0
                      ? `${person.activeSessions} device${person.activeSessions === 1 ? '' : 's'} · ${formatDate(person.lastSignedInAt)}`
                      : 'Not signed in'}
                  </td>
                  <td className="py-4 pr-4 text-xs text-white/50">{person.actionCount}</td>
                  <td className="py-4">
                    {person.isYou ? (
                      <span className="text-white/30 text-xs">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="ghost"
                          className="px-4 py-1.5 text-xs"
                          disabled={busy || person.activeSessions === 0}
                          onClick={() =>
                            run(`${person.email} signed out everywhere.`, () => admin.signOutAdmin(person.id))
                          }
                        >
                          Sign out
                        </Button>
                        <Button
                          variant="ghost"
                          className="px-4 py-1.5 text-xs"
                          disabled={busy}
                          onClick={() => {
                            if (!window.confirm(`Remove administrator access from ${person.email}? They keep their account and order history.`)) return;
                            run(`${person.email} is now a customer.`, () => admin.revokeAdmin(person.id));
                          }}
                        >
                          Revoke access
                        </Button>
                        <Button
                          variant="danger"
                          className="px-4 py-1.5 text-xs"
                          disabled={busy}
                          onClick={() => {
                            if (!window.confirm(`Delete ${person.email} permanently? This cannot be undone.`)) return;
                            run(`${person.email} deleted.`, () => admin.deleteAdmin(person.id));
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </Table>

            <p className="text-white/35 text-xs mt-6">
              Signed in as {user?.email}. You cannot act on your own account here — ask another
              administrator, so nobody can lock the store out by accident.
            </p>
          </>
        )}
      </Panel>

      <Panel
        title="Invite an administrator"
        description="An existing customer is promoted and keeps their password. A new address gets an emailed code to set one."
      >
        <form className="grid sm:grid-cols-[1fr_1fr_auto] gap-4 items-end" onSubmit={sendInvite}>
          <Field label="Email" htmlFor="invite-email" required>
            <input
              id="invite-email"
              type="email"
              required
              value={invite.email}
              onChange={(event) => setInvite({ ...invite, email: event.target.value })}
              className={inputClass}
              placeholder="name@example.com"
            />
          </Field>
          <Field label="Name" htmlFor="invite-name" hint="Optional — used in the invitation email.">
            <input
              id="invite-name"
              type="text"
              value={invite.name}
              onChange={(event) => setInvite({ ...invite, name: event.target.value })}
              className={inputClass}
            />
          </Field>
          <Button type="submit" disabled={busy || !invite.email} className="h-[46px]">
            Send invitation
          </Button>
        </form>
      </Panel>
    </div>
  );
}

/* ------------------------------------------------------------------- page */

function SummaryCard({ label, value, hint }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-5">
      <p className="text-white/45 text-xs uppercase tracking-wider">{label}</p>
      <p className="text-white font-serif text-3xl mt-2">{value}</p>
      {hint ? <p className="text-white/35 text-xs mt-1">{hint}</p> : null}
    </div>
  );
}

export function Governance() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = TABS.some((item) => item.id === searchParams.get('tab'))
    ? searchParams.get('tab')
    : 'issues';

  const { data: summary } = useQuery((options) => admin.governanceSummary(options), []);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl">Governance</h1>
        <p className="text-white/50 text-sm mt-1">
          Customer issues, the record of who changed what, the store's policies, and who holds the keys.
        </p>
      </header>

      {summary ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            label="Open issues"
            value={summary.support.open}
            hint={`${summary.support.awaitingAction} awaiting action`}
          />
          <SummaryCard label="Administrators" value={summary.administrators} />
          <SummaryCard
            label="Logged actions"
            value={summary.auditEntriesLast7Days}
            hint="in the last 7 days"
          />
          <SummaryCard label="Policy pages" value={summary.policyPages} hint="of 4 expected" />
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSearchParams(item.id === 'issues' ? {} : { tab: item.id })}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm transition-all ${
              tab === item.id
                ? 'bg-[#E89B3C]/10 text-[#E89B3C] border border-[#E89B3C]/30'
                : 'bg-white/5 text-white/60 border border-white/10 hover:text-white'
            }`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'issues' ? <IssueDesk /> : null}
      {tab === 'audit' ? <AuditLog /> : null}
      {tab === 'policies' ? <Policies /> : null}
      {tab === 'admins' ? <Administrators /> : null}
    </div>
  );
}
