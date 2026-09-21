import { useState } from 'react';
import { Star } from 'lucide-react';
import { Link } from 'react-router';

import { catalog, reviews as reviewsApi } from '../../lib/api/index.js';
import { formatDate } from '../../lib/format.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useQuery } from '../hooks/useQuery.js';
import { InlineLoader } from './Feedback.jsx';

function Stars({ rating, className = '' }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          className={`w-3.5 h-3.5 ${value <= Math.round(rating) ? className : 'opacity-25'}`}
        />
      ))}
    </span>
  );
}

/**
 * Published reviews for a product, plus the form for writing one. New reviews
 * go to the owner for moderation before they appear, which the form says
 * plainly so nobody wonders where their words went.
 */
export function ProductReviews({ slug, productId, theme }) {
  const { isAuthenticated } = useAuth();
  const [form, setForm] = useState({ rating: 5, title: '', body: '' });
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  const { data, loading, error, refetch } = useQuery(
    (options) => catalog.reviews(slug, { limit: 10 }, options),
    [slug],
  );

  const items = data?.data ?? [];

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ state: 'saving', message: '' });

    try {
      await reviewsApi.create({ productId, ...form });
      setForm({ rating: 5, title: '', body: '' });
      setStatus({
        state: 'done',
        message: 'Thank you. Your review will appear once it has been checked.',
      });
      refetch();
    } catch (submitError) {
      setStatus({ state: 'error', message: submitError.message });
    }
  };

  return (
    <section id="reviews" className="mt-24 scroll-mt-32">
      <h2 className={theme.detailsHeading}>Reviews</h2>

      {loading ? (
        <InlineLoader tone={theme.tone} />
      ) : error ? (
        <p className={`text-sm ${theme.textMuted}`}>Reviews could not be loaded right now.</p>
      ) : items.length === 0 ? (
        <p className={`text-sm ${theme.textMuted}`}>
          No reviews yet — be the first to share your experience.
        </p>
      ) : (
        <ul className="space-y-6">
          {items.map((review) => (
            <li key={review.id} className={`border-b pb-6 ${theme.divider}`}>
              <div className="flex items-center gap-3 mb-2">
                <Stars rating={review.rating} className={theme.starColor} />
                <span className="text-sm font-medium">{review.author?.name ?? 'Customer'}</span>
                <span className={`text-xs ${theme.textMuted}`}>{formatDate(review.createdAt)}</span>
              </div>
              {review.title ? <p className="font-medium mb-1">{review.title}</p> : null}
              <p className={`text-sm leading-relaxed ${theme.textMuted}`}>{review.body}</p>
            </li>
          ))}
        </ul>
      )}

      <div className={`mt-10 pt-8 border-t ${theme.divider}`}>
        <h3 className="text-lg font-medium mb-4">Write a review</h3>

        {!isAuthenticated ? (
          <p className={`text-sm ${theme.textMuted}`}>
            <Link to="/login" className="underline">
              Sign in
            </Link>{' '}
            to share your experience with this piece.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl font-sans">
            <div>
              <label htmlFor="review-rating" className="block text-sm mb-2">
                Rating
              </label>
              <select
                id="review-rating"
                value={form.rating}
                onChange={(event) => setForm({ ...form, rating: Number(event.target.value) })}
                className={`rounded-xl px-4 py-2.5 border focus:outline-none ${theme.qtyBg}`}
              >
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>
                    {value} star{value === 1 ? '' : 's'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="review-title" className="block text-sm mb-2">
                Title <span className={theme.textMuted}>(optional)</span>
              </label>
              <input
                id="review-title"
                type="text"
                value={form.title}
                maxLength={120}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                className={`w-full rounded-xl px-4 py-2.5 border focus:outline-none ${theme.qtyBg}`}
              />
            </div>

            <div>
              <label htmlFor="review-body" className="block text-sm mb-2">
                Your review
              </label>
              <textarea
                id="review-body"
                required
                rows={4}
                minLength={10}
                maxLength={2000}
                value={form.body}
                onChange={(event) => setForm({ ...form, body: event.target.value })}
                className={`w-full rounded-xl px-4 py-2.5 border focus:outline-none ${theme.qtyBg}`}
              />
            </div>

            {status.message ? (
              <p
                role="status"
                className={`text-sm ${status.state === 'error' ? 'text-[#B88F8A]' : theme.accentText}`}
              >
                {status.message}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={status.state === 'saving'}
              className={`px-8 py-3 rounded-full text-xs font-semibold transition-all disabled:opacity-50 ${theme.buttonAccent}`}
            >
              {status.state === 'saving' ? 'Sending…' : 'Submit review'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
