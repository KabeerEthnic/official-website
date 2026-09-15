import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Heart, ShoppingBag, Truck, Shield, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { Link, useSearchParams } from 'react-router';
import { products, Product } from '../data/products';
import { Footer } from '../components/Footer';
import heroSuitsImg from '../../imports/hero-suits.png';
import heroCordsetImg from '../../imports/hero-cordset.png';

const categories = ['All', 'Sarees', 'Lehengas', 'Suits', 'Kurtis', 'Cord Sets'];
const colors = ['Red', 'Pink', 'Gold', 'Maroon', 'Green', 'Blue', 'Purple'];
const priceRanges = [
  { label: 'All Prices', min: 0, max: 100000 },
  { label: 'Under ₹10,000', min: 0, max: 10000 },
  { label: '₹10,000 - ₹20,000', min: 10000, max: 20000 },
  { label: 'Above ₹20,000', min: 20000, max: 100000 }
];

const themes = {
  All: {
    bg: 'bg-gradient-to-b from-[#0F2418] via-[#0D1F15] to-[#0F2418] text-white',
    sidebarTitle: 'text-white border-white/10 font-serif',
    sidebarText: 'text-white/60 hover:text-white',
    sidebarDot: 'bg-[#E89B3C]',
    accentColor: '#E89B3C',
    accentText: 'text-[#E89B3C]',
    buttonBg: 'bg-white/10 hover:bg-[#E89B3C] border-white/10 text-white',
    headingFont: "font-serif text-white",
    cardBg: 'bg-white/5 border-white/10 hover:border-[#E89B3C]/50 text-white',
    title: 'Collections',
    desc: 'Explore our curated selection of timeless ethnic wear',
    pillActive: 'bg-[#E89B3C] text-white border-[#E89B3C]',
    pillInactive: 'bg-white/5 border-white/10 text-white/70 hover:border-white/30 hover:text-white',
    divider: 'border-white/10'
  },
  Sarees: {
    bg: 'bg-gradient-to-b from-[#07140B] via-[#0B1E13] to-[#07140B] text-white font-cinzel',
    sidebarTitle: 'text-white border-white/10 font-cinzel font-bold tracking-widest text-sm uppercase',
    sidebarText: 'text-white/70 hover:text-white font-cinzel text-sm',
    sidebarDot: 'bg-[#D4AF37]',
    accentColor: '#D4AF37',
    accentText: 'text-[#D4AF37]',
    buttonBg: 'bg-white/5 hover:bg-[#D4AF37] hover:text-black border-white/10 text-white',
    headingFont: "font-cinzel text-white uppercase tracking-widest font-medium",
    cardBg: 'bg-white/[0.03] border-white/10 hover:border-[#D4AF37]/50 text-white',
    title: 'Heritage Sarees',
    desc: 'Royal weaves and imperial silk sarees designed for family legacies',
    pillActive: 'bg-[#D4AF37] text-black border-[#D4AF37] font-semibold',
    pillInactive: 'bg-white/5 border-white/10 text-white/70 hover:border-white/30 hover:text-white',
    divider: 'border-white/10'
  },
  Lehengas: {
    bg: 'bg-gradient-to-b from-[#FFF5F6] via-[#FAF0F1] to-[#FFF5F6] text-[#3D1B20] font-serif',
    sidebarTitle: 'text-[#3D1B20] border-[#3D1B20]/15 font-serif font-bold uppercase tracking-widest text-sm',
    sidebarText: 'text-[#3D1B20]/70 hover:text-[#3D1B20] font-serif text-sm',
    sidebarDot: 'bg-[#E3A857]',
    accentColor: '#E3A857',
    accentText: 'text-[#E3A857]',
    buttonBg: 'bg-[#3D1B20]/5 hover:bg-[#3D1B20] hover:text-white border-[#3D1B20]/10 text-[#3D1B20]',
    headingFont: "font-serif text-[#3D1B20] font-light",
    cardBg: 'bg-white/60 backdrop-blur-md border-[#3D1B20]/10 hover:border-[#E3A857]/50 text-[#3D1B20]',
    title: 'Couture Lehengas',
    desc: 'Fairytale wedding wear crafted with shimmering details and modern bridal glam',
    pillActive: 'bg-[#3D1B20] text-white border-[#3D1B20] shadow-sm',
    pillInactive: 'bg-white/80 border-[#3D1B20]/10 text-[#3D1B20]/70 hover:border-[#3D1B20]/30 hover:text-[#3D1B20]',
    divider: 'border-[#3D1B20]/10'
  }
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
function ProductSlideshow({ images }: { images: string[] }) {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % images.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="w-full h-full relative group">
      <AnimatePresence mode="wait">
        <motion.img
          key={currentIdx}
          src={images[currentIdx]}
          alt="Suits Lookbook angle"
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
function KurtiCard({ product }: { product: Product }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="group flex flex-col bg-[#FCFAF7] border border-[#2D2A26]/5 rounded-[24px] overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:border-[#E89B3C]/20 transition-all duration-500 w-full"
    >
      <Link to={`/product/${product.id}`} className="block relative aspect-[4/5] w-full overflow-hidden bg-[#F3EFE9]">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Tag */}
        {product.tag && (
          <span className="absolute top-4 left-4 text-[9px] uppercase tracking-widest font-semibold px-3 py-1.5 rounded-full bg-white border border-[#2D2A26]/5 text-[#2D2A26] shadow-sm">
            {product.tag}
          </span>
        )}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <div className="bg-white/95 backdrop-blur-sm p-2.5 rounded-full shadow-lg text-gray-800">
            <Heart className="w-4 h-4" />
          </div>
        </div>
      </Link>

      <div className="p-6 flex flex-col flex-1">
        <span className="text-[10px] tracking-wider text-[#8C7E7A] uppercase mb-1.5 font-semibold">
          {product.subtitle}
        </span>
        
        <Link to={`/product/${product.id}`}>
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
            to={`/product/${product.id}`}
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
function KurtisHero() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 h-auto md:h-screen w-full bg-[#FAF8F5] text-[#2D2A26] border-b border-[#2D2A26]/5 relative">
      
      {/* Left Panel - Pink Kurta */}
      <div className="col-span-1 md:col-span-3 h-[450px] md:h-full relative overflow-hidden border-r border-[#2D2A26]/5 group">
        <motion.img
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src="https://images.unsplash.com/photo-1608748010899-18f300247112?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000"
          alt="Pink Handloom Kurta"
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors duration-500" />
        <div className="absolute bottom-6 left-6 text-white z-10 font-sans">
          <p className="text-[10px] tracking-[0.2em] uppercase font-semibold text-white/80">Lace & Silks</p>
          <h4 className="font-cormorant text-xl font-bold tracking-wide mt-1">THE PINK EDIT</h4>
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
            Kabeer Boutique Exclusive
          </motion.span>
          
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-cormorant text-4xl sm:text-5xl lg:text-[4.5rem] text-[#2D2A26] font-light uppercase tracking-wide leading-[0.95]"
          >
            Bespoke <span className="italic font-extralight text-[#8C7E7A]">Kurtis</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-[#8C7E7A] text-sm md:text-base font-light italic mt-5 font-cormorant leading-relaxed"
          >
            "Celebrating India's rich handloom traditions. Every Kurti in our collection is hand-drafted, dyed in custom hues, and designed to convey elegance in daily luxury."
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
                Privilege Savings
              </span>
              <h3 className="font-cormorant text-2xl font-bold text-[#2D2A26] mb-1">
                Enjoy 20% Off Your First Kurti
              </h3>
              <p className="text-xs text-[#8C7E7A] font-sans">
                Apply exclusive membership privilege code <span className="font-semibold text-[#7F8C76]">KABEER20</span> at checkout.
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
            src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000"
            alt="Lucknowi Chikankari Peach Kurta"
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            style={{ objectPosition: '50% 25%' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-80" />
          <div className="absolute bottom-5 left-6 text-white z-10 font-sans">
            <p className="text-[10px] tracking-[0.2em] uppercase font-semibold text-white/80">Lucknowi Craft</p>
            <h4 className="font-cormorant text-xl font-bold tracking-wide mt-1">THE GEORGETTE EDIT</h4>
          </div>
        </div>
      </div>

      {/* Right Panel - Royal Blue Kurta */}
      <div className="col-span-1 md:col-span-3 h-[450px] md:h-full relative overflow-hidden group">
        <motion.img
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.15 }}
          src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000"
          alt="Royal Summer Kurti"
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors duration-500" />
        <div className="absolute bottom-6 left-6 text-white z-10 font-sans">
          <p className="text-[10px] tracking-[0.2em] uppercase font-semibold text-white/80">Printed Luxury</p>
          <h4 className="font-cormorant text-xl font-bold tracking-wide mt-1">THE ROYAL EDIT</h4>
        </div>
      </div>

    </div>
  );
}

/* HIGH END DYNAMIC KURTIS LOOKBOOK & SHOPPING PAGE */
function KurtisCollection({ filteredProducts }: { filteredProducts: Product[] }) {
  const kurtis = useMemo(() => {
    return filteredProducts.filter(p => p.category === 'Kurtis');
  }, [filteredProducts]);

  // Group kurtis into rows of 3
  const rows = useMemo(() => {
    const res = [];
    for (let i = 0; i < kurtis.length; i += 3) {
      res.push(kurtis.slice(i, i + 3));
    }
    return res;
  }, [kurtis]);

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] text-[#2D2A26] flex flex-col font-sans overflow-x-hidden">
      
      {/* Dynamic Three-Panel Hero Section */}
      <KurtisHero />

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

        {kurtis.length === 0 ? (
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
                    <KurtiCard product={row[0]} />
                  </div>
                )}

                {/* Column 2: Center (Staggered/Shifted Down) */}
                {row[1] && (
                  <div className="flex flex-col md:translate-y-[150px] md:mb-[150px] relative z-10">
                    <KurtiCard product={row[1]} />
                  </div>
                )}

                {/* Column 3: Right (Standard Height) */}
                {row[2] && (
                  <div className="flex flex-col">
                    <KurtiCard product={row[2]} />
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

function CordSetHero() {
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
            src={heroCordsetImg}
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
              SS'26 Collection
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
              New Category
            </span>

            {/* Oversized Title */}
            <h1 className="font-cormorant text-[4rem] sm:text-[5rem] md:text-[5.5rem] lg:text-[7rem] leading-[0.85] font-extralight text-white uppercase tracking-tight">
              CORD
              <br />
              <span className="font-cormorant italic font-light text-[#C8A97E]">
                SETS
              </span>
            </h1>

            {/* Subtle divider */}
            <div className="w-16 border-b border-white/15 mt-8 mb-8" />

            {/* Tagline */}
            <p className="text-white/50 text-sm sm:text-base font-light tracking-wide leading-relaxed max-w-sm">
              Coordinated. Curated. Contemporary.
              <br />
              <span className="text-white/30">Where tops meet bottoms in perfect harmony.</span>
            </p>

            {/* CTA Button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="mt-10 group flex items-center gap-3 text-[13px] tracking-[0.2em] uppercase text-white border border-white/20 hover:border-[#C8A97E] hover:text-[#C8A97E] px-8 py-4 rounded-full transition-all duration-500 cursor-pointer"
            >
              Explore Collection
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </motion.button>

            {/* Stats */}
            <div className="flex gap-10 mt-14">
              <div>
                <span className="text-2xl font-cormorant font-light text-white">6</span>
                <span className="block text-[10px] tracking-[0.3em] uppercase text-white/30 mt-1">Styles</span>
              </div>
              <div className="w-[1px] bg-white/10" />
              <div>
                <span className="text-2xl font-cormorant font-light text-white">₹3.9k</span>
                <span className="block text-[10px] tracking-[0.3em] uppercase text-white/30 mt-1">Starting</span>
              </div>
              <div className="w-[1px] bg-white/10" />
              <div>
                <span className="text-2xl font-cormorant font-light text-[#C8A97E]">NEW</span>
                <span className="block text-[10px] tracking-[0.3em] uppercase text-white/30 mt-1">Season</span>
              </div>
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
              {['CORD SETS', 'COORDINATED LUXURY', 'HANDCRAFTED', 'KABEER BOUTIQUE', 'NEW ARRIVALS', 'SS\'26', 'CURATED PAIRS', 'PREMIUM FABRICS'].map((text, i) => (
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
function CordSetCard({ product, index }: { product: Product; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay: index % 2 === 1 ? 0.15 : 0, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative overflow-hidden rounded-2xl bg-[#1E1E1E] ${
        index % 2 === 1 ? 'md:translate-y-12' : ''
      }`}
    >
      <Link to={`/product/${product.id}`} className="block relative aspect-[3/4] w-full overflow-hidden">
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
          <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer border border-white/10">
            <Heart className="w-4 h-4 text-white" />
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
function CordSetCollection({ filteredProducts }: { filteredProducts: Product[] }) {
  const cordSets = useMemo(() => {
    return filteredProducts.filter(p => p.category === 'Cord Sets');
  }, [filteredProducts]);

  return (
    <div className="w-full min-h-screen bg-[#141414] text-white flex flex-col font-sans overflow-x-hidden">

      {/* Split-Screen Hero + Marquee */}
      <CordSetHero />

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
      <div className="w-full max-w-[1200px] mx-auto px-6 sm:px-10 md:px-16 pb-32">
        {cordSets.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-white/40">No Cord Sets found matching your current filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {cordSets.map((product, idx) => (
              <CordSetCard key={product.id} product={product} index={idx} />
            ))}
          </div>
        )}
      </div>

      {/* Dark Footer */}
      <Footer isIvoryTheme={false} />
    </div>
  );
}

function SuitsLookbook({ filteredProducts }: { filteredProducts: Product[] }) {
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
            src={heroSuitsImg}
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
        <DupattaRipple className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[30%]" />

        {/* Text anchored at the BOTTOM of hero */}
        <div className="absolute bottom-0 left-0 right-0 z-20 px-8 sm:px-16 pb-8 pt-16">
          <div className="max-w-3xl mx-auto">
            <span className="text-[#8C7E7A] tracking-[0.4em] uppercase text-xs font-sans font-semibold block mb-3">ARIA BOUTIQUE</span>

            <h1 className="font-cormorant text-4xl md:text-6xl lg:text-7xl text-[#2D2A26] font-light uppercase tracking-wide leading-[0.95]">
              ECHOS OF ELEGANCE <span className="text-[#8C7E7A] font-extralight font-sans">|</span> LIMITED SUITS.
            </h1>

            <p className="text-[#8C7E7A] text-sm md:text-base font-light italic max-w-lg mt-3 font-cormorant">
              Exclusive tailored silhouettes crafted in small batches for women of unique taste.
            </p>
          </div>
        </div>
      </div>

      {/* INDIVIDUAL SUIT PANELS (Snap-viewport height lookbook layout) */}
      {filteredProducts.map((product) => (
        <div
          key={product.id}
          className="snap-start h-screen w-full flex flex-col md:flex-row items-center justify-between relative overflow-hidden bg-[#FAF8F5]"
        >
          {/* LEFT HALF: 45% screen width, 100% height - Slideshow with soft rounded edges */}
          <div className="w-full md:w-[45vw] h-1/2 md:h-full p-4 md:p-8 flex-shrink-0">
            <div className="w-full h-full rounded-[24px] md:rounded-[32px] overflow-hidden shadow-[0_12px_48px_rgba(0,0,0,0.06)] bg-[#F3EFE9]">
              <ProductSlideshow images={product.images} />
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
              {product.stockPercentage && product.stockPercentage > 50 ? (
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
                to={`/product/${product.id}`}
                className="bg-[#2D2A26] hover:bg-[#7F8C76] text-white text-xs uppercase tracking-widest px-8 py-4 rounded-full transition-all duration-300 shadow-md font-semibold"
              >
                Showcase specifications
              </Link>
              <button
                className="flex items-center gap-2 bg-[#7F8C76]/10 hover:bg-[#7F8C76]/20 text-[#7F8C76] text-xs uppercase tracking-widest px-8 py-4 rounded-full transition-all duration-300 font-semibold border border-[#7F8C76]/10"
              >
                Add to Cart
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
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [activePriceRange, setActivePriceRange] = useState<number>(0);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Parse active category from query params
  const activeCategory = useMemo(() => {
    const param = searchParams.get('category');
    if (!param) return 'All';
    const lower = param.toLowerCase();
    if (lower === 'suits') return 'Suits';
    if (lower === 'sarees') return 'Sarees';
    if (lower === 'lehengas') return 'Lehengas';
    if (lower === 'kurtis') return 'Kurtis';
    if (lower === 'cord sets' || lower === 'cord+sets') return 'Cord Sets';
    return 'All';
  }, [searchParams]);

  // Update URL search parameters
  const handleCategoryChange = (category: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (category === 'All') {
      newParams.delete('category');
    } else {
      newParams.set('category', category.toLowerCase());
    }
    setSearchParams(newParams);
  };

  const theme = themes[activeCategory as keyof typeof themes] || themes.All;

  // Filter products based on selected parameters
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category Filter
      if (activeCategory !== 'All' && product.category !== activeCategory) {
        return false;
      }
      // Color Filter
      if (activeColor && product.color !== activeColor) {
        return false;
      }
      // Price Filter
      const selectedRange = priceRanges[activePriceRange];
      const cleanPrice = parseInt(product.price.replace(/[^\d]/g, ''));
      if (cleanPrice < selectedRange.min || cleanPrice > selectedRange.max) {
        return false;
      }
      return true;
    });
  }, [activeCategory, activeColor, activePriceRange]);

  /* 
    IF THE CURRENT CATEGORY IS SUITS: Render the beautiful full-screen Snapping Editorial Lookbook layout.
    No top collections switcher, no sidebar filter panels, automatically sliding images, and automatic shining pills.
  */
  if (activeCategory === 'Suits') {
    return (
      <div className="w-screen h-screen overflow-hidden bg-[#FAF8F5] relative select-none">
        <SuitsLookbook filteredProducts={filteredProducts} />
      </div>
    );
  }

  if (activeCategory === 'Kurtis') {
    return (
      <div className="w-full min-h-screen bg-[#FAF8F5] text-[#2D2A26] relative select-none">
        <KurtisCollection filteredProducts={filteredProducts} />
      </div>
    );
  }

  if (activeCategory === 'Cord Sets') {
    return (
      <div className="w-full min-h-screen bg-[#141414] text-white relative select-none">
        <CordSetCollection filteredProducts={filteredProducts} />
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

      {/* Background glow effects - Styled per theme */}
      {activeCategory === 'All' && (
        <>
          <div className="absolute inset-0 bg-[#0F2418]/90 -z-10"></div>
          <div className="absolute top-20 left-1/4 w-[600px] h-[600px] bg-[#FFF5EB]/[0.02] rounded-full blur-[100px] -z-10"></div>
          <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-[#E89B3C]/[0.03] rounded-full blur-[100px] -z-10"></div>
        </>
      )}

      {activeCategory === 'Sarees' && (
        <>
          <div className="absolute inset-0 bg-[#06120A]/95 -z-10"></div>
          <div className="absolute top-20 left-1/4 w-[600px] h-[600px] bg-[#D4AF37]/[0.03] rounded-full blur-[120px] -z-10"></div>
          <div className="absolute bottom-20 right-1/4 w-[500px] h-[500px] bg-[#800020]/[0.04] rounded-full blur-[100px] -z-10"></div>
        </>
      )}

      {activeCategory === 'Lehengas' && (
        <>
          <div className="absolute inset-0 bg-[#FFF5F6] -z-10"></div>
          <div className="absolute top-20 right-10 w-[500px] h-[500px] bg-[#FAF0F1] rounded-full blur-[90px] -z-10"></div>
          <div className="absolute bottom-20 left-10 w-[500px] h-[500px] bg-[#E3A857]/[0.05] rounded-full blur-[110px] -z-10"></div>
        </>
      )}

      <div className="max-w-7xl mx-auto">

        {/* PREMIUM UPPER SWITCHER */}
        <div className="flex justify-center mb-16">
          <div className={`inline-flex items-center gap-1.5 p-1.5 rounded-full backdrop-blur-md border ${theme.divider} bg-white/5 shadow-md`}>
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-500 cursor-pointer ${isActive ? theme.pillActive : theme.pillInactive
                    }`}
                >
                  {cat === 'All' ? 'All Collections' : cat === 'Suits' ? 'Exclusive Suits' : cat === 'Sarees' ? 'Heritage Sarees' : cat === 'Lehengas' ? 'Couture Lehengas' : cat === 'Kurtis' ? 'Bespoke Kurtis' : 'Premium Cord Sets'}
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
            {theme.title}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <p className={`italic text-lg ${theme.accentText}`}>
              {theme.desc}
            </p>

            <button
              onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
              className={`lg:hidden flex items-center gap-2 px-4 py-2 rounded-full border border-current opacity-80 hover:opacity-100 transition-opacity`}
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </motion.div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">

          {/* SIDEBAR FILTERS */}
          <div className={`lg:w-64 flex-shrink-0 ${isMobileFiltersOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-32 space-y-10">

              {/* Category Filter in Sidebar */}
              <div>
                <h3 className={`uppercase tracking-widest text-xs mb-4 font-semibold pb-2 border-b ${theme.sidebarTitle}`}>Category</h3>
                <ul className="space-y-3">
                  {categories.map((cat) => {
                    const isSelected = activeCategory === cat;
                    return (
                      <li key={cat}>
                        <button
                          onClick={() => handleCategoryChange(cat)}
                          className={`text-sm transition-colors text-left flex items-center gap-2 w-full cursor-pointer ${isSelected ? `${theme.accentText} font-semibold` : theme.sidebarText
                            }`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? theme.sidebarDot : 'bg-transparent'}`} />
                          {cat === 'All' ? 'All Collections' : cat}
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
                  {colors.map((color) => {
                    const isSelected = activeColor === color;
                    return (
                      <button
                        key={color}
                        onClick={() => setActiveColor(isSelected ? null : color)}
                        className={`px-3 py-1.5 rounded-full text-xs transition-all border cursor-pointer ${isSelected
                            ? activeCategory === 'Sarees'
                              ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37] font-semibold'
                              : 'border-[#E3A857] bg-[#E3A857]/10 text-[#E3A857] font-semibold'
                            : activeCategory === 'Lehengas'
                              ? 'border-[#3D1B20]/15 text-[#3D1B20]/60 hover:border-[#3D1B20]/30'
                              : 'border-white/10 text-white/60 hover:border-white/30'
                          }`}
                      >
                        {color}
                      </button>
                    );
                  })}
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
                          onClick={() => setActivePriceRange(index)}
                          className={`text-sm transition-colors text-left flex items-center gap-3 w-full cursor-pointer group`}
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected
                              ? activeCategory === 'Sarees' ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-[#3D1B20] bg-[#3D1B20]'
                              : activeCategory === 'Lehengas' ? 'border-[#3D1B20]/20 group-hover:border-[#3D1B20]' : 'border-white/20 group-hover:border-[#E89B3C]'
                            }`}>
                            <Check className={`w-2.5 h-2.5 ${isSelected ? 'text-white' : 'text-transparent'}`} />
                          </div>
                          <span className={`${isSelected ? 'font-semibold' : 'opacity-70'} ${activeCategory === 'Lehengas' ? 'text-[#3D1B20]' : 'text-white'}`}>
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
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-lg opacity-60">No products found matching your current filters.</p>
                <button
                  onClick={() => { setActiveColor(null); setActivePriceRange(0); }}
                  className="mt-4 px-6 py-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className={`group relative overflow-hidden rounded-2xl border transition-all duration-500 ${theme.cardBg}`}
                    style={{
                      boxShadow: activeCategory === 'Sarees'
                        ? '0 10px 30px rgba(0,0,0,0.4), 0 0 10px rgba(212,175,55,0.02)'
                        : activeCategory === 'Lehengas'
                          ? '0 10px 30px rgba(61,27,32,0.03)'
                          : 'none'
                    }}
                  >
                    <Link to={`/product/${product.id}`} className="block relative h-[420px] overflow-hidden">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      {/* Sparkling effect on hover for Lehengas */}
                      {activeCategory === 'Lehengas' && (
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none flex items-center justify-center">
                          <Sparkles className="w-8 h-8 text-[#E3A857] animate-pulse" />
                        </div>
                      )}

                      {/* Product Tag */}
                      {product.tag && (
                        <span className={`absolute top-4 left-4 text-[10px] uppercase tracking-widest font-semibold px-3 py-1.5 rounded-full border shadow-sm ${activeCategory === 'Sarees'
                            ? 'bg-[#0B1E13] border-[#D4AF37]/30 text-[#D4AF37]'
                            : 'bg-white border-[#3D1B20]/15 text-[#3D1B20]'
                          }`}>
                          {product.tag}
                        </span>
                      )}

                      {/* Hover Actions */}
                      <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                        <button className="bg-white/95 backdrop-blur-sm p-2.5 rounded-full shadow-lg hover:bg-black hover:text-white transition-colors" onClick={(e) => e.preventDefault()}>
                          <Heart className="w-4 h-4 text-gray-800 hover:text-white" />
                        </button>
                      </div>
                    </Link>

                    {/* Product Info */}
                    <div className="p-5 font-sans">
                      <p className="opacity-50 text-[10px] uppercase tracking-wider mb-2 font-semibold">{product.category}</p>

                      <Link to={`/product/${product.id}`}>
                        <h3 className={`text-lg transition-colors duration-300 font-medium mb-1 truncate ${activeCategory === 'Sarees'
                            ? 'font-cinzel text-white group-hover:text-[#D4AF37]'
                            : 'text-[#3D1B20] group-hover:text-[#E3A857]'
                          }`}>
                          {product.name}
                        </h3>
                        {product.subtitle && (
                          <p className="text-xs opacity-60 mb-2 italic">{product.subtitle}</p>
                        )}
                      </Link>

                      <div className="flex items-center gap-1 mb-4">
                        <Star className={`w-3.5 h-3.5 fill-current ${activeCategory === 'Sarees' ? 'text-[#D4AF37]' : 'text-[#E3A857]'}`} />
                        <span className="text-xs font-semibold">{product.rating}</span>
                        <span className="text-xs opacity-40">({product.reviews})</span>
                      </div>

                      <div className="flex items-center justify-between border-t pt-4 border-current/5">
                        <span className={`text-xl font-bold ${activeCategory === 'Sarees' ? 'text-[#D4AF37]' : 'text-[#3D1B20]'}`}>{product.price}</span>
                        <Link
                          to={`/product/${product.id}`}
                          className={`flex items-center gap-2 text-xs uppercase tracking-widest font-semibold px-4 py-2.5 rounded-full transition-all duration-300 ${activeCategory === 'Sarees'
                              ? 'bg-white/10 hover:bg-[#D4AF37] hover:text-black border border-white/15'
                              : 'bg-[#3D1B20] text-white hover:bg-[#E3A857]'
                            }`}
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
            <div className="mt-20 flex justify-center border-t border-current/5 pt-10">
              <div className="flex items-center gap-2">
                <button className={`w-10 h-10 rounded-full border flex items-center justify-center cursor-pointer transition-colors ${activeCategory === 'Lehengas'
                    ? 'border-[#3D1B20]/15 hover:bg-[#3D1B20]/5 text-[#3D1B20]'
                    : 'border-white/20 hover:bg-white/10 text-white'
                  }`}>
                  1
                </button>
                <button className={`w-10 h-10 rounded-full border flex items-center justify-center cursor-pointer transition-colors ${activeCategory === 'Sarees'
                    ? 'bg-[#D4AF37] text-black border-[#D4AF37] font-semibold'
                    : 'bg-[#3D1B20] text-white border-[#3D1B20]'
                  }`}>
                  2
                </button>
                <span className="opacity-40 px-2">...</span>
                <button className={`w-10 h-10 rounded-full border flex items-center justify-center cursor-pointer transition-colors ${activeCategory === 'Lehengas'
                    ? 'border-[#3D1B20]/15 hover:bg-[#3D1B20]/5 text-[#3D1B20]'
                    : 'border-white/20 hover:bg-white/10 text-white'
                  }`}>
                  Next
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
      </div>
      <Footer isIvoryTheme={activeCategory === 'Lehengas'} />
    </div>
  );
}
