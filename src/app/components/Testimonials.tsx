import { motion, AnimatePresence } from 'motion/react';
import { useInView } from 'motion/react';
import { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Calendar } from 'lucide-react';

interface Exhibition {
  image: string;
  title: string;
  subtitle: string;
  location: string;
  year: string;
  description: string;
  // Each slide has a unique animation style
  animation: 'zoomIn' | 'panLeft' | 'panRight' | 'zoomOut' | 'panUp';
}

const exhibitions: Exhibition[] = [
  {
    image:
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80',
    title: 'India International Trade Fair',
    subtitle: 'Best Exhibitor Award',
    location: 'Pragati Maidan, New Delhi',
    year: '2025',
    description:
      'Kabeer The Ethnic Store was honored with the Best Exhibitor Award at IITF 2025, showcasing over 500 handcrafted ethnic designs to a global audience of 2 million visitors.',
    animation: 'zoomIn',
  },
  {
    image:
      'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=1200&q=80',
    title: 'Lakme Fashion Week',
    subtitle: 'Featured Collection Showcase',
    location: 'Jio World Centre, Mumbai',
    year: '2024',
    description:
      'Our exclusive Banarasi Heritage line graced the runway at LFW 2024, earning praise from leading fashion critics and establishing Kabeer as a bridge between traditional craftsmanship and contemporary design.',
    animation: 'panLeft',
  },
  {
    image:
      'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200&q=80',
    title: 'National Handloom Expo',
    subtitle: 'Excellence in Craftsmanship',
    location: 'HITEX, Hyderabad',
    year: '2024',
    description:
      'Recognized for our commitment to preserving India\'s handloom heritage, we partnered with over 200 weaver families to bring authentic regional textiles to the national stage.',
    animation: 'panRight',
  },
  {
    image:
      'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&q=80',
    title: 'Global Textile Conclave',
    subtitle: "Entrepreneur of the Year",
    location: 'BICC, Gandhinagar',
    year: '2023',
    description:
      'Our founder was awarded Entrepreneur of the Year for revolutionizing B2B ethnic wear distribution, connecting rural artisans with retailers across 500+ cities in India.',
    animation: 'zoomOut',
  },
  {
    image:
      'https://images.unsplash.com/photo-1560439514-4e9645039924?w=1200&q=80',
    title: 'Suratex International',
    subtitle: 'Innovation in Design Award',
    location: 'SVNIT Campus, Surat',
    year: '2023',
    description:
      'Kabeer introduced AI-powered trend forecasting for ethnic wear at Suratex, blending technology with tradition to help retailers stay ahead of market demands.',
    animation: 'panUp',
  },
];

// Unique Ken Burns–style animation variants for each slide
const imageAnimations = {
  zoomIn: {
    initial: { scale: 1.15, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 1.08, opacity: 0 },
  },
  panLeft: {
    initial: { x: 60, scale: 1.05, opacity: 0 },
    animate: { x: 0, scale: 1.05, opacity: 1 },
    exit: { x: -40, scale: 1.05, opacity: 0 },
  },
  panRight: {
    initial: { x: -60, scale: 1.05, opacity: 0 },
    animate: { x: 0, scale: 1.05, opacity: 1 },
    exit: { x: 40, scale: 1.05, opacity: 0 },
  },
  zoomOut: {
    initial: { scale: 0.92, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.95, opacity: 0 },
  },
  panUp: {
    initial: { y: 40, scale: 1.05, opacity: 0 },
    animate: { y: 0, scale: 1.05, opacity: 1 },
    exit: { y: -30, scale: 1.05, opacity: 0 },
  },
};

const textAnimations = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const SLIDE_DURATION = 6000; // 6 seconds per slide

