import { useState } from 'react';

import { admin } from '../../../lib/api/index.js';
import { formatDate, formatPrice } from '../../../lib/format.js';
import { ErrorState, InlineLoader } from '../../components/Feedback.jsx';
import { Button, Pagination, Panel, Pill, StatusMessage, Table, inputClass } from '../../components/admin/ui.jsx';
import { useQuery } from '../../hooks/useQuery.js';

const EMPTY = {
  code: '',
  description: '',
  discountType: 'PERCENTAGE',
  value: '10',
  minOrderValue: '0',
  maxDiscount: '',
  startsAt: '',
  expiresAt: '',
  usageLimit: '',
  perUserLimit: '',
  active: true,
};

/** Dates arrive as ISO strings; the form uses date inputs. */
const toDateInput = (value) => (value ? new Date(value).toISOString().slice(0, 10) : '');

export function Coupons() {
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  const { data, loading, error, refetch } = useQuery(
    (options) => admin.coupons({ page, limit: 20 }, options),
    [page],
  );

  const update = (key) => (event) =>
    setForm({ ...form, [key]: event.target.type === 'checkbox' ? event.target.checked : event.target.value });

  const payload = () => ({
    code: form.code,
    description: form.description || undefined,
    discountType: form.discountType,
    value: form.value,
    minOrderValue: form.minOrderValue || 0,
    maxDiscount: form.maxDiscount === '' ? null : form.maxDiscount,
    startsAt: form.startsAt === '' ? null : form.startsAt,
    expiresAt: form.expiresAt === '' ? null : form.expiresAt,
    usageLimit: form.usageLimit === '' ? null : Number(form.usageLimit),
    perUserLimit: form.perUserLimit === '' ? null : Number(form.perUserLimit),
    active: form.active,
  });

  const submit = async (event) => {
    event.preventDefault();
    setStatus({ state: 'saving', message: '' });

    try {
      if (editing) await admin.updateCoupon(editing, payload());
      else await admin.createCoupon(payload());

      setForm(EMPTY);
      setEditing(null);
      setStatus({ state: 'done', message: editing ? 'Coupon updated.' : 'Coupon created.' });
      refetch();
    } catch (saveError) {
      setStatus({ state: 'error', message: saveError.message });
    }
  };

  const edit = (coupon) => {
    setEditing(coupon.id);
    setForm({
      code: coupon.code,
      description: coupon.description ?? '',
      discountType: coupon.discountType,
      value: coupon.discountType === 'PERCENTAGE' ? String(coupon.value) : String(coupon.value / 100),
      minOrderValue: String(coupon.minOrderValue / 100),
      maxDiscount: coupon.maxDiscount === null ? '' : String(coupon.maxDiscount / 100),
      startsAt: toDateInput(coupon.startsAt),
      expiresAt: toDateInput(coupon.expiresAt),
      usageLimit: coupon.usageLimit === null ? '' : String(coupon.usageLimit),
      perUserLimit: coupon.perUserLimit === null ? '' : String(coupon.perUserLimit),
      active: coupon.active,
    });
  };

  const remove = async (coupon) => {
    if (!window.confirm(`Delete coupon ${coupon.code}?`)) return;

    try {
      const result = await admin.deleteCoupon(coupon.id);
      setStatus({ state: 'done', message: result?.meta?.message ?? 'Coupon deleted.' });
      refetch();
    } catch (deleteError) {
      setStatus({ state: 'error', message: deleteError.message });
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl">Coupons</h1>
        <p className="text-white/50 text-sm mt-1">Discount codes, limits and validity.</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Panel className="xl:col-span-2" title="All coupons">
          {loading ? (
            <InlineLoader />
          ) : error ? (
            <ErrorState message={error.message} onRetry={refetch} />
          ) : (
            <>
              <Table
                head={['Code', 'Discount', 'Minimum', 'Used', 'Valid until', 'Status', '']}
                empty={data.data.length === 0 ? <p className="text-white/40 text-sm py-6">No coupons yet.</p> : null}
              >
                {data.data.map((coupon) => (
                  <tr key={coupon.id} className="text-white/80">
                    <td className="py-3 pr-4">
                      <button type="button" onClick={() => edit(coupon)} className="hover:text-[#E89B3C] transition-colors">
                        {coupon.code}
                      </button>
                    </td>
                    <td className="py-3 pr-4">
                      {coupon.discountType === 'PERCENTAGE' ? `${coupon.value}%` : formatPrice(coupon.value)}
                    </td>
                    <td className="py-3 pr-4 text-white/55">{formatPrice(coupon.minOrderValue)}</td>
                    <td className="py-3 pr-4">
                      {coupon.usageCount}
                      {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ''}
                    </td>
                    <td className="py-3 pr-4 text-white/55">
                      {coupon.expiresAt ? formatDate(coupon.expiresAt) : 'No expiry'}
                    </td>
                    <td className="py-3 pr-4">
                      <Pill tone={coupon.active ? 'success' : 'neutral'}>{coupon.active ? 'Active' : 'Inactive'}</Pill>
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => remove(coupon)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </Table>

              <Pagination pagination={data.meta.pagination} onChange={setPage} />
            </>
          )}
        </Panel>

        <Panel
          title={editing ? 'Edit coupon' : 'New coupon'}
          actions={
            editing ? (
              <Button
                variant="ghost"
                onClick={() => {
                  setEditing(null);
                  setForm(EMPTY);
                }}
              >
                Cancel
              </Button>
            ) : null
          }
        >
          <form onSubmit={submit} className="space-y-4">
            <input required placeholder="CODE" aria-label="Coupon code" value={form.code} onChange={update('code')} className={inputClass} />
            <input placeholder="Description" aria-label="Description" value={form.description} onChange={update('description')} className={inputClass} />

            <select value={form.discountType} onChange={update('discountType')} aria-label="Discount type" className={inputClass}>
              <option value="PERCENTAGE" className="bg-[#0F2418]">Percentage off</option>
              <option value="FIXED" className="bg-[#0F2418]">Fixed amount off</option>
            </select>

            <input
              required
              type="number"
              min="1"
              step={form.discountType === 'PERCENTAGE' ? '1' : '0.01'}
              aria-label={form.discountType === 'PERCENTAGE' ? 'Percent off' : 'Amount off in rupees'}
              placeholder={form.discountType === 'PERCENTAGE' ? 'Percent off' : 'Amount off (₹)'}
              value={form.value}
              onChange={update('value')}
              className={inputClass}
            />

            <input type="number" min="0" step="0.01" placeholder="Minimum order (₹)" aria-label="Minimum order value" value={form.minOrderValue} onChange={update('minOrderValue')} className={inputClass} />
            <input type="number" min="0" step="0.01" placeholder="Maximum discount (₹)" aria-label="Maximum discount" value={form.maxDiscount} onChange={update('maxDiscount')} className={inputClass} />

            <div className="grid grid-cols-2 gap-3">
              <input type="date" aria-label="Starts on" value={form.startsAt} onChange={update('startsAt')} className={inputClass} />
              <input type="date" aria-label="Expires on" value={form.expiresAt} onChange={update('expiresAt')} className={inputClass} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input type="number" min="1" placeholder="Total uses" aria-label="Total usage limit" value={form.usageLimit} onChange={update('usageLimit')} className={inputClass} />
              <input type="number" min="1" placeholder="Per customer" aria-label="Per customer limit" value={form.perUserLimit} onChange={update('perUserLimit')} className={inputClass} />
            </div>

            <label className="flex items-center gap-2 text-sm text-white/70">
              <input type="checkbox" checked={form.active} onChange={update('active')} />
              Active
            </label>

            <StatusMessage status={status} />

            <Button type="submit" variant="accent" disabled={status.state === 'saving'}>
              {status.state === 'saving' ? 'Saving…' : editing ? 'Update coupon' : 'Create coupon'}
            </Button>
          </form>
        </Panel>
      </div>
    </div>
  );
}
