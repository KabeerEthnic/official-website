import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';

import { admin } from '../../../lib/api/index.js';
import { formatDate, formatPrice, titleCase } from '../../../lib/format.js';
import { ErrorState, InlineLoader } from '../../components/Feedback.jsx';
import { Button, Pagination, Panel, Pill, StatusMessage, Table, inputClass } from '../../components/admin/ui.jsx';
import { useDebouncedValue } from '../../hooks/useDebouncedValue.js';
import { useQuery } from '../../hooks/useQuery.js';

function CustomerDetail({ id, onClose, onChanged }) {
  const [status, setStatus] = useState({ state: 'idle', message: '' });
  const { data: customer, loading, error, refetch } = useQuery(
    (options) => admin.customer(id, options),
    [id],
  );

  const setAccountStatus = async (next) => {
    setStatus({ state: 'saving', message: '' });
    try {
      await admin.updateCustomer(id, { status: next });
      setStatus({
        state: 'done',
        message: next === 'SUSPENDED' ? 'Account suspended and signed out.' : 'Account reactivated.',
      });
      refetch();
      onChanged();
    } catch (updateError) {
      setStatus({ state: 'error', message: updateError.message });
    }
  };

  return (
    <Panel
      title="Customer"
      actions={<Button variant="ghost" onClick={onClose}>Close</Button>}
    >
      {loading ? (
        <InlineLoader />
      ) : error ? (
        <ErrorState message={error.message} onRetry={refetch} />
      ) : (
        <div className="space-y-6">
          <div>
            <p className="text-white text-lg">{customer.name}</p>
            <p className="text-white/45 text-sm break-words">{customer.email}</p>
            {customer.phone ? <p className="text-white/45 text-sm">{customer.phone}</p> : null}
            <p className="text-white/35 text-xs mt-1">Joined {formatDate(customer.createdAt)}</p>
          </div>

          <StatusMessage status={status} />

          <div className="flex items-center gap-3">
            <Pill tone={customer.status === 'ACTIVE' ? 'success' : 'danger'}>{titleCase(customer.status)}</Pill>
            {customer.role !== 'ADMIN' ? (
              customer.status === 'ACTIVE' ? (
                <Button variant="danger" className="px-4 py-1.5 text-xs" onClick={() => setAccountStatus('SUSPENDED')}>
                  Suspend
                </Button>
              ) : (
                <Button variant="ghost" className="px-4 py-1.5 text-xs" onClick={() => setAccountStatus('ACTIVE')}>
                  Reactivate
                </Button>
              )
            ) : (
              <span className="text-white/35 text-xs">Administrator account</span>
            )}
          </div>

          <div>
            <h3 className="text-white/60 text-xs uppercase tracking-wider mb-3">Addresses</h3>
            {customer.addresses.length === 0 ? (
              <p className="text-white/40 text-sm">None saved.</p>
            ) : (
              <ul className="space-y-2 text-sm text-white/60">
                {customer.addresses.map((address) => (
                  <li key={address.id}>
                    {address.line1}, {address.city}, {address.state} {address.postalCode}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h3 className="text-white/60 text-xs uppercase tracking-wider mb-3">Recent orders</h3>
            {customer.orders.length === 0 ? (
              <p className="text-white/40 text-sm">No orders yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {customer.orders.map((order) => (
                  <li key={order.id} className="flex justify-between gap-4">
                    <Link to={`/admin/orders/${order.id}`} className="text-white/75 hover:text-[#E89B3C] transition-colors">
                      {order.orderNumber}
                    </Link>
                    <span className="text-white/45">{formatDate(order.createdAt)}</span>
                    <span className="text-white/75">{formatPrice(order.total)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </Panel>
  );
}

export function Customers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState('');
  const [accountStatus, setAccountStatus] = useState('');
  const [page, setPage] = useState(1);

  const search = useDebouncedValue(searchInput, 350);
  const selectedId = searchParams.get('id');

  const { data, loading, error, refetch } = useQuery(
    (options) =>
      admin.customers({ search: search || undefined, status: accountStatus || undefined, page, limit: 20 }, options),
    [search, accountStatus, page],
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl">Customers</h1>
        <p className="text-white/50 text-sm mt-1">Accounts, order history and access.</p>
      </header>

      <div className={`grid grid-cols-1 gap-6 ${selectedId ? 'xl:grid-cols-3' : ''}`}>
        <Panel className={selectedId ? 'xl:col-span-2' : ''}>
          <div className="flex flex-wrap gap-3 mb-6">
            <input
              type="search"
              value={searchInput}
              onChange={(event) => {
                setSearchInput(event.target.value);
                setPage(1);
              }}
              placeholder="Search by name or email"
              aria-label="Search customers"
              className={`${inputClass} max-w-xs`}
            />
            <select
              value={accountStatus}
              onChange={(event) => {
                setAccountStatus(event.target.value);
                setPage(1);
              }}
              aria-label="Filter by account status"
              className={`${inputClass} max-w-[180px]`}
            >
              <option value="" className="bg-[#0F2418]">All accounts</option>
              <option value="ACTIVE" className="bg-[#0F2418]">Active</option>
              <option value="SUSPENDED" className="bg-[#0F2418]">Suspended</option>
            </select>
          </div>

          {loading ? (
            <InlineLoader />
          ) : error ? (
            <ErrorState message={error.message} onRetry={refetch} />
          ) : (
            <>
              <Table
                head={['Name', 'Email', 'Orders', 'Joined', 'Status']}
                empty={data.data.length === 0 ? <p className="text-white/40 text-sm py-6">No customers match this search.</p> : null}
              >
                {data.data.map((customer) => (
                  <tr key={customer.id} className="text-white/80">
                    <td className="py-3 pr-4">
                      <button
                        type="button"
                        onClick={() => setSearchParams({ id: customer.id })}
                        className="hover:text-[#E89B3C] transition-colors text-left"
                      >
                        {customer.name}
                      </button>
                    </td>
                    <td className="py-3 pr-4 text-white/55 break-all">{customer.email}</td>
                    <td className="py-3 pr-4">{customer.orderCount}</td>
                    <td className="py-3 pr-4 text-white/55">{formatDate(customer.createdAt)}</td>
                    <td className="py-3 pr-4">
                      <Pill tone={customer.status === 'ACTIVE' ? 'success' : 'danger'}>{titleCase(customer.status)}</Pill>
                    </td>
                  </tr>
                ))}
              </Table>

              <Pagination pagination={data.meta.pagination} onChange={setPage} />
            </>
          )}
        </Panel>

        {selectedId ? (
          <CustomerDetail id={selectedId} onClose={() => setSearchParams({})} onChanged={refetch} />
        ) : null}
      </div>
    </div>
  );
}
