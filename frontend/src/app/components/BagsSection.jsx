import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Star, Heart, Gem, Layers, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

import { ErrorState, InlineLoader } from './Feedback.jsx';

/**
 * Bags are merchandised by the kind of piece rather than by category, so the
 * tabs match on the product name and subtitle the owner sets.
 */
const bagCategories = [
  { id: 'all', label: 'All Creations' },
  { id: 'tote', label: 'Tote Bags' },
  { id: 'potli', label: 'Royal Potlis' },
  { id: 'clutch', label: 'Zardozi Clutches' },
];

const matchesTab = (bag, tab) => {
  if (tab === 'all') return true;
  const haystack = `${bag.name} ${bag.subtitle}`.toLowerCase();
  return haystack.includes(tab);
};

export function BagsSection({
  content = {},
  craft = {},
  testimonials = {},
  products = [],
  loading = false,
  error = null,
  actionError = null,
  onRetry,
  onAddToCart,
  onToggleSave,
  isSaved = () => false,
  addingId = null,
}) {
  const { eyebrow = '', title = '', subtitle = '', imageUrl = '' } = content;
  const reviews = testimonials.items ?? [];

  // Shown as the headline rating, so it has to be the real average of the
  // reviews on the page rather than a number typed into the markup.
  const averageRating = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  const [activeTab, setActiveTab] = useState('all');
  const [selectedBagIndex, setSelectedBagIndex] = useState(0);
  const [addedIds, setAddedIds] = useState([]);

  // Spotlight card at the top of the page.
  const heroBag = products[selectedBagIndex] ?? products[0];
  const filteredBags = products.filter((bag) => matchesTab(bag, activeTab));

  const handleAddToCart = async (bag) => {
    const added = await onAddToCart?.(bag);
    if (added === false) return;

    setAddedIds((prev) => [...prev, bag.id]);
    setTimeout(() => setAddedIds((prev) => prev.filter((id) => id !== bag.id)), 2500);
  };

  return (
    <div className="bg-[#FAF8F5] text-[#2D2A26] min-h-screen">
      
      {/* ---------------------------------------------------- */}
      {/* 1. HERO SECTION (Clean screen, large center text, blurred background image) */}
      {/* ---------------------------------------------------- */}
      <section className="relative w-full h-[70vh] sm:h-[80vh] flex items-center justify-center overflow-hidden bg-black/30">
        {/* Background Blurred Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={imageUrl}
            alt="Kabeer tote bags"
            className="w-full h-full object-cover filter blur-[8px] scale-105 opacity-80"
          />
          {/* Subtle Dark Overlay to ensure clean readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-[#FAF8F5]" />
        </div>

        {/* Hero Content: Clean Screen Large Centered Text */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-block text-xs uppercase tracking-[0.35em] text-[#E89B3C] font-semibold mb-4 bg-black/40 backdrop-blur-md px-5 py-1.5 rounded-full border border-white/10"
          >
            {eyebrow}
          </motion.span>
          
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-cormorant text-5xl sm:text-7xl lg:text-8xl text-white uppercase font-light tracking-tight leading-none mb-6 drop-shadow-md"
          >
            {title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-white/90 font-serif italic text-base sm:text-xl max-w-2xl mx-auto font-light leading-relaxed drop-shadow"
          >
            {subtitle}
          </motion.p>
        </div>
      </section>

      {/* Sky Blue Wave Glow Keyframes */}
      <style>{`
        @keyframes skyBlueWave {
          0%   { box-shadow: 0 0 0px 0px rgba(125,211,252,0), 0 0 30px 8px rgba(125,211,252,0.18), 0 0 80px 30px rgba(186,230,253,0.10), 0 0 160px 60px rgba(224,242,254,0.06); }
          30%  { box-shadow: 0 0 2px 3px rgba(125,211,252,0.22), 0 0 50px 18px rgba(125,211,252,0.22), 0 0 110px 50px rgba(186,230,253,0.13), 0 0 220px 90px rgba(224,242,254,0.07); }
          60%  { box-shadow: 0 0 1px 2px rgba(56,189,248,0.28), 0 0 70px 28px rgba(56,189,248,0.18), 0 0 140px 70px rgba(125,211,252,0.10), 0 0 280px 110px rgba(186,230,253,0.05); }
          80%  { box-shadow: 0 0 2px 4px rgba(125,211,252,0.20), 0 0 45px 16px rgba(125,211,252,0.20), 0 0 100px 45px rgba(186,230,253,0.12), 0 0 200px 80px rgba(224,242,254,0.06); }
          100% { box-shadow: 0 0 0px 0px rgba(125,211,252,0), 0 0 30px 8px rgba(125,211,252,0.18), 0 0 80px 30px rgba(186,230,253,0.10), 0 0 160px 60px rgba(224,242,254,0.06); }
        }
        .sky-glow-card {
          animation: skyBlueWave 4s ease-in-out infinite;
          border-color: rgba(125, 211, 252, 0.35) !important;
        }
      `}</style>

      {/* Main Content Area */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

        {loading ? <InlineLoader tone="ivory" /> : null}
        {error ? <ErrorState tone="ivory" message={error.message} onRetry={onRetry} /> : null}
        {actionError ? (
          <p className="mb-8 text-sm text-[#B88F8A]" role="alert">{actionError}</p>
        ) : null}

        {/* ---------------------------------------------------- */}
        {/* 2. FIRST CARD BOX (Keep spotlight card as it is) */}
        {/* ---------------------------------------------------- */}
        {heroBag && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="sky-glow-card relative mb-20 rounded-3xl overflow-hidden border bg-[#FCFAF7] p-6 lg:p-10"
          >
            <div className="grid lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Column: Details & Hotspots */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
                <div>
                  <span className="inline-block px-3.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#2D2A26] text-white mb-3 shadow-sm">
                    {heroBag.tag || 'FEATURED SELECTION'}
                  </span>
                  <h3 className="font-cormorant text-3xl sm:text-4xl uppercase tracking-wide text-[#2D2A26] font-semibold mb-2">
                    {heroBag.name}
                  </h3>
                  <p className="text-[#8C7E7A] font-medium text-sm mb-4">
                    {heroBag.subtitle} — <span className="text-[#2D2A26] font-bold text-lg">{heroBag.price}</span>
                  </p>
                  <p className="text-[#8C7E7A] text-xs sm:text-sm leading-relaxed mb-6 font-light">
                    {heroBag.description}
                  </p>
                </div>

                {/* Craftsmanship Highlights */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#2D2A26]/10">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-[#E89B3C]/10 text-[#E89B3C]">
                      <Gem className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-[#2D2A26] uppercase tracking-wider">Artisanal Zardozi</h4>
                      <p className="text-[11px] text-[#8C7E7A]">Hand-sewn gold threads</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-[#E89B3C]/10 text-[#E89B3C]">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-[#2D2A26] uppercase tracking-wider">Raw Silk & Velvet</h4>
                      <p className="text-[11px] text-[#8C7E7A]">Plush luxury inner</p>
                    </div>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-wrap items-center gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => handleAddToCart(heroBag)}
                    disabled={!heroBag.inStock || addingId === heroBag.id}
                    className="flex-1 sm:flex-none px-8 py-3.5 rounded-full bg-[#2D2A26] text-white font-semibold text-xs uppercase tracking-widest hover:bg-[#E89B3C] transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>
                      {!heroBag.inStock
                        ? 'Sold Out'
                        : addedIds.includes(heroBag.id)
                          ? 'Added to Bag ✓'
                          : 'Add to Shopping Bag'}
                    </span>
                  </button>

                  <Link
                    to={`/product/${heroBag.slug}`}
                    className="px-6 py-3.5 rounded-full border border-[#2D2A26]/20 text-[#2D2A26] hover:bg-[#2D2A26] hover:text-white transition-all duration-300 flex items-center gap-2 text-xs uppercase tracking-widest font-semibold"
                  >
                    <span>View Specifications</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Right Column: Floating Image Showcase */}
              <div className="lg:col-span-7 relative">
                <div className="relative aspect-[4/3] sm:aspect-[16/10] rounded-2xl overflow-hidden bg-[#F3EFE9] border border-[#2D2A26]/5 shadow-md group">
                  <img
                    src={heroBag.images[0]}
                    alt={heroBag.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  
                  {/* Rating Overlay */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md border border-[#2D2A26]/10 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-xs text-[#2D2A26] shadow-sm">
                    <Star className="w-3.5 h-3.5 fill-[#E3A857] text-[#E3A857]" />
                    <span className="font-bold">{heroBag.rating}</span>
                    <span className="text-[#8C7E7A]">({heroBag.reviews} reviews)</span>
                  </div>

                  {/* Thumbnail Selector strip */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-white/90 backdrop-blur-md border border-[#2D2A26]/10 p-2 rounded-2xl shadow-sm">
                    <span className="text-xs text-[#8C7E7A] px-2 font-medium">Select Showcase Style:</span>
                    <div className="flex gap-2">
                      {products.slice(0, 4).map((bag, idx) => (
                        <button
                          key={bag.id}
                          onClick={() => setSelectedBagIndex(idx)}
                          className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                            selectedBagIndex === idx
                              ? 'border-[#E89B3C] scale-105'
                              : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={bag.images[0]} alt={bag.name} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* ---------------------------------------------------- */}
        {/* 3. TEXT DIALOGUE SECTION (OUR CRAFT - Screenshot 3 design) */}
        {/* ---------------------------------------------------- */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative mb-20 rounded-2xl bg-[#241A18] text-[#FAF8F5] p-10 lg:p-20 overflow-hidden text-center shadow-xl"
        >
          {/* Subtle Background Star Overlay Icon */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
            <svg width="240" height="240" viewBox="0 0 100 100" fill="currentColor">
              <path d="M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z" />
            </svg>
          </div>

          <div className="relative z-10 max-w-4xl mx-auto">
            {/* Header Divider */}
            <div className="flex items-center justify-center gap-4 mb-10">
              <div className="h-[1px] w-16 sm:w-28 bg-[#C5A059]/40" />
              <span className="text-[11px] uppercase tracking-[0.35em] text-[#C5A059] font-medium">
                {craft.eyebrow}
              </span>
              <div className="h-[1px] w-16 sm:w-28 bg-[#C5A059]/40" />
            </div>

            {/* Quote Body */}
            <blockquote className="font-cormorant text-2xl sm:text-4xl lg:text-5xl italic font-light leading-relaxed text-[#F7F3EE] mb-8">
              {craft.quote}
            </blockquote>

            {/* Quote Footer Attribution */}
            <p className="text-xs uppercase tracking-[0.25em] text-[#C5A059]/90 font-light">
              {craft.attribution}
            </p>
          </div>
        </motion.div>

        {/* ---------------------------------------------------- */}
        {/* 4. PRODUCT GRID SECTION (Screenshot 4 design, minimum 2 rows) */}
        {/* ---------------------------------------------------- */}
        <div className="mb-20">
          {/* Category Filters */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            {bagCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  activeTab === cat.id
                    ? 'bg-[#2D2A26] text-white shadow-md'
                    : 'bg-white text-[#2D2A26]/70 border border-[#2D2A26]/10 hover:border-[#2D2A26]/30 hover:text-[#2D2A26]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="wait">
              {filteredBags.map((bag, index) => {
                const isFav = isSaved(bag.id);
                const isAdded = addedIds.includes(bag.id);

                return (
                  <motion.div
                    key={bag.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="group relative flex flex-col justify-between"
                  >
                    {/* Image Container with Screenshot 4 style badges */}
                    <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-[#F3EFE9] mb-4">
                      <img
                        src={bag.images[0]}
                        alt={bag.imageAlts[0] ?? bag.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />

                      {/* Beige/Gold Tag Badge (as in Screenshot 4: BESTSELLER / NEW) */}
                      {bag.tag && (
                        <div className="absolute top-4 left-4 border border-[#C5A059]/60 bg-[#FAF8F5]/90 backdrop-blur-sm px-3 py-1 rounded-sm text-[10px] font-semibold text-[#8C7E7A] uppercase tracking-widest">
                          {bag.tag}
                        </div>
                      )}

                      {/* Favorite Button */}
                      <button
                        type="button"
                        onClick={() => onToggleSave?.(bag.id)}
                        className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 backdrop-blur-sm border border-[#2D2A26]/10 text-[#2D2A26] hover:text-rose-500 transition-colors shadow-sm cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Add to favorites"
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                      </button>

                      {/* Add to Cart Overlay Button */}
                      <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        <button
                          type="button"
                          onClick={() => handleAddToCart(bag)}
                          disabled={!bag.inStock || addingId === bag.id}
                          className={`w-full py-3 rounded-lg text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                            isAdded
                              ? 'bg-emerald-700 text-white'
                              : 'bg-[#2D2A26] text-white hover:bg-[#E89B3C]'
                          }`}
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>{!bag.inStock ? 'Sold Out' : isAdded ? 'Added to Bag ✓' : 'Add to Bag'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Card Content (Clean layout matching Screenshot 4) */}
                    <div className="flex justify-between items-start pt-1">
                      <div>
                        <Link to={`/product/${bag.slug}`}>
                          <h3 className="font-cormorant text-2xl font-normal text-[#2D2A26] hover:text-[#E89B3C] transition-colors duration-300 tracking-wide">
                            {bag.name}
                          </h3>
                        </Link>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-[#8C7E7A] font-medium mt-0.5">
                          {bag.subtitle}
                        </p>
                      </div>

                      {/* Price & Strikethrough Price (Screenshot 4 style) */}
                      <div className="text-right">
                        <span className="font-serif text-lg font-semibold text-[#2D2A26] block">
                          {bag.price}
                        </span>
                        {bag.originalPrice && (
                          <span className="text-xs text-[#8C7E7A] line-through block font-serif">
                            {bag.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* 5. REVIEW SECTION (Replaces Bespoke Box - Screenshot 2 design) */}
        {/* ---------------------------------------------------- */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="pt-12 border-t border-[#2D2A26]/10"
        >
          {/* Top Section Header with right label CUSTOMER WORDS */}
          <div className="flex items-center justify-between mb-16">
            <div className="h-[1px] flex-1 bg-[#2D2A26]/10" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#8C7E7A] font-semibold px-6">
              {testimonials.eyebrow}
            </span>
            <div className="h-[1px] flex-1 bg-[#2D2A26]/10" />
          </div>

          {/* 3 Review Cards Grid (Screenshot 2 design) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16">
            {reviews.map((review, index) => (
              <div
                key={`${review.name}-${index}`}
                className={`flex flex-col justify-between ${
                  index < reviews.length - 1
                    ? 'border-r-0 md:border-r border-[#2D2A26]/10 pr-0 md:pr-8'
                    : ''
                }`}
              >
                <div>
                  <div className="flex items-center gap-1 mb-6 text-[#C5A059]">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-[#C5A059]' : 'opacity-30'}`}
                      />
                    ))}
                  </div>
                  <p className="font-cormorant text-xl lg:text-2xl italic text-[#2D2A26] leading-relaxed mb-8">
                    {review.quote}
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-[#2D2A26]/5">
                  {review.avatarUrl ? (
                    <img
                      src={review.avatarUrl}
                      alt={review.name}
                      loading="lazy"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : null}
                  <div>
                    <h4 className="text-xs font-semibold text-[#2D2A26]">{review.name}</h4>
                    <p className="text-[11px] text-[#8C7E7A]">{review.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Review Footer Summary Rating (Screenshot 2 bottom center) */}
          {reviews.length > 0 ? (
            <div className="flex flex-col items-center justify-center pt-8 border-t border-[#2D2A26]/10">
              <span className="font-cormorant text-6xl sm:text-7xl font-light text-[#2D2A26] leading-none mb-2">
                {averageRating.toFixed(1)}
              </span>
              <div className="flex items-center gap-1.5 mb-2 text-[#C5A059]">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.round(averageRating) ? 'fill-[#C5A059]' : 'opacity-30'}`}
                  />
                ))}
              </div>
              <p className="text-xs text-[#8C7E7A] uppercase tracking-widest font-medium">
                {reviews.length} customer {reviews.length === 1 ? 'review' : 'reviews'}
              </p>
            </div>
          ) : null}

        </motion.div>

      </section>

    </div>
  );
}
