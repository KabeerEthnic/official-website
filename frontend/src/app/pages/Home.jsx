import { content } from '../../lib/api/index.js';
import { About } from '../components/About.jsx';
import { Categories } from '../components/Categories.jsx';
import { ErrorBoundary } from '../components/ErrorBoundary.jsx';
import { ErrorState, PageLoader } from '../components/Feedback.jsx';
import { FeaturedCollection } from '../components/FeaturedCollection.jsx';
import { Hero } from '../components/Hero.jsx';
import { Newsletter } from '../components/Newsletter.jsx';
import { Testimonials } from '../components/Testimonials.jsx';
import { useQuery } from '../hooks/useQuery.js';

/**
 * The homepage is assembled from the CMS: the owner controls which sections
 * appear, in what order, and what they say. Each section type maps to the
 * hand-built component that owns its layout — the database supplies content,
 * the component decides how it looks.
 */
const SECTION_COMPONENTS = {
  hero: Hero,
  categoryCarousel: Categories,
  featuredCollection: FeaturedCollection,
  aboutSlides: About,
  exhibitions: Testimonials,
  newsletter: Newsletter,
};

export function Home() {
  const { data: page, loading, error, refetch } = useQuery(
    (options) => content.page('home', options),
    [],
  );

  if (loading) return <PageLoader label="Kabeer" />;

  if (error) {
    return (
      <main className="min-h-screen bg-[#0F2418] flex items-center justify-center">
        <ErrorState
          title="We could not load the boutique"
          message={error.message}
          onRetry={refetch}
        />
      </main>
    );
  }

  return (
    <main>
      {page.sections.map((section) => {
        const Section = SECTION_COMPONENTS[section.type];
        if (!Section) return null;

        return (
          <ErrorBoundary key={section.key} fallback={null}>
            <Section data={section.data} />
          </ErrorBoundary>
        );
      })}
    </main>
  );
}
