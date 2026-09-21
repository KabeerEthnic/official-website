import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Check, Filter, Heart, Search, Star } from 'lucide-react';
import { Link, useSearchParams } from 'react-router';

import { catalog, content } from '../../lib/api/index.js';
import { toDisplayProduct } from '../../lib/product.js';
import { Footer } from '../components/Footer.jsx';
import { BagsSection } from '../components/BagsSection.jsx';
import { ErrorState, InlineLoader } from '../components/Feedback.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useDebouncedValue } from '../hooks/useDebouncedValue.js';
import { useQuery } from '../hooks/useQuery.js';
import heroSuitsImg from '../../imports/hero-suits.jpg';
import heroCordsetImg from '../../imports/hero-cordset.jpg';

/**
 * Price brackets offered in the sidebar. Values are rupees for the label and
 * paise for the API, which is what the backend filters on.
 */
const priceRanges = [
  { label: 'All Prices', min: null, max: null },
  { label: 'Under ₹10,000', min: 0, max: 10000 },
  { label: '₹10,000 - ₹20,000', min: 10000, max: 20000 },
  { label: 'Above ₹20,000', min: 20000, max: null }
];

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Top rated' }
];

const PAGE_SIZE = 12;

/**
 * Each collection has its own hand-built layout, chosen by category slug.
 * A category the owner adds later falls back to the standard grid.
 */
const LAYOUTS = { bags: 'bags', suits: 'suits', kurtis: 'kurtis', 'cord-sets': 'cord-sets' };

/**
 * Styling for the standard grid layout. The bags, suits, kurtis and cord-set
 * collections each render their own hand-built layout instead, so this is the
 * only palette the grid needs.
 */
const theme = {
  bg: 'bg-gradient-to-b from-[#0F2418] via-[#0D1F15] to-[#0F2418] text-white',
  sidebarTitle: 'text-white border-white/10 font-serif',
  sidebarText: 'text-white/60 hover:text-white',
  sidebarDot: 'bg-[#E89B3C]',
  accentText: 'text-[#E89B3C]',
  headingFont: 'font-serif text-white',
  cardBg: 'bg-white/5 border-white/10 hover:border-[#E89B3C]/50 text-white',
  title: 'Collections',
  desc: 'Explore our curated selection of timeless ethnic wear',
  pillActive: 'bg-[#E89B3C] text-white border-[#E89B3C]',
  pillInactive: 'bg-white/5 border-white/10 text-white/70 hover:border-white/30 hover:text-white',
  divider: 'border-white/10',
};

/* Dupatta Ripple — realistic fabric folds confined to bottom text area only */
function DupattaRipple() {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-[45%] pointer-events-none z-10 overflow-hidden">
      <svg className="w-full h-full" viewBox="0 0 1440 400" fill="none" preserveAspectRatio="none">
        <defs>
          {/* Soft rose silk gradient — dupatta fabric feel */}
          <linearGradient id="dupFabric1" x1="0%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#D4A0A8" stopOpacity="0.55" />
            <stop offset="35%" stopColor="#C8929A" stopOpacity="0.4" />
            <stop offset="70%" stopColor="#E8C4C8" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#FAF8F5" stopOpacity="0.05" />
          </linearGradient>
          {/* Gold-thread accent — like zari embroidery shimmer */}
          <linearGradient id="dupFabric2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E3A857" stopOpacity="0.3" />
            <stop offset="40%" stopColor="#D4A070" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#FAF8F5" stopOpacity="0" />
          </linearGradient>
          {/* Deepest fold — shadow layer */}
          <linearGradient id="dupFabric3" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#B87D85" stopOpacity="0.35" />
            <stop offset="50%" stopColor="#C59199" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#FAF8F5" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Fold 1 — outermost, lightest drape flowing from left to right */}
        <motion.path
          d="M -50 0 C 200 60, 350 -20, 550 40 C 750 100, 900 20, 1100 70 C 1250 110, 1350 30, 1500 50 L 1500 400 L -50 400 Z"
          fill="url(#dupFabric1)"
          animate={{
            d: [
              'M -50 0 C 200 60, 350 -20, 550 40 C 750 100, 900 20, 1100 70 C 1250 110, 1350 30, 1500 50 L 1500 400 L -50 400 Z',
              'M -50 30 C 150 -10, 400 80, 600 20 C 800 -30, 950 90, 1150 40 C 1300 0, 1400 70, 1500 30 L 1500 400 L -50 400 Z',
              'M -50 0 C 200 60, 350 -20, 550 40 C 750 100, 900 20, 1100 70 C 1250 110, 1350 30, 1500 50 L 1500 400 L -50 400 Z'
            ]
          }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
        />

        {/* Fold 2 — middle fabric crease with gold thread shimmer */}
        <motion.path
          d="M -50 60 C 180 120, 400 40, 650 100 C 850 150, 1000 70, 1200 120 C 1350 160, 1420 90, 1500 110 L 1500 400 L -50 400 Z"
          fill="url(#dupFabric2)"
          animate={{
            d: [
              'M -50 60 C 180 120, 400 40, 650 100 C 850 150, 1000 70, 1200 120 C 1350 160, 1420 90, 1500 110 L 1500 400 L -50 400 Z',
              'M -50 90 C 220 40, 450 130, 700 60 C 900 10, 1050 120, 1250 80 C 1380 50, 1440 130, 1500 90 L 1500 400 L -50 400 Z',
              'M -50 60 C 180 120, 400 40, 650 100 C 850 150, 1000 70, 1200 120 C 1350 160, 1420 90, 1500 110 L 1500 400 L -50 400 Z'
            ]
          }}
          transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
        />

        {/* Fold 3 — deepest fold shadow creating realistic depth */}
        <motion.path
          d="M -50 120 C 250 170, 500 100, 750 160 C 950 200, 1100 130, 1300 180 C 1400 200, 1450 150, 1500 170 L 1500 400 L -50 400 Z"
          fill="url(#dupFabric3)"
          animate={{
            d: [
              'M -50 120 C 250 170, 500 100, 750 160 C 950 200, 1100 130, 1300 180 C 1400 200, 1450 150, 1500 170 L 1500 400 L -50 400 Z',
              'M -50 150 C 200 100, 550 190, 800 130 C 1000 80, 1150 200, 1350 140 C 1420 120, 1460 190, 1500 150 L 1500 400 L -50 400 Z',
              'M -50 120 C 250 170, 500 100, 750 160 C 950 200, 1100 130, 1300 180 C 1400 200, 1450 150, 1500 170 L 1500 400 L -50 400 Z'
            ]
          }}
          transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut' }}
        />
      </svg>
    </div>
  );
}