export function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % exhibitions.length);
  }, []);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + exhibitions.length) % exhibitions.length);
  }, []);

  // Auto-advance timer
  useEffect(() => {
    if (isPaused || !isInView) return;

    const timer = setInterval(goNext, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [isPaused, isInView, goNext, currentIndex]);

  const current = exhibitions[currentIndex];
  const anim = imageAnimations[current.animation];

  return (
    <section
      ref={sectionRef}
      className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
    >
      {/* Premium dark green background with warm glows */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0F2418] via-[#0D1F15] to-[#0F2418]"></div>
      <div className="absolute top-1/3 left-0 w-[400px] h-[400px] bg-[#FFF5EB]/[0.03] rounded-full blur-[100px]"></div>
      <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-[#E89B3C]/[0.04] rounded-full blur-[100px]"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-[#F5E6E8]/[0.025] rounded-full blur-[80px]"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header — animated word-by-word reveal on scroll */}
        <div className="text-center mb-16 overflow-hidden">
          <h2 className="text-4xl sm:text-5xl text-white mb-4 drop-shadow-lg">
            {['Our', ''].map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 60 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
                transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="inline-block mr-3"
              >
                {word === '' ? (
                  <span className="text-[#E89B3C] font-serif italic">Journey</span>
                ) : (
                  word
                )}
              </motion.span>
            ))}
            {['of', 'Excellence'].map((word, i) => (
              <motion.span
                key={`w2-${i}`}
                initial={{ opacity: 0, y: 60 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
                transition={{ duration: 0.7, delay: 0.24 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="inline-block mr-3"
              >
                {word}
              </motion.span>
            ))}
          </h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="text-xl text-white/80 max-w-2xl mx-auto drop-shadow-sm"
          >
            Milestones that define our commitment to Indian craftsmanship
          </motion.p>
        </div>

        {/* Slideshow Container */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10"
          style={{ aspectRatio: '16 / 7' }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Image layer with Ken Burns animations */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              className="absolute inset-0"
              initial={anim.initial}
              animate={anim.animate}
              exit={anim.exit}
              transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
            >
              <img
                src={current.image}
                alt={current.title}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </AnimatePresence>

          {/* Dark overlay gradient for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/20"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

          {/* Text content overlay */}
          <div className="absolute inset-0 flex items-end p-8 sm:p-12 lg:p-16">
            <AnimatePresence mode="wait">
              <motion.div
                key={`text-${currentIndex}`}
                className="max-w-2xl"
                initial={textAnimations.initial}
                animate={textAnimations.animate}
                exit={textAnimations.exit}
                transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
              >
                {/* Year + Location badges */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E89B3C]/90 text-white text-xs font-semibold tracking-wide">
                    <Calendar className="w-3 h-3" />
                    {current.year}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white/90 text-xs">
                    <MapPin className="w-3 h-3" />
                    {current.location}
                  </span>
                </div>

                {/* Subtitle / Award */}
                <p className="text-[#E89B3C] text-sm sm:text-base uppercase tracking-widest mb-2 font-medium">
                  {current.subtitle}
                </p>

                {/* Title */}
                <h3 className="text-2xl sm:text-3xl lg:text-4xl text-white font-bold mb-4 leading-tight drop-shadow-lg">
                  {current.title}
                </h3>

                {/* Description */}
                <p className="text-white/85 text-sm sm:text-base leading-relaxed max-w-xl">
                  {current.description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation arrows — edges */}
          <button
            onClick={goPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/25 transition-all duration-300 opacity-0 hover:opacity-100 focus:opacity-100 group-hover:opacity-100"
            style={{ opacity: isPaused ? 1 : undefined }}
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/25 transition-all duration-300 opacity-0 hover:opacity-100 focus:opacity-100 group-hover:opacity-100"
            style={{ opacity: isPaused ? 1 : undefined }}
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </motion.div>

        {/* Slide indicators — below the image */}
        <div className="flex items-center justify-center gap-3 mt-8">
          {exhibitions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className="relative group"
              aria-label={`Go to slide ${index + 1}`}
            >
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  index === currentIndex
                    ? 'w-10 bg-[#E89B3C]'
                    : 'w-4 bg-white/25 hover:bg-white/50'
                }`}
              />
              {/* Auto-advance progress on active dot */}
              {index === currentIndex && !isPaused && (
                <motion.div
                  className="absolute inset-0 h-1.5 rounded-full bg-[#F5B968]/60 origin-left"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: SLIDE_DURATION / 1000, ease: 'linear' }}
                  key={`progress-${currentIndex}`}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}