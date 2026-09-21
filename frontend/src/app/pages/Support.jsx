import { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { ArrowLeft, LifeBuoy, Plus, Send } from 'lucide-react';

import { orders as ordersApi, support } from '../../lib/api/index.js';
import { formatDate, titleCase } from '../../lib/format.js';
import { EmptyState, ErrorState, InlineLoader } from '../components/Feedback.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useQuery } from '../hooks/useQuery.js';

const CATEGORIES = [
  { value: 'ORDER', label: 'An order' },
  { value: 'PAYMENT', label: 'A payment' },
  { value: 'DELIVERY', label: 'Delivery' },
  { value: 'PRODUCT', label: 'A product' },
  { value: 'ACCOUNT', label: 'My account' },
  { value: 'OTHER', label: 'Something else' },
];

const STATUS_STYLES = {
  OPEN: 'bg-[#E89B3C]/20 text-[#E89B3C]',
  ANSWERED: 'bg-green-500/20 text-green-300',
  RESOLVED: 'bg-white/10 text-white/60',
  CLOSED: 'bg-white/10 text-white/50',
};

const FIELD_CLASS =
  'w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-[#E89B3C] focus:outline-none transition-colors';

function StatusPill({ status }) {
  return (
    <span className={`text-xs px-2 py-1 rounded-full ${STATUS_STYLES[status] ?? STATUS_STYLES.OPEN}`}>
      {titleCase(status)}
    </span>
  );
}

/** The form that raises a new issue. */
function NewIssue({ onCreated, onCancel }) {
  const [form, setForm] = useState({ category: 'ORDER', subject: '', body: '', orderId: '' });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Recent orders only: attaching one saves the customer typing the number and
  // gives whoever answers the full context in a click.
  const { data: orderData } = useQuery((options) => ordersApi.list({ limit: 10 }, options), []);
  const recentOrders = orderData?.data ?? [];

  const update = (key) => (event) => setForm({ ...form, [key]: event.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setFieldErrors({});
    setSubmitting(true);

    try {
      const ticket = await support.create({
        category: form.category,
        subject: form.subject,
        body: form.body,
        ...(form.orderId ? { orderId: form.orderId } : {}),
      });
      onCreated(ticket);
    } catch (submitError) {
      setError(submitError.message);
      setFieldErrors(submitError.fieldErrors ?? {});
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <h2 className="text-2xl text-white font-serif">Raise an issue</h2>
        <button type="button" onClick={onCancel} className="text-sm text-white/50 hover:text-white transition-colors">
          Cancel
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="issue-category" className="block text-white/70 text-sm mb-2">What is this about?</label>
          <select id="issue-category" value={form.category} onChange={update('category')} className={FIELD_CLASS}>
            {CATEGORIES.map((option) => (
              <option key={option.value} value={option.value} className="bg-[#0F2418]">
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="issue-order" className="block text-white/70 text-sm mb-2">
            Related order <span className="text-white/40">(optional)</span>
          </label>
          <select id="issue-order" value={form.orderId} onChange={update('orderId')} className={FIELD_CLASS}>
            <option value="" className="bg-[#0F2418]">Not about a specific order</option>
            {recentOrders.map((order) => (
              <option key={order.id} value={order.id} className="bg-[#0F2418]">
                {order.orderNumber} — {formatDate(order.createdAt)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="issue-subject" className="block text-white/70 text-sm mb-2">Subject</label>
        <input
          id="issue-subject"
          type="text"
          required
          maxLength={140}
          value={form.subject}
          onChange={update('subject')}
          className={FIELD_CLASS}
          placeholder="A short summary"
        />
        {fieldErrors.subject ? <p className="text-xs text-[#E89B3C] mt-2">{fieldErrors.subject}</p> : null}
      </div>

      <div>
        <label htmlFor="issue-body" className="block text-white/70 text-sm mb-2">Tell us what happened</label>
        <textarea
          id="issue-body"
          required
          rows={6}
          maxLength={4000}
          value={form.body}
          onChange={update('body')}
          className={`${FIELD_CLASS} resize-y`}
          placeholder="Dates, order numbers and anything you have already tried all help."
        />
        <p className="text-xs text-white/40 mt-2">
          {fieldErrors.body ?? 'We reply by email, and the whole conversation stays on this page.'}
        </p>
      </div>

      {error ? <p className="text-sm text-[#E89B3C]" role="alert">{error}</p> : null}

      <button
        type="submit"
        disabled={submitting}
        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#531323] hover:bg-[#731830] text-white px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-60"
      >
        {submitting ? 'Sending…' : 'Send to support'} <Send className="w-4 h-4" />
      </button>
    </form>
  );
}

/** One conversation, oldest message first, with the reply box underneath. */
function Thread({ id, onBack }) {
  const [reply, setReply] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const { data: ticket, loading, error: loadError, refetch, setData } = useQuery(
    (options) => support.ticket(id, options),
    [id],
  );

  const send = async (event) => {
    event.preventDefault();
    if (!reply.trim()) return;

    setError('');
    setSending(true);
    try {
      setData(await support.reply(id, reply));
      setReply('');
    } catch (sendError) {
      setError(sendError.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <InlineLoader />;
  if (loadError) return <ErrorState message={loadError.message} onRetry={refetch} />;
  if (!ticket) return null;

  const closed = ticket.status === 'CLOSED';

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> All issues
      </button>

      <div className="pb-4 border-b border-white/10">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <h2 className="text-2xl text-white font-serif">{ticket.subject}</h2>
          <StatusPill status={ticket.status} />
        </div>
        <p className="text-white/40 text-sm mt-2">
          {ticket.reference} • {titleCase(ticket.category)} • raised {formatDate(ticket.createdAt)}
          {ticket.order ? (
            <>
              {' • '}
              <Link to="/account" className="text-[#E89B3C] hover:text-white transition-colors">
                {ticket.order.orderNumber}
              </Link>
            </>
          ) : null}
        </p>
      </div>

      <div className="space-y-4 py-6">
        {ticket.messages.map((message) => (
          <div
            key={message.id}
            className={`rounded-xl p-5 border ${
              message.fromStaff ? 'bg-[#E89B3C]/10 border-[#E89B3C]/20' : 'bg-white/5 border-white/10'
            }`}
          >
            <div className="flex items-center justify-between gap-4 mb-2">
              <p className="text-sm text-white font-medium">
                {message.fromStaff ? `${message.author} · Kabeer Support` : message.author}
              </p>
              <p className="text-xs text-white/40">{formatDate(message.createdAt)}</p>
            </div>
            <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{message.body}</p>
          </div>
        ))}
      </div>

      {closed ? (
        <p className="text-sm text-white/50 border-t border-white/10 pt-6">
          This issue is closed. Raise a new one if you still need help.
        </p>
      ) : (
        <form className="border-t border-white/10 pt-6 space-y-4" onSubmit={send}>
          <label htmlFor="reply" className="block text-white/70 text-sm">Add a reply</label>
          <textarea
            id="reply"
            rows={4}
            maxLength={4000}
            value={reply}
            onChange={(event) => setReply(event.target.value)}
            className={`${FIELD_CLASS} resize-y`}
          />
          {error ? <p className="text-sm text-[#E89B3C]" role="alert">{error}</p> : null}
          <button
            type="submit"
            disabled={sending || !reply.trim()}
            className="flex items-center gap-2 bg-[#531323] hover:bg-[#731830] text-white px-7 py-3 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? 'Sending…' : 'Send reply'} <Send className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
}

function TicketList({ onOpen, onNew }) {
  const { data, loading, error, refetch } = useQuery(
    (options) => support.tickets({ limit: 20 }, options),
    [],
  );
  const tickets = data?.data ?? [];

  if (loading) return <InlineLoader />;
  if (error) return <ErrorState message={error.message} onRetry={refetch} />;

  return (
    <div>
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/10">
        <h2 className="text-2xl text-white font-serif">Your issues</h2>
        <button
          type="button"
          onClick={onNew}
          className="flex items-center gap-2 text-sm bg-[#531323] hover:bg-[#731830] text-white px-5 py-2.5 rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" /> Raise an issue
        </button>
      </div>

      {tickets.length === 0 ? (
        <EmptyState
          title="Nothing open"
          message="If something has gone wrong with an order, a payment or a delivery, tell us here and we will pick it up."
        />
      ) : (
        <div className="space-y-4 pt-6">
          {tickets.map((ticket) => (
            <button
              key={ticket.id}
              type="button"
              onClick={() => onOpen(ticket.id)}
              className="w-full text-left bg-white/5 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <p className="text-white">{ticket.subject}</p>
                <StatusPill status={ticket.status} />
              </div>
              <p className="text-white/40 text-sm mt-2">
                {ticket.reference} • {titleCase(ticket.category)} • last activity{' '}
                {formatDate(ticket.lastReplyAt)}
                {ticket.messageCount ? ` • ${ticket.messageCount} messages` : ''}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Support() {
  const { user } = useAuth();
  // null = the list, 'new' = the form, anything else = that ticket's thread.
  const [view, setView] = useState(null);
  const [listKey, setListKey] = useState(0);

  const openList = () => {
    setView(null);
    // Force the list to refetch: statuses and reply counts change while a
    // thread is open.
    setListKey((key) => key + 1);
  };

  return (
    <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 relative min-h-screen">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0F2418] via-[#0D1F15] to-[#0F2418] -z-10"></div>

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <LifeBuoy className="w-6 h-6 text-[#E89B3C]" />
          <h1
            className="text-3xl text-white"
            style={{ fontFamily: "'Boston Angel', 'Great Vibes', cursive", letterSpacing: '0.02em' }}
          >
            Help &amp; Support
          </h1>
        </div>

        <p className="text-white/50 text-sm mb-8 max-w-2xl">
          Raise an issue and we will reply to {user?.email}. Everything you send stays on this page, so
          you can follow the conversation without digging through your inbox.
        </p>

        <motion.div
          key={String(view)}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8 min-h-[420px]"
        >
          {view === null ? (
            <TicketList key={listKey} onOpen={setView} onNew={() => setView('new')} />
          ) : null}
          {view === 'new' ? (
            <NewIssue onCreated={(ticket) => setView(ticket.id)} onCancel={openList} />
          ) : null}
          {view !== null && view !== 'new' ? <Thread id={view} onBack={openList} /> : null}
        </motion.div>
      </div>
    </div>
  );
}
