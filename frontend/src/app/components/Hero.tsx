import { motion } from 'motion/react';

export function Hero() {
  return (
    <section className="relative h-screen flex items-end overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src="https://www.westside.com/cdn/shop/articles/eid_ethnic_wear_for_women.jpg?v=1650963225"
          alt="Indian ethnic wear"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#531323]/60 via-[#531323]/35 to-[#531323]/4
        0"></div>
      </div>

      {/* Bottom fade: maroon → dark green (seamless merge) */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-b from-transparent via-[#531323]/50 to-[#0F2418]"></div>

      {/* Content — positioned lower-left, minimal & premium */}
      <div className="relative z-10 w-full px-8 sm:px-12 lg:px-20 pb-32 sm:pb-36">
        <div className="max-w-xl">
          {/* "Kabeer" — large, commanding, cursive */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="text-white font-serif"
            style={{
              fontFamily: "'Boston Angel', 'Great Vibes'",
              fontSize: 'clamp(5rem, 10vw, 8.5rem)',
              lineHeight: 1,
              letterSpacing: '0.02em',
              textShadow: '0 4px 30px rgba(0,0,0,0.3)',
              paddingBottom: '0.2em', // To prevent cursive descender cutoff
            }}
          >
            Kabeer
          </motion.h1>

          {/* "Timeless Elegance" — elegant, spaced */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="text-[#E89B3C] italic mt-1"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(1.4rem, 2.5vw, 2rem)',
              letterSpacing: '0.08em',
              textShadow: '0 2px 20px rgba(232,155,60,0.25)',
            }}
          >
            Timeless Elegance
          </motion.p>

          {/* "Crafting Legacy in Every Thread" — subtle, refined */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-white/70 mt-3"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(1rem, 1.4vw, 1.25rem)',
              letterSpacing: '0.15em',
              fontStyle: 'italic',
            }}
          >
            Crafting Legacy in Every Thread
          </motion.p>

          {/* Subtle decorative line */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 h-[1px] w-24 origin-left"
            style={{
              background: 'linear-gradient(to right, #E89B3C, transparent)',
            }}
          />
        </div>
      </div>
    </section>
  );
}