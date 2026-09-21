import { motion } from 'motion/react';
import { Navigate, useParams } from 'react-router';

import { content } from '../../lib/api/index.js';
import { ErrorState, PageLoader } from '../components/Feedback.jsx';
import { useQuery } from '../hooks/useQuery.js';

/**
 * The store's policy pages. The copy lives in the CMS as a `richText` section,
 * so the owner edits it under Content without touching this file; the slugs are
 * fixed because they are linked from the footer and from emails.
 */
export const POLICY_SLUGS = {
  terms: 'policy-terms',
  privacy: 'policy-privacy',
  refunds: 'policy-refunds',
  shipping: 'policy-shipping',
};

export function Policy() {
  const { slug } = useParams();
  const pageSlug = POLICY_SLUGS[slug];

  const { data: page, loading, error, refetch } = useQuery(
    (options) => content.page(pageSlug, options),
    [pageSlug],
    { enabled: Boolean(pageSlug) },
  );

  if (!pageSlug) return <Navigate to="/404" replace />;
  if (loading) return <PageLoader label="Kabeer" />;

  if (error) {
    return (
      <main className="min-h-screen bg-[#0F2418] flex items-center justify-center">
        <ErrorState title="We could not load this page" message={error.message} onRetry={refetch} />
      </main>
    );
  }

  const body = page.sections.find((section) => section.type === 'richText')?.data ?? {
    title: page.title,
    titleAccent: '',
    body: '',
  };

  // Blank lines in the CMS textarea become paragraphs here.
  const paragraphs = String(body.body ?? '')
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 relative min-h-screen">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0F2418] via-[#0D1F15] to-[#0F2418] -z-10"></div>

      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto"
      >
        <h1 className="text-4xl sm:text-5xl text-white font-serif mb-8">
          {body.title}{' '}
          {body.titleAccent ? <span className="text-[#E89B3C] italic">{body.titleAccent}</span> : null}
        </h1>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 sm:p-12 space-y-6">
          {paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 48)} className="text-white/70 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>

        {page.updatedAt ? (
          <p className="text-white/30 text-xs mt-6">
            Last updated {new Date(page.updatedAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        ) : null}
      </motion.article>
    </main>
  );
}
