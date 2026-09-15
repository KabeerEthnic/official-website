import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Categories } from './components/Categories';
import { FeaturedCollection } from './components/FeaturedCollection';
import { About } from './components/About';
import { Testimonials } from './components/Testimonials';
import { Newsletter } from './components/Newsletter';
import { Footer } from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Categories />
        <FeaturedCollection />
        <About />
        <Testimonials />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
