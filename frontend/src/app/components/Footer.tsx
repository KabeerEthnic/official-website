import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const TAGLINES = [
  "Kabeer — The Ethnic Store",
  "Handcrafted Elegance since 2011",
  "Timeless Indian Silhouettes",
  "Tailored Luxury, Curated Traditions",
  "Crafted with Love, Styled with Grace"
];

interface FooterProps {
  isIvoryTheme?: boolean;
}

export function Footer({ isIvoryTheme = false }: FooterProps) {
  const [taglineIdx, setTaglineIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineIdx((prev) => (prev + 1) % TAGLINES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const bgColor = isIvoryTheme ? 'bg-[#FAF8F5]' : 'bg-gradient-to-b from-[#0A1C14] to-[#060F0A]';
  const textColor = isIvoryTheme ? 'text-[#2D2A26]' : 'text-gray-300';
  const accentColor = isIvoryTheme ? 'text-[#8C7E7A]' : 'text-[#51424c]';
  const dividerColor = isIvoryTheme ? 'border-[#2D2A26]/10' : 'border-gray-800';

  return (
    <footer className={`${bgColor} ${textColor} transition-colors duration-500 w-full`}>
      <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col items-center justify-center text-center">
        {/* Brand Name */}
        <h3 className="font-cormorant text-2xl md:text-3xl font-light uppercase tracking-widest mb-3">
          {isIvoryTheme ? (
            <span>Kabeer <span className="font-semibold">Boutique</span></span>
          ) : (
            <span>Kabeer <span className="text-[#51424c] font-normal">The Ethnic Store</span></span>
          )}
        </h3>

        {/* Dynamic Animating Tagline */}
        <div className="h-6 flex items-center justify-center overflow-hidden mb-5 relative w-full">
          <AnimatePresence mode="wait">
            <motion.p
              key={taglineIdx}
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -15, opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className={`text-xs md:text-sm font-sans font-medium tracking-[0.25em] uppercase ${accentColor}`}
            >
              {TAGLINES[taglineIdx]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Divider */}
        <div className={`w-20 border-t ${dividerColor} mb-5`} />

        {/* Copyright */}
        <p className="text-[10px] md:text-xs font-sans tracking-widest opacity-60">
          © 2026 KABEER THE ETHNIC STORE. ALL RIGHTS RESERVED.
        </p>
      </div>
    </footer>
  );
}