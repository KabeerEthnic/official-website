import { useState } from 'react';
import { Star } from 'lucide-react';
import { Link, useSearchParams } from 'react-router';

import { admin } from '../../../lib/api/index.js';
import { formatDate, titleCase } from '../../../lib/format.js';
import { ErrorState, InlineLoader } from '../../components/Feedback.jsx';
import { Button, Pagination, Panel, Pill, StatusMessage, inputClass } from '../../components/admin/ui.jsx';
import { useQuery } from '../../hooks/useQuery.js';

const TONES = { APPROVED: 'success', REJECTED: 'danger', PENDING: 'warning' };

export function Reviews() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  const filter = searchParams.get('status') ?? '';

  const { data, loading, error, refetch } = useQuery(
    (options) => admin.reviews({ status: filter || undefined, page, limit: 20 }, options),
    [filter, page],
  );

  const moderate = async (review, next) => {
    setStatus({ state: 'saving', message: '' });
    try {
      await admin.moderateReview(review.id, next);
      setStatus({ state: 'done', message: `Review ${next.toLowerCase()}.` });
      refetch();
    } catch (moderateError) {
      setStatus({ state: 'error', message: moderateError.message });
    }
  };

  const remove = async (review) => {
    if (!window.confirm('Delete this review permanently?')) return;

    try {
      await admin.deleteReview(review.id);
      setStatus({ state: 'done', message: 'Review deleted.' });
      refetch();
    } catch (deleteError) {
      setStatus({ state: 'error', message: deleteError.message });
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl">Reviews</h1>
        <p className="text-white/50 text-sm mt-1">
          Nothing appears on the storefront until it is approved here.
        </p>
      </header>

      <Panel>
        <div className="flex flex-wrap gap-3 mb-6">
          <select
            value={filter}
            onChange={(event) => {
              setSearchParams(event.target.value ? { status: event.target.value } : {});
              setPage(1);
            }}
            aria-label="Filter by moderation status"
            className={`${inputClass} max-w-[200px]`}
          >
            <option value="" className="bg-[#0F2418]">All reviews</option>
            <option value="PENDING" className="bg-[#0F2418]">Awaiting moderation</option>
            <option value="APPROVED" className="bg-[#0F2418]">Approved</option>
            <option value="REJECTED" className="bg-[#0F2418]">Rejected</option>
          </select>
        </div>

        <StatusMessage status={status} />

        {loading ? (
          <InlineLoader />
        ) : error ? (
          <ErrorState message={error.message} onRetry={refetch} />
        ) : data.data.length === 0 ? (
          <p className="text-white/40 text-sm py-6">No reviews here.</p>
        ) : (
          <>
            <ul className="space-y-4 mt-4">
              {data.data.map((review) => (
                <li key={review.id} className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="inline-flex items-center gap-1 text-[#E89B3C]">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <Star
                          key={value}
                          className={`w-3.5 h-3.5 ${value <= review.rating ? 'fill-[#E89B3C]' : 'opacity-25'}`}
                        />
                      ))}
                    </span>
                    <Pill tone={TONES[review.status]}>{titleCase(review.status)}</Pill>
                    <span className="text-white/45 text-xs">{formatDate(review.createdAt)}</span>
                    {review.product ? (
                      <Link
                        to={`/product/${review.product.slug}`}
                        className="text-white/55 text-xs hover:text-[#E89B3C] transition-colors"
                      >
                        {review.product.name}
                      </Link>
                    ) : null}
                  </div>

                  {review.title ? <p className="text-white font-medium mb-1">{review.title}</p> : null}
                  <p className="text-white/65 text-sm leading-relaxed mb-4">{review.body}</p>
                  <p className="text-white/35 text-xs mb-4">— {review.author?.name ?? 'Customer'}</p>

                  <div className="flex flex-wrap gap-2">
                    {review.status !== 'APPROVED' ? (
                      <Button variant="accent" className="px-4 py-1.5 text-xs" onClick={() => moderate(review, 'APPROVED')}>
                        Approve
                      </Button>
                    ) : null}
                    {review.status !== 'REJECTED' ? (
                      <Button variant="ghost" className="px-4 py-1.5 text-xs" onClick={() => moderate(review, 'REJECTED')}>
                        Reject
                      </Button>
                    ) : null}
                    <Button variant="danger" className="px-4 py-1.5 text-xs" onClick={() => remove(review)}>
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>

            <Pagination pagination={data.meta.pagination} onChange={setPage} />
          </>
        )}
      </Panel>
    </div>
  );
}
