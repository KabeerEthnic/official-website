import { Link } from 'react-router';

import { admin } from '../../../lib/api/index.js';
import { formatDate, formatPrice, titleCase } from '../../../lib/format.js';
import { ErrorState, InlineLoader } from '../../components/Feedback.jsx';
import { Panel, Pill, Table } from '../../components/admin/ui.jsx';
import { useQuery } from '../../hooks/useQuery.js';

function Stat({ label, value, hint }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <p className="text-white/45 text-xs uppercase tracking-wider">{label}</p>
      <p className="text-3xl text-white font-serif mt-2">{value}</p>
      {hint ? <p className="text-white/40 text-xs mt-1">{hint}</p> : null}
    </div>
  );
}

const STATUS_TONES = { DELIVERED: 'success', CANCELLED: 'danger' };

export function Dashboard() {
  const { data, loading, error, refetch } = useQuery((options) => admin.dashboard(options), []);

  if (loading) return <InlineLoader />;
  if (error) return <ErrorState message={error.message} onRetry={refetch} />;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-serif text-3xl">Overview</h1>
        <p className="text-white/50 text-sm mt-1">How the boutique is doing right now.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <Stat
          label="Paid revenue"
          value={formatPrice(data.revenue.paidTotal)}
          hint={`${data.revenue.paidOrders} paid orders`}
        />
        <Stat label="Open orders" value={data.orders.open} hint={`${data.orders.last30Days} in the last 30 days`} />
        <Stat
          label="Products"
          value={data.catalogue.active}
          hint={`${data.catalogue.products} in total, including drafts`}
        />
        <Stat
          label="Customers"
          value={data.customers.total}
          hint={`${data.customers.newsletterSubscribers} newsletter subscribers`}
        />
      </div>

      {data.moderation.pendingReviews > 0 ? (
        <Panel>
          <p className="text-sm text-white/70">
            {data.moderation.pendingReviews} review
            {data.moderation.pendingReviews === 1 ? '' : 's'} waiting for moderation.{' '}
            <Link to="/admin/reviews?status=PENDING" className="text-[#E89B3C] hover:text-white transition-colors">
              Review them
            </Link>
          </p>
        </Panel>
      ) : null}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Panel title="Recent orders">
          <Table
            head={['Order', 'Customer', 'Status', 'Total']}
            empty={
              data.recentOrders.length === 0 ? (
                <p className="text-white/40 text-sm py-6">No orders yet.</p>
              ) : null
            }
          >
            {data.recentOrders.map((order) => (
              <tr key={order.id} className="text-white/80">
                <td className="py-3 pr-4">
                  <Link to={`/admin/orders/${order.id}`} className="hover:text-[#E89B3C] transition-colors">
                    {order.orderNumber}
                  </Link>
                  <span className="block text-white/35 text-xs">{formatDate(order.createdAt)}</span>
                </td>
                <td className="py-3 pr-4 text-white/60">{order.customer?.name ?? order.contactEmail}</td>
                <td className="py-3 pr-4">
                  <Pill tone={STATUS_TONES[order.status] ?? 'warning'}>{titleCase(order.status)}</Pill>
                </td>
                <td className="py-3 pr-4">{formatPrice(order.total)}</td>
              </tr>
            ))}
          </Table>
        </Panel>

        <Panel title="Running low" description="Active products with three or fewer pieces left.">
          <Table
            head={['Product', 'Category', 'Available']}
            empty={
              data.lowStock.length === 0 ? (
                <p className="text-white/40 text-sm py-6">Stock levels are healthy.</p>
              ) : null
            }
          >
            {data.lowStock.map((product) => (
              <tr key={product.id} className="text-white/80">
                <td className="py-3 pr-4">
                  <Link to={`/admin/products/${product.id}`} className="hover:text-[#E89B3C] transition-colors">
                    {product.name}
                  </Link>
                  <span className="block text-white/35 text-xs">{product.sku}</span>
                </td>
                <td className="py-3 pr-4 text-white/60">{product.category?.name}</td>
                <td className="py-3 pr-4">
                  <Pill tone={product.stock.available === 0 ? 'danger' : 'warning'}>
                    {product.stock.available}
                  </Pill>
                </td>
              </tr>
            ))}
          </Table>
        </Panel>
      </div>
    </div>
  );
}
