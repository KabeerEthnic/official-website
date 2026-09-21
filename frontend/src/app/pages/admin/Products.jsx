import { useState } from 'react';
import { Link } from 'react-router';

import { admin } from '../../../lib/api/index.js';
import { formatPrice, titleCase } from '../../../lib/format.js';
import { ErrorState, InlineLoader } from '../../components/Feedback.jsx';
import { Button, Pagination, Panel, Pill, StatusMessage, Table, inputClass } from '../../components/admin/ui.jsx';
import { useDebouncedValue } from '../../hooks/useDebouncedValue.js';
import { useQuery } from '../../hooks/useQuery.js';

const STATUS_TONES = { ACTIVE: 'success', DRAFT: 'warning', ARCHIVED: 'neutral' };

export function Products() {
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState(null);

  const search = useDebouncedValue(searchInput, 350);

  const { data, loading, error, refetch } = useQuery(
    (options) =>
      admin.products({ search: search || undefined, status: status || undefined, page, limit: 20 }, options),
    [search, status, page],
  );

  const archive = async (product) => {
    setMessage(null);
    try {
      await admin.archiveProduct(product.id);
      setMessage({ state: 'done', message: `${product.name} archived.` });
      refetch();
    } catch (archiveError) {
      setMessage({ state: 'error', message: archiveError.message });
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl">Products</h1>
          <p className="text-white/50 text-sm mt-1">Pricing, stock, imagery and visibility.</p>
        </div>
        <Link to="/admin/products/new">
          <Button variant="accent">New product</Button>
        </Link>
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
            placeholder="Search by name or SKU"
            aria-label="Search products"
            className={`${inputClass} max-w-xs`}
          />
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            aria-label="Filter by status"
            className={`${inputClass} max-w-[180px]`}
          >
            <option value="" className="bg-[#0F2418]">All statuses</option>
            <option value="ACTIVE" className="bg-[#0F2418]">Active</option>
            <option value="DRAFT" className="bg-[#0F2418]">Draft</option>
            <option value="ARCHIVED" className="bg-[#0F2418]">Archived</option>
          </select>
        </div>

        <StatusMessage status={message} />

        {loading ? (
          <InlineLoader />
        ) : error ? (
          <ErrorState message={error.message} onRetry={refetch} />
        ) : (
          <>
            <Table
              head={['Product', 'Category', 'Price', 'Stock', 'Status', '']}
              empty={
                data.data.length === 0 ? (
                  <p className="text-white/40 text-sm py-6">No products match this search.</p>
                ) : null
              }
            >
              {data.data.map((product) => (
                <tr key={product.id} className="text-white/80">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      {product.images[0] ? (
                        <img
                          src={product.images[0].url}
                          alt=""
                          loading="lazy"
                          className="w-10 h-12 object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-10 h-12 rounded-md bg-white/5" />
                      )}
                      <div>
                        <Link to={`/admin/products/${product.id}`} className="hover:text-[#E89B3C] transition-colors">
                          {product.name}
                        </Link>
                        <span className="block text-white/35 text-xs">{product.sku}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-white/60">{product.category?.name}</td>
                  <td className="py-3 pr-4">
                    {formatPrice(product.effectivePrice)}
                    {product.salePrice ? (
                      <span className="block text-white/35 text-xs line-through">{formatPrice(product.price)}</span>
                    ) : null}
                  </td>
                  <td className="py-3 pr-4">
                    <Pill tone={product.stock.available === 0 ? 'danger' : product.stock.lowStock ? 'warning' : 'neutral'}>
                      {product.stock.available}
                    </Pill>
                  </td>
                  <td className="py-3 pr-4">
                    <Pill tone={STATUS_TONES[product.status]}>{titleCase(product.status)}</Pill>
                  </td>
                  <td className="py-3 pr-4 text-right">
                    {product.status !== 'ARCHIVED' ? (
                      <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => archive(product)}>
                        Archive
                      </Button>
                    ) : null}
                  </td>
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
