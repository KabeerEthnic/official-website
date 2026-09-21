import { useState } from 'react';
import { Link } from 'react-router';

import { admin } from '../../../lib/api/index.js';
import { formatDate, formatPrice, titleCase } from '../../../lib/format.js';
import { ErrorState, InlineLoader } from '../../components/Feedback.jsx';
import { Pagination, Panel, Pill, Table, inputClass } from '../../components/admin/ui.jsx';
import { useDebouncedValue } from '../../hooks/useDebouncedValue.js';
import { useQuery } from '../../hooks/useQuery.js';

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const PAYMENT_STATUSES = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'];

export const ORDER_TONES = { DELIVERED: 'success', CANCELLED: 'danger' };
export const PAYMENT_TONES = { PAID: 'success', FAILED: 'danger', REFUNDED: 'neutral' };

export function Orders() {
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [page, setPage] = useState(1);

  const search = useDebouncedValue(searchInput, 350);

  const { data, loading, error, refetch } = useQuery(
    (options) =>
      admin.orders(
        {
          search: search || undefined,
          status: status || undefined,
          paymentStatus: paymentStatus || undefined,
          page,
          limit: 20,
        },
        options,
      ),
    [search, status, paymentStatus, page],
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl">Orders</h1>
        <p className="text-white/50 text-sm mt-1">Every order placed on the storefront.</p>
      </header>

      <Panel>
        <div className="flex flex-wrap gap-3 mb-6">
          <input
            type="search"
            value={searchInput}
            onChange={(event) => {
              setSearchInput(event.target.value);
              setPage(1);
            }}
            placeholder="Order number, name, email or phone"
            aria-label="Search orders"
            className={`${inputClass} max-w-sm`}
          />
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            aria-label="Filter by order status"
            className={`${inputClass} max-w-[180px]`}
          >
            <option value="" className="bg-[#0F2418]">All statuses</option>
            {ORDER_STATUSES.map((value) => (
              <option key={value} value={value} className="bg-[#0F2418]">{titleCase(value)}</option>
            ))}
          </select>
          <select
            value={paymentStatus}
            onChange={(event) => {
              setPaymentStatus(event.target.value);
              setPage(1);
            }}
            aria-label="Filter by payment status"
            className={`${inputClass} max-w-[180px]`}
          >
            <option value="" className="bg-[#0F2418]">All payments</option>
            {PAYMENT_STATUSES.map((value) => (
              <option key={value} value={value} className="bg-[#0F2418]">{titleCase(value)}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <InlineLoader />
        ) : error ? (
          <ErrorState message={error.message} onRetry={refetch} />
        ) : (
          <>
            <Table
              head={['Order', 'Placed', 'Customer', 'Status', 'Payment', 'Total']}
              empty={data.data.length === 0 ? <p className="text-white/40 text-sm py-6">No orders match these filters.</p> : null}
            >
              {data.data.map((order) => (
                <tr key={order.id} className="text-white/80">
                  <td className="py-3 pr-4">
                    <Link to={`/admin/orders/${order.id}`} className="hover:text-[#E89B3C] transition-colors">
                      {order.orderNumber}
                    </Link>
                    <span className="block text-white/35 text-xs">{order.items.length} items</span>
                  </td>
                  <td className="py-3 pr-4 text-white/60">{formatDate(order.createdAt)}</td>
                  <td className="py-3 pr-4">
                    <span className="block">{order.shippingAddress.name}</span>
                    <span className="block text-white/35 text-xs">{order.contactEmail}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <Pill tone={ORDER_TONES[order.status] ?? 'warning'}>{titleCase(order.status)}</Pill>
                  </td>
                  <td className="py-3 pr-4">
                    <Pill tone={PAYMENT_TONES[order.paymentStatus] ?? 'warning'}>{titleCase(order.paymentStatus)}</Pill>
                  </td>
                  <td className="py-3 pr-4">{formatPrice(order.total)}</td>
                </tr>
              ))}
            </Table>

            <Pagination pagination={data.meta.pagination} onChange={setPage} />
          </>
        )}
      </Panel>
    </div>
  );
}