/* Image Slideshow Component for lookbook */
function ProductSlideshow({ images, alt = 'Lookbook image' }) {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    if (images.length < 2) return undefined;

    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % images.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [images.length]);

  if (images.length === 0) return <div className="w-full h-full bg-[#F3EFE9]" />;

  return (
    <div className="w-full h-full relative group">
      <AnimatePresence mode="wait">
        <motion.img
          key={currentIdx}
          src={images[currentIdx]}
          alt={alt}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
          className="w-full h-full object-cover object-top"
        />
      </AnimatePresence>

      {/* Manual Slide Dots */}
      <div className="absolute bottom-10 left-10 flex gap-2.5 z-10 bg-[#FAF8F5]/80 backdrop-blur-sm px-4 py-2.5 rounded-full border border-black/5">
        {images.map((_, idx) => {
          const isActive = currentIdx === idx;
          return (
            <button
              key={idx}
              onClick={() => setCurrentIdx(idx)}
              className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${isActive ? 'bg-[#2D2A26] scale-125' : 'bg-[#2D2A26]/30 hover:bg-[#2D2A26]/60'
                }`}
              aria-label={`Slide ${idx + 1}`}
            />
          );
        })}
      </div>
    </div>
  );
}


/* HIGH END CONTEMPORARY KURTIS LAYOUT CARD */
function KurtiCard({ product, onToggleSave, isSaved }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col bg-[#FCFAF7] border border-[#2D2A26]/5 rounded-[24px] overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:border-[#E89B3C]/20 transition-all duration-500 w-full"
    >
      <Link to={`/product/${product.slug}`} className="block relative aspect-[4/5] w-full overflow-hidden bg-[#F3EFE9]">
        <img
          src={product.images[0]}
          alt={product.imageAlts[0] ?? product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Tag */}
        {product.tag && (
          <span className="absolute top-4 left-4 text-[9px] uppercase tracking-widest font-semibold px-3 py-1.5 rounded-full bg-white border border-[#2D2A26]/5 text-[#2D2A26] shadow-sm">
            {product.tag}
          </span>
        )}
      </Link>

      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
        <button
          type="button"
          onClick={() => onToggleSave(product.id)}
          aria-label={isSaved(product.id) ? 'Remove from wishlist' : 'Save to wishlist'}
          className="bg-white/95 backdrop-blur-sm p-2.5 rounded-full shadow-lg text-gray-800"
        >
          <Heart className={`w-4 h-4 ${isSaved(product.id) ? 'fill-[#E89B3C] text-[#E89B3C]' : ''}`} />
        </button>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <span className="text-[10px] tracking-wider text-[#8C7E7A] uppercase mb-1.5 font-semibold">
          {product.subtitle}
        </span>

        <Link to={`/product/${product.slug}`}>
          <h3 className="font-cormorant text-2xl font-semibold text-[#2D2A26] group-hover:text-[#E89B3C] transition-colors duration-300 uppercase tracking-wide mb-2">
            {product.name}
          </h3>
        </Link>

        <p className="text-[#8C7E7A] text-xs font-light leading-relaxed mb-4 flex-1 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center gap-1 mb-4">
          <Star className="w-3.5 h-3.5 text-[#E3A857] fill-[#E3A857]" />
          <span className="text-xs font-semibold text-[#2D2A26]">{product.rating}</span>
          <span className="text-xs text-[#8C7E7A] opacity-60">({product.reviews})</span>
        </div>

        <div className="flex items-center justify-between border-t border-[#2D2A26]/5 pt-4 mt-auto">
          <span className="text-lg font-bold text-[#2D2A26]">{product.price}</span>
          <Link
            to={`/product/${product.slug}`}
            className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold px-4 py-2.5 rounded-full bg-[#2D2A26] text-white hover:bg-[#E89B3C] hover:text-white transition-all duration-300 shadow-sm"
          >
            Show details
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

/* HIGH END DYNAMIC THREE-PANEL EDITORIAL HERO */
function KurtisHero({ content = {} }) {
  const {
    eyebrow = '',
    title = '',
    titleAccent = '',
    quote = '',
    promoBadge = '',
    promoTitle = '',
    promoDescription = '',
    promoCode = '',
    leftPanel = {},
    centerPanel = {},
    rightPanel = {},
  } = content;

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 h-auto md:h-screen w-full bg-[#FAF8F5] text-[#2D2A26] border-b border-[#2D2A26]/5 relative">

      {/* Left Panel - Pink Kurta */}
      <div className="col-span-1 md:col-span-3 h-[450px] md:h-full relative overflow-hidden border-r border-[#2D2A26]/5 group">
        <motion.img
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src={leftPanel.imageUrl}
          alt={leftPanel.title}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors duration-500" />
        <div className="absolute bottom-6 left-6 text-white z-10 font-sans">
          <p className="text-[10px] tracking-[0.2em] uppercase font-semibold text-white/80">{leftPanel.label}</p>
          <h4 className="font-cormorant text-xl font-bold tracking-wide mt-1">{leftPanel.title}</h4>
        </div>
      </div>

      {/* Middle Panel - Wider - Lively Text and Center Image */}
      <div className="col-span-1 md:col-span-6 h-auto md:h-full flex flex-col justify-between border-r border-[#2D2A26]/5 bg-[#FCFAF7] p-8 md:p-12">
        {/* Top Half: Lively Text (Kabeer & Discount Context) */}
        <div className="flex flex-col justify-center flex-1 py-10 max-w-xl mx-auto text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-[#8C7E7A] tracking-[0.4em] uppercase text-xs font-semibold block mb-4"
          >
            {eyebrow}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-cormorant text-4xl sm:text-5xl lg:text-[4.5rem] text-[#2D2A26] font-light uppercase tracking-wide leading-[0.95]"
          >
            {title} <span className="italic font-extralight text-[#8C7E7A]">{titleAccent}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-[#8C7E7A] text-sm md:text-base font-light italic mt-5 font-cormorant leading-relaxed"
          >
            {quote}
          </motion.p>

          {/* Lively Discount Segment */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, delay: 0.3 }}
            className="mt-8 p-6 rounded-2xl bg-[#7F8C76]/5 border border-[#7F8C76]/20 relative overflow-hidden group shadow-sm max-w-md mx-auto"
          >
            {/* Soft background pulse */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#7F8C76]/0 via-[#7F8C76]/5 to-[#7F8C76]/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7F8C76]/10 text-[#7F8C76] font-bold text-[10px] tracking-wider uppercase mb-2">
                {promoBadge}
              </span>
              <h3 className="font-cormorant text-2xl font-bold text-[#2D2A26] mb-1">
                {promoTitle}
              </h3>
              <p className="text-xs text-[#8C7E7A] font-sans">
                {promoDescription}{' '}
                {promoCode ? <span className="font-semibold text-[#7F8C76]">{promoCode}</span> : null}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Bottom Half: Center Image - Lucknowi Chikankari Peach Kurta */}
        <div className="h-[250px] sm:h-[350px] md:h-[45%] w-full relative overflow-hidden rounded-[20px] shadow-[0_10px_35px_rgba(0,0,0,0.04)] group mt-auto">
          <motion.img
            initial={{ scale: 1.05, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.3 }}
            src={centerPanel.imageUrl}
            alt={centerPanel.title}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            style={{ objectPosition: '50% 25%' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-80" />
          <div className="absolute bottom-5 left-6 text-white z-10 font-sans">
            <p className="text-[10px] tracking-[0.2em] uppercase font-semibold text-white/80">{centerPanel.label}</p>
            <h4 className="font-cormorant text-xl font-bold tracking-wide mt-1">{centerPanel.title}</h4>
          </div>
        </div>
      </div>

      {/* Right Panel - Royal Blue Kurta */}
      <div className="col-span-1 md:col-span-3 h-[450px] md:h-full relative overflow-hidden group">
        <motion.img
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.15 }}
          src={rightPanel.imageUrl}
          alt={rightPanel.title}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors duration-500" />
        <div className="absolute bottom-6 left-6 text-white z-10 font-sans">
          <p className="text-[10px] tracking-[0.2em] uppercase font-semibold text-white/80">{rightPanel.label}</p>
          <h4 className="font-cormorant text-xl font-bold tracking-wide mt-1">{rightPanel.title}</h4>
        </div>
      </div>

    </div>
  );
}

/* HIGH END DYNAMIC KURTIS LOOKBOOK & SHOPPING PAGE */
function KurtisCollection({ products, content, loading, error, onRetry, onToggleSave, isSaved }) {
  // Group kurtis into rows of 3
  const rows = useMemo(() => {
    const res = [];
    for (let i = 0; i < products.length; i += 3) {
      res.push(products.slice(i, i + 3));
    }
    return res;
  }, [products]);

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] text-[#2D2A26] flex flex-col font-sans overflow-x-hidden">

      {/* Dynamic Three-Panel Hero Section */}
      <KurtisHero content={content} />

      {/* Staggered Interlocking Product Grid */}
      <div className="w-full max-w-[1400px] mx-auto px-6 sm:px-12 md:px-16 pt-36 pb-48">
        <div className="text-center mb-28">
          <span className="text-[#8C7E7A] tracking-[0.4em] uppercase text-xs font-semibold block mb-4">
            Curated Interlock
          </span>
          <h2 className="font-cormorant text-5xl md:text-6xl text-[#2D2A26] font-light uppercase tracking-wider leading-tight">
            THE STAGGERED EDIT
          </h2>
          <div className="w-16 border-b border-[#2D2A26]/10 mx-auto mt-6" />
        </div>

        {loading ? (
          <InlineLoader tone="ivory" />
        ) : error ? (
          <ErrorState tone="ivory" message={error.message} onRetry={onRetry} />
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg opacity-60">No Kurtis found matching your current filters.</p>
          </div>
        ) : (
          <div className="space-y-36 md:space-y-48">
            {rows.map((row, rowIdx) => (
              <div key={rowIdx} className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-12 items-start relative">

                {/* Column 1: Left (Standard Height) */}
                {row[0] && (
                  <div className="flex flex-col">
                    <KurtiCard product={row[0]} onToggleSave={onToggleSave} isSaved={isSaved} />
                  </div>
                )}

                {/* Column 2: Center (Staggered/Shifted Down) */}
                {row[1] && (
                  <div className="flex flex-col md:translate-y-[150px] md:mb-[150px] relative z-10">
                    <KurtiCard product={row[1]} onToggleSave={onToggleSave} isSaved={isSaved} />
                  </div>
                )}

                {/* Column 3: Right (Standard Height) */}
                {row[2] && (
                  <div className="flex flex-col">
                    <KurtiCard product={row[2]} onToggleSave={onToggleSave} isSaved={isSaved} />
                  </div>
                )}

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Simplified Global Footer */}
      <Footer isIvoryTheme={true} />
    </div>
  );
}

/* ======================================================================
   CORD SET COLLECTION — Dark moody editorial with split-screen hero,
   infinite marquee, and clean 2-column grid with hover reveals.
   ====================================================================== */

function CordSetHero({ content = {} }) {
  const {
    badge = '',
    eyebrow = '',
    title = '',
    titleAccent = '',
    tagline = '',
    taglineMuted = '',
    ctaLabel = '',
    imageUrl = '',
    marquee = [],
    stats = [],
  } = content;

  return (
    <>
      {/* CSS animations for the marquee */}
      <style>{`
        @keyframes marqueeScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .cord-marquee {
          animation: marqueeScroll 25s linear infinite;
        }
        .cord-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* SPLIT-SCREEN HERO */}
      <div className="w-full min-h-screen flex flex-col md:flex-row relative overflow-hidden">

        {/* LEFT HALF — Hero Image */}
        <div className="w-full md:w-[55%] h-[60vh] md:h-screen relative overflow-hidden">
          <motion.img
            src={imageUrl || heroCordsetImg}
            alt="Cord Set Collection Hero"
            className="w-full h-full object-cover object-top"
            initial={{ scale: 1.12 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
          />
          {/* Dark gradient overlay from right edge for blending */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#141414]/80" />
          {/* Bottom gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-[30%] bg-gradient-to-t from-[#141414] to-transparent" />

          {/* Season badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="absolute top-8 left-8 z-10"
          >
            <span className="text-[10px] tracking-[0.35em] uppercase font-medium text-white/90 bg-white/10 backdrop-blur-md border border-white/15 px-5 py-2.5 rounded-full">
              {badge}
            </span>
          </motion.div>
        </div>

        {/* RIGHT HALF — Typography & CTA */}
        <div className="w-full md:w-[45%] h-auto md:h-screen bg-[#141414] flex flex-col justify-center items-start px-10 md:px-16 lg:px-20 py-16 md:py-0 relative">

          {/* Subtle decorative vertical line */}
          <div className="absolute left-0 top-[15%] bottom-[15%] w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent hidden md:block" />

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10"
          >
            {/* Label */}
            <span className="text-[11px] tracking-[0.5em] uppercase text-[#C8A97E] font-medium block mb-8">
              {eyebrow}
            </span>

            {/* Oversized Title */}
            <h1 className="font-cormorant text-[4rem] sm:text-[5rem] md:text-[5.5rem] lg:text-[7rem] leading-[0.85] font-extralight text-white uppercase tracking-tight">
              {title}
              <br />
              <span className="font-cormorant italic font-light text-[#C8A97E]">
                {titleAccent}
              </span>
            </h1>

            {/* Subtle divider */}
            <div className="w-16 border-b border-white/15 mt-8 mb-8" />

            {/* Tagline */}
            <p className="text-white/50 text-sm sm:text-base font-light tracking-wide leading-relaxed max-w-sm">
              {tagline}
              <br />
              <span className="text-white/30">{taglineMuted}</span>
            </p>

            {/* CTA Button */}
            <motion.a
              href="#cord-set-collection"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="mt-10 group inline-flex items-center gap-3 text-[13px] tracking-[0.2em] uppercase text-white border border-white/20 hover:border-[#C8A97E] hover:text-[#C8A97E] px-8 py-4 rounded-full transition-all duration-500 cursor-pointer"
            >
              {ctaLabel}
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </motion.a>

            {/* Stats */}
            <div className="flex gap-10 mt-14">
              {stats.map((stat, index) => (
                <div key={`${stat.label}-${index}`} className="flex gap-10">
                  {index > 0 && <div className="w-[1px] bg-white/10" />}
                  <div>
                    <span
                      className={`text-2xl font-cormorant font-light ${stat.accent ? 'text-[#C8A97E]' : 'text-white'}`}
                    >
                      {stat.value}
                    </span>
                    <span className="block text-[10px] tracking-[0.3em] uppercase text-white/30 mt-1">
                      {stat.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </motion.div>

          {/* Atmospheric glow */}
          <div className="absolute -bottom-20 -right-20 w-[300px] h-[300px] bg-[#C8A97E]/5 rounded-full blur-[100px] pointer-events-none" />
        </div>

      </div>

      {/* HORIZONTAL MARQUEE STRIP */}
      <div className="w-full bg-[#1A1A1A] border-y border-white/5 py-5 overflow-hidden">
        <div className="cord-marquee flex whitespace-nowrap">
          {[...Array(2)].map((_, dupeIdx) => (
            <div key={dupeIdx} className="flex items-center gap-0 shrink-0">
              {marquee.map((text, i) => (
                <span key={i} className="flex items-center gap-6 px-6">
                  <span className="text-[13px] tracking-[0.4em] uppercase font-light text-white/40">{text}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C8A97E]/50" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* Cord Set Product Card — Dark themed with hover reveal */
function CordSetCard({ product, index, onToggleSave, isSaved }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay: index % 2 === 1 ? 0.15 : 0, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative overflow-hidden rounded-2xl bg-[#1E1E1E] ${index % 2 === 1 ? 'md:translate-y-12' : ''
        }`}
    >
      <Link to={`/product/${product.slug}`} className="block relative aspect-[3/4] w-full overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Dark overlay at bottom for text */}
        <div className="absolute bottom-0 left-0 right-0 h-[50%] bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {/* Tag badge */}
        {product.tag && (
          <span className="absolute top-5 left-5 text-[9px] uppercase tracking-[0.3em] font-semibold px-4 py-1.5 rounded-full bg-[#C8A97E] text-[#141414] z-10">
            {product.tag}
          </span>
        )}

        {/* Wishlist button */}
        <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              onToggleSave(product.id);
            }}
            aria-label={isSaved(product.id) ? 'Remove from wishlist' : 'Save to wishlist'}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer border border-white/10"
          >
            <Heart
              className={`w-4 h-4 ${isSaved(product.id) ? 'fill-[#C8A97E] text-[#C8A97E]' : 'text-white'}`}
            />
          </button>
        </div>

        {/* Product info at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
          {/* Always visible */}
          <p className="text-[10px] tracking-[0.35em] uppercase text-[#C8A97E] mb-2">{product.subtitle}</p>
          <h3 className="font-cormorant text-2xl sm:text-3xl text-white font-light tracking-wide">{product.name}</h3>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-lg font-light text-white">{product.price}</span>
            <span className="flex items-center gap-1 text-[#C8A97E]">
              <Star className="w-3 h-3 fill-[#C8A97E]" />
              <span className="text-xs">{product.rating}</span>
            </span>
          </div>

          {/* Hover reveal details */}
          <motion.div
            className="overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            whileHover={{ height: 'auto', opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="pt-4 mt-4 border-t border-white/10">
              <p className="text-white/50 text-xs leading-relaxed line-clamp-2 mb-4">{product.description}</p>
              <div className="flex flex-wrap gap-2">
                {product.details?.slice(0, 3).map((d, i) => (
                  <span key={i} className="text-[9px] tracking-wider uppercase px-3 py-1 rounded-full border border-white/10 text-white/40">
                    {d.value}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </Link>
    </motion.div>
  );
}

/* Dark Themed Cord Set Collection Page */
function CordSetCollection({ products, content, loading, error, onRetry, onToggleSave, isSaved }) {
  return (
    <div className="w-full min-h-screen bg-[#141414] text-white flex flex-col font-sans overflow-x-hidden">

      {/* Split-Screen Hero + Marquee */}
      <CordSetHero content={content} />

      {/* SECTION HEADER */}
      <div className="w-full max-w-[1200px] mx-auto px-6 sm:px-10 md:px-16 pt-28 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <span className="text-[10px] tracking-[0.5em] uppercase text-[#C8A97E]/70 font-medium block mb-4">
            The Full Collection
          </span>
          <h2 className="font-cormorant text-4xl md:text-6xl text-white font-extralight uppercase tracking-wider leading-tight">
            COORDINATED ELEGANCE
          </h2>
          <div className="w-16 border-b border-[#C8A97E]/30 mx-auto mt-6" />
          <p className="text-white/30 text-sm mt-6 max-w-lg mx-auto">
            Each set is a complete story — designed so the top and bottom speak the same language of luxury.
          </p>
        </motion.div>
      </div>

      {/* 2-COLUMN PRODUCT GRID */}
      <div id="cord-set-collection" className="w-full max-w-[1200px] mx-auto px-6 sm:px-10 md:px-16 pb-32">
        {loading ? (
          <InlineLoader />
        ) : error ? (
          <ErrorState message={error.message} onRetry={onRetry} />
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-white/40">No Cord Sets found matching your current filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {products.map((product, idx) => (
              <CordSetCard
                key={product.id}
                product={product}
                index={idx}
                onToggleSave={onToggleSave}
                isSaved={isSaved}
              />
            ))}
          </div>
        )}
      </div>

      {/* Dark Footer */}
      <Footer isIvoryTheme={false} />
    </div>
  );
}

function SuitsLookbook({ products, content = {}, loading, error, onRetry, onAddToCart, adding }) {
  const { eyebrow = '', title = '', subtitle = '', imageUrl = '' } = content;

  // The headline is written as "LEFT | RIGHT"; the divider keeps its own style.
  const titleParts = title.split('|').map((part) => part.trim());

  return (
    <div className="snap-y snap-mandatory h-screen overflow-y-auto w-full select-none scroll-smooth">

      {/* 8-second shining effect styles */}
      <style>{`
        .available-pill-shimmer {
          position: relative;
          overflow: hidden;
        }
        .available-pill-shimmer::after {
          content: '';
          position: absolute;
          top: 0;
          left: -150%;
          width: 50%;
          height: 100%;
          background: linear-gradient(
            to right,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.4) 30%,
            rgba(255, 255, 255, 0.7) 50%,
            rgba(255, 255, 255, 0.4) 70%,
            rgba(255, 255, 255, 0) 100%
          );
          transform: skewX(-25deg);
          animation: pillshine 8s infinite ease-in-out;
        }
        @keyframes pillshine {
          0% { left: -150%; }
          15% { left: 150%; }
          100% { left: 150%; }
        }
      `}</style>

      {/* HERO SECTION — Clean full-screen image with faded edges, text at BOTTOM */}
      <div className="snap-start h-screen w-full relative overflow-hidden bg-[#FAF8F5]">

        {/* Full-screen hero image — the 3 women in garden */}
        <div className="absolute inset-0 z-0">
          <img
            src={imageUrl || heroSuitsImg}
            alt="Three women showcasing exclusive suits"
            className="w-full h-full object-cover"
            style={{ objectPosition: '50% 15%' }}
          />
          {/* Faded edges on all sides for smooth merging */}
          <div className="absolute inset-0 pointer-events-none" style={{
            boxShadow: 'inset 0 0 120px 60px #FAF8F5, inset 0 80px 80px -40px #FAF8F5, inset 0 -80px 80px -40px #FAF8F5'
          }} />
          {/* Extra bottom fade for text readability */}
          <div className="absolute bottom-0 left-0 right-0 h-[32%] bg-gradient-to-t from-[#FAF8F5] via-[#FAF8F5]/60 to-transparent" />
        </div>

        {/* Dupatta fabric ripple — ONLY behind the bottom text area */}
        <DupattaRipple />

        {/* Text anchored at the BOTTOM of hero */}
        <div className="absolute bottom-0 left-0 right-0 z-20 px-8 sm:px-16 pb-8 pt-16">
          <div className="max-w-3xl mx-auto">
            <span className="text-[#8C7E7A] tracking-[0.4em] uppercase text-xs font-sans font-semibold block mb-3">{eyebrow}</span>

            <h1 className="font-cormorant text-4xl md:text-6xl lg:text-7xl text-[#2D2A26] font-light uppercase tracking-wide leading-[0.95]">
              {titleParts[0]}
              {titleParts.length > 1 ? (
                <>
                  {' '}
                  <span className="text-[#8C7E7A] font-extralight font-sans">|</span> {titleParts[1]}
                </>
              ) : null}
            </h1>

            <p className="text-[#8C7E7A] text-sm md:text-base font-light italic max-w-lg mt-3 font-cormorant">
              {subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* INDIVIDUAL SUIT PANELS (Snap-viewport height lookbook layout) */}
      {loading || error || products.length === 0 ? (
        <div className="snap-start h-screen w-full bg-[#FAF8F5] flex items-center justify-center">
          {loading ? (
            <InlineLoader tone="ivory" />
          ) : error ? (
            <ErrorState tone="ivory" message={error.message} onRetry={onRetry} />
          ) : (
            <p className="text-lg text-[#8C7E7A]">No suits match your current filters.</p>
          )}
        </div>
      ) : null}

      {products.map((product) => (
        <div
          key={product.id}
          className="snap-start h-screen w-full flex flex-col md:flex-row items-center justify-between relative overflow-hidden bg-[#FAF8F5]"
        >
          {/* LEFT HALF: 45% screen width, 100% height - Slideshow with soft rounded edges */}
          <div className="w-full md:w-[45vw] h-1/2 md:h-full p-4 md:p-8 flex-shrink-0">
            <div className="w-full h-full rounded-[24px] md:rounded-[32px] overflow-hidden shadow-[0_12px_48px_rgba(0,0,0,0.06)] bg-[#F3EFE9]">
              <ProductSlideshow images={product.images} alt={product.name} />
            </div>
          </div>

          {/* RIGHT HALF: 55% screen width, 100% height - Editorial Details */}
          <div className="w-full md:w-[55vw] h-1/2 md:h-full flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-10 overflow-y-auto bg-[#FAF8F5]">

            {/* Tag/Badge info */}
            <span className="text-[#8C7E7A] font-sans text-xs tracking-[0.3em] uppercase mb-4 block font-semibold">
              {product.tag} EDITION
            </span>

            {/* Premium Header */}
            <h2 className="font-cormorant text-4xl sm:text-5xl lg:text-6xl text-[#2D2A26] font-light tracking-wide uppercase leading-tight mb-4">
              {product.name} <span className="font-extralight text-[#8C7E7A]/60">|</span> <span className="italic">{product.subtitle}</span>
            </h2>

            {/* Description */}
            <p className="text-[#8C7E7A] text-base lg:text-lg leading-relaxed mb-8 font-sans">
              {product.description}
            </p>

            {/* Available capsule having a shine every 8 seconds */}
            <div className="mb-8 font-sans">
              {product.stockPercentage === null ? (
                <div className="inline-flex items-center gap-3 bg-[#7F8C76]/10 text-[#7F8C76] font-semibold text-xs px-5 py-2.5 rounded-full border border-[#7F8C76]/20 shadow-sm">
                  <span>{product.inStock ? 'AVAILABLE TO ORDER' : 'CURRENTLY SOLD OUT'}</span>
                </div>
              ) : product.stockPercentage > 50 ? (
                <div className="available-pill-shimmer inline-flex items-center gap-3 bg-[#7F8C76]/10 text-[#7F8C76] font-semibold text-xs px-5 py-2.5 rounded-full border border-[#7F8C76]/20 shadow-sm">
                  <span>AVAILABLE: {product.stockPercentage}%</span>
                  <div className="w-24 h-1 bg-[#FAF8F5] border border-[#7F8C76]/20 rounded-full overflow-hidden flex">
                    <div className="h-full bg-[#7F8C76]" style={{ width: `${product.stockPercentage}%` }}></div>
                  </div>
                </div>
              ) : (
                <div className="available-pill-shimmer inline-flex items-center gap-3 bg-[#B88F8A]/10 text-[#B88F8A] font-semibold text-xs px-5 py-2.5 rounded-full border border-[#B88F8A]/20 shadow-sm">
                  <span>{product.stockPercentage}% - FEW PIECES LEFT</span>
                  <div className="w-16 h-1 bg-[#FAF8F5] border border-[#B88F8A]/20 rounded-full overflow-hidden flex">
                    <div className="h-full bg-[#B88F8A]" style={{ width: `${product.stockPercentage || 0}%` }}></div>
                  </div>
                </div>
              )}
            </div>

            {/* Pricing details & details list */}
            <div className="border-t border-[#2D2A26]/10 pt-6 mb-8">
              <div className="flex items-baseline gap-4 mb-4">
                <span className="text-3xl text-[#2D2A26] font-light">{product.price}</span>
                <span className="text-xs text-[#8C7E7A] font-sans">All Taxes Included</span>
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4 font-sans text-xs">
                {product.details.slice(0, 4).map((detail, idx) => (
                  <div key={idx} className="flex justify-between border-b border-[#2D2A26]/5 py-2">
                    <span className="text-[#8C7E7A] uppercase tracking-wider">{detail.name}</span>
                    <span className="text-[#2D2A26] font-medium">{detail.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions button */}
            <div className="flex items-center gap-4 font-sans">
              <Link
                to={`/product/${product.slug}`}
                className="bg-[#2D2A26] hover:bg-[#7F8C76] text-white text-xs uppercase tracking-widest px-8 py-4 rounded-full transition-all duration-300 shadow-md font-semibold"
              >
                Showcase specifications
              </Link>
              <button
                type="button"
                onClick={() => onAddToCart(product)}
                disabled={!product.inStock || adding}
                className="flex items-center gap-2 bg-[#7F8C76]/10 hover:bg-[#7F8C76]/20 text-[#7F8C76] text-xs uppercase tracking-widest px-8 py-4 rounded-full transition-all duration-300 font-semibold border border-[#7F8C76]/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {product.inStock ? 'Add to Cart' : 'Sold Out'}
              </button>
            </div>

          </div>
        </div>
      ))}

      {/* LOOKBOOK CREDITS FOOTER PANEL */}
      <div className="snap-start w-full bg-[#FAF8F5]">
        <Footer isIvoryTheme={true} />
      </div>

    </div>
  );
}

export function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(() => searchParams.get('q') ?? '');
  const [addingId, setAddingId] = useState(null);
  const [actionError, setActionError] = useState(null);
  const searchRef = useRef(null);

  const { addItem } = useCart();
  const { has: isSaved, toggle: toggleSave } = useWishlist();

  // Filters live in the URL so a filtered view can be shared and the browser's
  // back button works the way shoppers expect.
  const activeCategory = searchParams.get('category') ?? 'all';
  const activeColor = searchParams.get('color');
  const activePriceRange = Number(searchParams.get('price') ?? 0) || 0;
  const sort = searchParams.get('sort') ?? 'featured';
  const page = Math.max(1, Number(searchParams.get('page') ?? 1) || 1);
  const search = useDebouncedValue(searchInput, 350);

  const layout = LAYOUTS[activeCategory] ?? 'default';

  const updateParams = (changes) => {
    const next = new URLSearchParams(searchParams);

    for (const [key, value] of Object.entries(changes)) {
      if (value === null || value === undefined || value === '') next.delete(key);
      else next.set(key, String(value));
    }

    // Any filter change starts again from the first page.
    if (!('page' in changes)) next.delete('page');
    setSearchParams(next);
  };

  // Keep the URL in step with the debounced search box.
  useEffect(() => {
    const current = searchParams.get('q') ?? '';
    if (search === current) return;
    updateParams({ q: search || null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    if (searchParams.get('focus') !== 'search') return;
    searchRef.current?.focus();
    updateParams({ focus: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Categories and colour facets arrive together, in one request.
  const { data: facets } = useQuery(
    (options) =>
      catalog.filters({ category: activeCategory === 'all' ? undefined : activeCategory }, options),
    [activeCategory],
  );

  const categories = useMemo(() => facets?.categories ?? [], [facets]);
  const colors = facets?.colors ?? [];

  // Each editorial collection has its own CMS page holding the hero copy.
  const { data: heroPage } = useQuery(
    (options) => content.page(`shop-${activeCategory}`, options),
    [activeCategory],
    { enabled: layout !== 'default' },
  );

  // Every section of the collection's CMS page, keyed for lookup.
  const pageSections = useMemo(
    () => Object.fromEntries((heroPage?.sections ?? []).map((section) => [section.key, section.data])),
    [heroPage],
  );

  const heroContent = pageSections.hero ?? {};

  const priceRange = priceRanges[activePriceRange] ?? priceRanges[0];

  const {
    data: response,
    loading,
    error,
    refetch,
  } = useQuery(
    (options) =>
      catalog.products(
        {
          category: activeCategory === 'all' ? undefined : activeCategory,
          color: activeColor ?? undefined,
          search: search || undefined,
          minPrice: priceRange.min ?? undefined,
          maxPrice: priceRange.max ?? undefined,
          sort,
          page,
          // The editorial layouts show the whole collection on one canvas.
          limit: layout === 'default' ? PAGE_SIZE : 60,
        },
        options,
      ),
    [activeCategory, activeColor, search, activePriceRange, sort, page, layout],
  );

  const items = useMemo(() => (response?.data ?? []).map(toDisplayProduct), [response]);
  const pagination = response?.meta?.pagination;

  // "All Collections" plus whatever the owner has published.
  const switcherCategories = useMemo(
    () => [{ slug: 'all', name: 'All Collections', headline: 'All Collections' }, ...categories],
    [categories],
  );

  const currentCategory = categories.find((cat) => cat.slug === activeCategory);
  const headingTitle = currentCategory?.name ?? theme.title;
  const headingDescription = currentCategory?.description ?? theme.desc;

  // Compact page list: first, a window around the current page, and last.
  const pageNumbers = useMemo(() => {
    const total = pagination?.totalPages ?? 1;
    if (total <= 1) return [];

    const window = new Set([1, total, page, page - 1, page + 1]);
    const visible = [...window].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);

    return visible.flatMap((value, index, all) =>
      index > 0 && value - all[index - 1] > 1 ? [null, value] : [value],
    );
  }, [pagination, page]);

  /** Returns whether the item made it into the cart, so cards can confirm. */
  const handleAddToCart = async (product) => {
    setAddingId(product.id);
    setActionError(null);
    try {
      await addItem(product.id, 1);
      return true;
    } catch (addError) {
      setActionError(addError.message);
      return false;
    } finally {
      setAddingId(null);
    }
  };

  const handleToggleSave = async (productId) => {
    setActionError(null);
    try {
      const result = await toggleSave(productId);
      if (result?.requiresLogin) setActionError('Sign in to save pieces to your wishlist.');
    } catch (saveError) {
      setActionError(saveError.message);
    }
  };

  if (layout === 'bags') {
    return (
      <div className="w-full min-h-screen bg-[#FAF8F5] text-[#2D2A26] relative select-none">
        <BagsSection
          content={heroContent}
          craft={pageSections.craft}
          testimonials={pageSections.testimonials}
          products={items}
          actionError={actionError}
          loading={loading}
          error={error}
          onRetry={refetch}
          onAddToCart={handleAddToCart}
          onToggleSave={handleToggleSave}
          isSaved={isSaved}
          addingId={addingId}
        />
        <Footer isIvoryTheme={true} />
      </div>
    );
  }

  /* 
    IF THE CURRENT CATEGORY IS SUITS: Render the beautiful full-screen Snapping Editorial Lookbook layout.
    No top collections switcher, no sidebar filter panels, automatically sliding images, and automatic shining pills.
  */
  if (layout === 'suits') {
    return (
      <div className="w-screen h-screen overflow-hidden bg-[#FAF8F5] relative select-none">
        <SuitsLookbook
          products={items}
          content={heroContent}
          loading={loading}
          error={error}
          onRetry={refetch}
          onAddToCart={handleAddToCart}
          adding={Boolean(addingId)}
        />
      </div>
    );
  }

  if (layout === 'kurtis') {
    return (
      <div className="w-full min-h-screen bg-[#FAF8F5] text-[#2D2A26] relative select-none">
        <KurtisCollection
          products={items}
          content={heroContent}
          loading={loading}
          error={error}
          onRetry={refetch}
          onToggleSave={handleToggleSave}
          isSaved={isSaved}
        />
      </div>
    );
  }

  if (layout === 'cord-sets') {
    return (
      <div className="w-full min-h-screen bg-[#141414] text-white relative select-none">
        <CordSetCollection
          products={items}
          content={heroContent}
          loading={loading}
          error={error}
          onRetry={refetch}
          onToggleSave={handleToggleSave}
          isSaved={isSaved}
        />
      </div>
    );
  }

  /* 
    DEFAULT LAYOUT (For other categories: Sarees, Lehengas, All): Left sidebar, grid listing, horizontal switcher.
    We preserve this exactly as it was, and only change the styling to look correct based on the active theme.
  */
  return (
    <div className="w-full flex flex-col min-h-screen">
      <div className={`pt-32 pb-24 px-4 sm:px-6 lg:px-8 relative flex-grow transition-all duration-700 ${theme.bg}`}>

        {/* Background glow effects */}
        <div className="absolute inset-0 bg-[#0F2418]/90 -z-10"></div>
        <div className="absolute top-20 left-1/4 w-[600px] h-[600px] bg-[#FFF5EB]/[0.02] rounded-full blur-[100px] -z-10"></div>
        <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-[#E89B3C]/[0.03] rounded-full blur-[100px] -z-10"></div>

        <div className="max-w-7xl mx-auto">

          {/* PREMIUM UPPER SWITCHER */}
          <div className="flex justify-center mb-16">
            <div className={`inline-flex items-center gap-1.5 p-1.5 rounded-full backdrop-blur-md border ${theme.divider} bg-white/5 shadow-md`}>
              {switcherCategories.map((cat) => {
                const isActive = activeCategory === cat.slug;
                return (
                  <button
                    key={cat.slug}
                    onClick={() => updateParams({ category: cat.slug === 'all' ? null : cat.slug })}
                    className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-500 cursor-pointer ${isActive ? theme.pillActive : theme.pillInactive
                      }`}
                  >
                    {cat.headline}
                  </button>
                );
              })}
            </div>
          </div>

          {/* DEFAULT HEADER SECTION */}
          <div className={`mb-16 border-b pb-8 ${theme.divider}`}>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className={`text-5xl md:text-6xl mb-4 ${theme.headingFont}`}
            >
              {headingTitle}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <p className={`italic text-lg ${theme.accentText}`}>
                {headingDescription}
              </p>

              <div className="flex items-center gap-3">
                <label className="sr-only" htmlFor="shop-sort">
                  Sort products
                </label>
                <select
                  id="shop-sort"
                  value={sort}
                  onChange={(event) => updateParams({ sort: event.target.value })}
                  className="bg-white/5 border border-white/15 text-white/80 text-sm rounded-full px-4 py-2 focus:outline-none focus:border-[#E89B3C] transition-colors"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value} className="bg-[#0F2418]">
                      {option.label}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
                  className={`lg:hidden flex items-center gap-2 px-4 py-2 rounded-full border border-current opacity-80 hover:opacity-100 transition-opacity`}
                >
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                </button>
              </div>
            </motion.div>
          </div>

          <div className="flex flex-col lg:flex-row gap-12">

            {/* SIDEBAR FILTERS */}
            <div className={`lg:w-64 flex-shrink-0 ${isMobileFiltersOpen ? 'block' : 'hidden lg:block'}`}>
              <div className="sticky top-32 space-y-10">

                {/* Search */}
                <div>
                  <h3 className={`uppercase tracking-widest text-xs mb-4 font-semibold pb-2 border-b ${theme.sidebarTitle}`}>Search</h3>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      ref={searchRef}
                      type="search"
                      value={searchInput}
                      onChange={(event) => setSearchInput(event.target.value)}
                      placeholder="Search the boutique"
                      aria-label="Search products"
                      className="w-full bg-white/5 border border-white/15 rounded-full pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-[#E89B3C] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Category Filter in Sidebar */}
                <div>
                  <h3 className={`uppercase tracking-widest text-xs mb-4 font-semibold pb-2 border-b ${theme.sidebarTitle}`}>Category</h3>
                  <ul className="space-y-3">
                    {switcherCategories.map((cat) => {
                      const isSelected = activeCategory === cat.slug;
                      return (
                        <li key={cat.slug}>
                          <button
                            onClick={() => updateParams({ category: cat.slug === 'all' ? null : cat.slug })}
                            className={`text-sm transition-colors text-left flex items-center gap-2 w-full cursor-pointer ${isSelected ? `${theme.accentText} font-semibold` : theme.sidebarText
                              }`}
                          >
                            <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? theme.sidebarDot : 'bg-transparent'}`} />
                            {cat.name}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Color Filter */}
                <div>
                  <h3 className={`uppercase tracking-widest text-xs mb-4 font-semibold pb-2 border-b ${theme.sidebarTitle}`}>Color</h3>
                  <div className="flex flex-wrap gap-2">
                    {colors.length === 0 ? (
                      <p className="text-xs text-white/40">No colours to filter by yet.</p>
                    ) : (
                      colors.map((color) => {
                        const isSelected = activeColor === color;
                        return (
                          <button
                            key={color}
                            onClick={() => updateParams({ color: isSelected ? null : color })}
                            className={`px-3 py-1.5 rounded-full text-xs transition-all border cursor-pointer ${isSelected
                              ? 'border-[#E3A857] bg-[#E3A857]/10 text-[#E3A857] font-semibold'
                              : 'border-white/10 text-white/60 hover:border-white/30'
                              }`}
                          >
                            {color}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Price Filter */}
                <div>
                  <h3 className={`uppercase tracking-widest text-xs mb-4 font-semibold pb-2 border-b ${theme.sidebarTitle}`}>Price Filter</h3>
                  <ul className="space-y-3">
                    {priceRanges.map((range, index) => {
                      const isSelected = activePriceRange === index;
                      return (
                        <li key={range.label}>
                          <button
                            onClick={() => updateParams({ price: index === 0 ? null : index })}
                            className={`text-sm transition-colors text-left flex items-center gap-3 w-full cursor-pointer group`}
                          >
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected
                              ? 'border-[#3D1B20] bg-[#3D1B20]'
                              : 'border-white/20 group-hover:border-[#E89B3C]'
                              }`}>
                              <Check className={`w-2.5 h-2.5 ${isSelected ? 'text-white' : 'text-transparent'}`} />
                            </div>
                            <span className={`${isSelected ? 'font-semibold' : 'opacity-70'} text-white`}>
                              {range.label}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>

              </div>
            </div>

            {/* STANDARD PRODUCT GRID */}
            <div className="flex-1">
              {actionError ? (
                <p className="mb-6 text-sm text-[#E89B3C]" role="alert">{actionError}</p>
              ) : null}

              {loading ? (
                <InlineLoader />
              ) : error ? (
                <ErrorState message={error.message} onRetry={refetch} />
              ) : items.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-lg opacity-60">No products found matching your current filters.</p>
                  <button
                    onClick={() => { setSearchInput(''); updateParams({ color: null, price: null, q: null }); }}
                    className="mt-4 px-6 py-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {items.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      className={`group relative overflow-hidden rounded-2xl border transition-all duration-500 ${theme.cardBg}`}
                    >
                      <Link to={`/product/${product.slug}`} className="block relative h-[420px] overflow-hidden">
                        <img
                          src={product.images[0]}
                          alt={product.imageAlts[0] ?? product.name}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />

                        {/* Product Tag */}
                        {product.tag && (
                          <span className="absolute top-4 left-4 text-[10px] uppercase tracking-widest font-semibold px-3 py-1.5 rounded-full border shadow-sm bg-white border-[#3D1B20]/15 text-[#3D1B20]">
                            {product.tag}
                          </span>
                        )}
                      </Link>

                      {/* Hover Actions */}
                      <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                        <button
                          type="button"
                          onClick={() => handleToggleSave(product.id)}
                          aria-label={isSaved(product.id) ? 'Remove from wishlist' : 'Save to wishlist'}
                          className="bg-white/95 backdrop-blur-sm p-2.5 rounded-full shadow-lg hover:bg-black hover:text-white transition-colors"
                        >
                          <Heart
                            className={`w-4 h-4 ${isSaved(product.id) ? 'fill-[#3D1B20] text-[#3D1B20]' : 'text-gray-800'}`}
                          />
                        </button>
                      </div>

                      {/* Product Info */}
                      <div className="p-5 font-sans">
                        <p className="opacity-50 text-[10px] uppercase tracking-wider mb-2 font-semibold">{product.category}</p>

                        <Link to={`/product/${product.slug}`}>
                          <h3 className="text-lg transition-colors duration-300 font-medium mb-1 truncate text-[#3D1B20] group-hover:text-[#E3A857]">
                            {product.name}
                          </h3>
                          {product.subtitle && (
                            <p className="text-xs opacity-60 mb-2 italic">{product.subtitle}</p>
                          )}
                        </Link>

                        <div className="flex items-center gap-1 mb-4">
                          <Star className="w-3.5 h-3.5 fill-current text-[#E3A857]" />
                          <span className="text-xs font-semibold">{product.rating}</span>
                          <span className="text-xs opacity-40">({product.reviews})</span>
                        </div>

                        <div className="flex items-center justify-between border-t pt-4 border-current/5">
                          <span className="text-xl font-bold text-[#3D1B20]">{product.price}</span>
                          <Link
                            to={`/product/${product.slug}`}
                            className="flex items-center gap-2 text-xs uppercase tracking-widest font-semibold px-4 py-2.5 rounded-full transition-all duration-300 bg-[#3D1B20] text-white hover:bg-[#E3A857]"
                          >
                            Show details
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* PAGINATION */}
              {pagination && pagination.totalPages > 1 ? (
                <nav
                  aria-label="Product pages"
                  className="mt-20 flex justify-center border-t border-current/5 pt-10"
                >
                  <div className="flex items-center gap-2">
                    {pageNumbers.map((entry, index) =>
                      entry === null ? (
                        <span key={`gap-${index}`} className="opacity-40 px-2">...</span>
                      ) : (
                        <button
                          key={entry}
                          onClick={() => updateParams({ page: entry === 1 ? null : entry })}
                          aria-current={entry === page ? 'page' : undefined}
                          className={`w-10 h-10 rounded-full border flex items-center justify-center cursor-pointer transition-colors ${entry === page
                            ? 'bg-[#3D1B20] text-white border-[#3D1B20]'
                            : 'border-white/20 hover:bg-white/10 text-white'
                            }`}
                        >
                          {entry}
                        </button>
                      ),
                    )}

                    {page < pagination.totalPages ? (
                      <button
                        onClick={() => updateParams({ page: page + 1 })}
                        className="px-4 h-10 rounded-full border flex items-center justify-center cursor-pointer transition-colors border-white/20 hover:bg-white/10 text-white"
                      >
                        Next
                      </button>
                    ) : null}
                  </div>
                </nav>
              ) : null}
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
