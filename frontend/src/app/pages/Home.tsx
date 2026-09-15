import { Hero } from '../components/Hero';
import { Categories } from '../components/Categories';
import { FeaturedCollection } from '../components/FeaturedCollection';
import { About } from '../components/About';
import { Testimonials } from '../components/Testimonials';
import { Newsletter } from '../components/Newsletter';

export function Home() {
  return (
    <main>
      <Hero />
      <Categories />
      <FeaturedCollection />
      <About />
      <Testimonials />
      <Newsletter />
    </main>
  );
}
