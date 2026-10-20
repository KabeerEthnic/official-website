import { motion } from 'motion/react';
import { Link } from 'react-router';

import logoImg from '../../imports/logo.webp';

// Velvet: the brand maroon with soft vertical folds and a darker hem.
const DRAPE_STYLE = {
  backgroundColor: '#531323',
  backgroundImage: [
    'linear-gradient(to bottom, rgba(0,0,0,0) 70%, rgba(0,0,0,0.35))',
    'repeating-linear-gradient(90deg, rgba(0,0,0,0.28) 0px, rgba(255,255,255,0.06) 28px, rgba(0,0,0,0.28) 56px)',
  ].join(', '),
};

const VALANCE_STYLE = {
  backgroundColor: '#3E0E1A',
  backgroundImage:
    'repeating-linear-gradient(90deg, rgba(0,0,0,0.25) 0px, rgba(255,255,255,0.05) 20px, rgba(0,0,0,0.25) 40px)',
  // Scalloped hem along the bottom edge.
  maskImage: 'radial-gradient(circle at 30px 0, #000 56px, transparent 57px)',
  maskSize: '60px 100%',
  WebkitMaskImage: 'radial-gradient(circle at 30px 0, #000 56px, transparent 57px)',
  WebkitMaskSize: '60px 100%',
};

const DRAW = { duration: 1.1, ease: [0.65, 0, 0.35, 1] };

/**
 * The closed-for-now screen shoppers see while the curtain is down. It covers
 * the whole storefront; only signing in stays reachable, so an administrator
 * can always get back to the switch.
 */
export function SiteCurtain({ curtain }) {
  return (
    <div className="fixed inset-0 z-[100] overflow-hidden bg-[#0F2418]" role="main">
      <motion.div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-1/2 shadow-[12px_0_40px_rgba(0,0,0,0.45)]"
        style={DRAPE_STYLE}
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        transition={DRAW}
      />
      <motion.div
        aria-hidden="true"
        className="absolute inset-y-0 right-0 w-1/2 shadow-[-12px_0_40px_rgba(0,0,0,0.45)]"
        style={DRAPE_STYLE}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        transition={DRAW}
      />
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-16" style={VALANCE_STYLE} />
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-[#E89B3C]/70" />

      <motion.div
        className="absolute inset-0 z-10 overflow-y-auto"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <div className="flex min-h-full items-center justify-center px-4 py-24">
          <div className="w-full max-w-lg rounded-3xl border border-[#E89B3C]/25 bg-[#0F2418]/85 px-6 py-10 text-center shadow-2xl backdrop-blur-md sm:px-10">
            <img src={logoImg} alt="Kabeer The Ethnic Store" className="mx-auto h-16 w-auto drop-shadow-lg" />
            <div className="mx-auto my-6 h-px w-16 bg-[#E89B3C]" />
            <h1 className="font-serif text-3xl text-white sm:text-4xl">{curtain.title}</h1>
            {curtain.message ? (
              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-white/70 sm:text-base">
                {curtain.message}
              </p>
            ) : null}
          </div>
        </div>
      </motion.div>

      <Link
        to="/login"
        className="absolute bottom-5 left-1/2 z-10 -translate-x-1/2 text-xs uppercase tracking-[0.25em] text-white/35 transition-colors hover:text-[#E89B3C]"
      >
        Staff sign in
      </Link>
    </div>
  );
}

/** A slim reminder for administrators, who still see the real storefront. */
export function CurtainNotice() {
  return (
    <div className="fixed bottom-4 left-1/2 z-[90] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center justify-between gap-3 rounded-full border border-[#E89B3C]/40 bg-[#531323]/95 px-5 py-2.5 text-xs text-white shadow-xl backdrop-blur-md">
      <span>
        <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#E89B3C] align-middle" />
        Curtain is down — shoppers can't see the store.
      </span>
      <Link to="/admin" className="whitespace-nowrap text-[#E89B3C] transition-colors hover:text-white">
        Manage
      </Link>
    </div>
  );
}
