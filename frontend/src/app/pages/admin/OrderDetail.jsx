import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router';

import { admin } from '../../../lib/api/index.js';
import { formatDate, formatPrice, titleCase } from '../../../lib/format.js';
import { ErrorState, InlineLoader } from '../../components/Feedback.jsx';
import { Button, Field, Panel, Pill, StatusMessage, inputClass } from '../../components/admin/ui.jsx';
import { useQuery } from '../../hooks/useQuery.js';
import { ORDER_TONES, PAYMENT_TONES } from './Orders.jsx';

const FULFILMENT = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
const PAYMENTS = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'];

export function OrderDetail() {
  const { id } = useParams();
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  const { data: order, loading, error, refetch } = useQuery(
    (options) => admin.order(id, options),
    [id],
  );

  const applyChange = async (changes) => {
    setStatus({ state: 'saving', message: '' });
    try {
      await admin.updateOrder(id, changes);
      setStatus({ state: 'done', message: 'Order updated.' });
      refetch();
    } catch (updateError) {
      setStatus({ state: 'error', message: updateError.message });
    }
  };

  const cancel = async () => {
    const reason = window.prompt('Why is this order being cancelled?');
    if (reason === null) return;

    setStatus({ state: 'saving', message: '' });
    try {
      await admin.cancelOrder(id, reason);
      setStatus({ state: 'done', message: 'Order cancelled and stock returned.' });
      refetch();
    } catch (cancelError) {
      setStatus({ state: 'error', message: cancelError.message });
    }
  };

  if (loading) return <InlineLoader />;
  if (error) return <ErrorState message={error.message} onRetry={refetch} />;

  const address = order.shippingAddress;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to="/admin/orders" className="inline-flex items-center gap-2 text-white/50 text-sm hover:text-white transition-colors mb-2">
            <ArrowLeft className="w-4 h-4" /> All orders
          </Link>
          <h1 className="font-serif text-3xl">{order.orderNumber}</h1>
          <p className="text-white/50 text-sm mt-1">Placed {formatDate(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-3">
          <Pill tone={ORDER_TONES[order.status] ?? 'warning'}>{titleCase(order.status)}</Pill>
          <Pill tone={PAYMENT_TONES[order.paymentStatus] ?? 'warning'}>{titleCase(order.paymentStatus)}</Pill>
        </div>
      </header>

      <StatusMessage status={status} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Panel title="Items">
            <ul className="space-y-4">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-4">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt="" loading="lazy" className="w-12 h-16 object-cover rounded-md" />
                  ) : (
                    <div className="w-12 h-16 rounded-md bg-white/5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white/85 truncate">{item.name}</p>
                    <p className="text-white/35 text-xs">
                      {item.sku} · {formatPrice(item.unitPrice)} × {item.quantity}
                    </p>
                  </div>
                  <span className="text-white/70">{formatPrice(item.lineTotal)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 pt-6 border-t border-white/10 space-y-2 text-sm">
              <div className="flex justify-between text-white/60"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
              {order.discount > 0 ? (
                <div className="flex justify-between text-white/60">
                  <span>Discount {order.couponCode ? `(${order.couponCode})` : ''}</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              ) : null}
              <div className="flex justify-between text-white/60"><span>Tax</span><span>{formatPrice(order.tax)}</span></div>
              <div className="flex justify-between text-white/60"><span>Shipping</span><span>{formatPrice(order.shipping)}</span></div>
              <div className="flex justify-between text-white text-lg pt-2 border-t border-white/10">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </Panel>

          <Panel title="Shipping">
            <address className="not-italic text-sm text-white/70 leading-relaxed">
              {address.name}
              <br />
              {address.line1}
              {address.line2 ? (
                <>
                  <br />
                  {address.line2}
                </>
              ) : null}
              <br />
              {address.city}, {address.state} {address.postalCode}
              <br />
              {address.country}
              <br />
              <span className="text-white/45">{address.phone}</span>
            </address>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Fulfilment">
            <div className="space-y-5">
              <Field label="Order status" htmlFor="order-status">
                <select
                  id="order-status"
                  value={order.status}
                  disabled={order.status === 'CANCELLED'}
                  onChange={(event) => applyChange({ status: event.target.value })}
                  className={inputClass}
                >
                  {FULFILMENT.map((value) => (
                    <option key={value} value={value} className="bg-[#0F2418]">{titleCase(value)}</option>
                  ))}
                  {order.status === 'CANCELLED' ? (
                    <option value="CANCELLED" className="bg-[#0F2418]">Cancelled</option>
                  ) : null}
                </select>
              </Field>

              <Field
                label="Payment status"
                htmlFor="payment-status"
                hint="Razorpay updates this automatically; change it only for offline settlements."
              >
                <select
                  id="payment-status"
                  value={order.paymentStatus}
                  disabled={order.status === 'CANCELLED'}
                  onChange={(event) => applyChange({ paymentStatus: event.target.value })}
                  className={inputClass}
                >
                  {PAYMENTS.map((value) => (
                    <option key={value} value={value} className="bg-[#0F2418]">{titleCase(value)}</option>
                  ))}
                </select>
              </Field>

              {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' ? (
                <Button variant="danger" onClick={cancel} className="w-full">
                  Cancel order & return stock
                </Button>
              ) : null}

              {order.cancelReason ? (
                <p className="text-white/40 text-xs">Cancelled: {order.cancelReason}</p>
              ) : null}
            </div>
          </Panel>

          <Panel title="Customer">
            <p className="text-white/85">{order.customer?.name ?? order.shippingAddress.name}</p>
            <p className="text-white/45 text-sm break-words">{order.contactEmail}</p>
            {order.customer ? (
              <Link
                to={`/admin/customers/${order.customer.id}`}
                className="inline-block mt-3 text-sm text-[#E89B3C] hover:text-white transition-colors"
              >
                View customer
              </Link>
            ) : null}
          </Panel>

          {order.payment ? (
            <Panel title="Payment">
              <dl className="text-sm space-y-2">
                <div className="flex justify-between"><dt className="text-white/45">Provider</dt><dd>{order.payment.provider}</dd></div>
                <div className="flex justify-between"><dt className="text-white/45">Reference</dt><dd className="truncate max-w-[160px]">{order.payment.providerOrderId ?? '—'}</dd></div>
                <div className="flex justify-between"><dt className="text-white/45">Amount</dt><dd>{formatPrice(order.payment.amount)}</dd></div>
              </dl>
            </Panel>
          ) : null}
        </div>
      </div>
    </div>
  );
}
