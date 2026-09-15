import { useState, useEffect } from 'react';
import { ShoppingBag, Search, Heart, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router';
import logoImg from '../../imports/image.png';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const navLinks = ['Tote Bags', 'Suits', 'Kurtis', 'Cord Sets'];

  return (
    <>
      {/* Floating Logo — top left */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-5 left-6 z-50"
      >
        <Link to="/" onClick={() => setIsMenuOpen(false)}>
          <img
            src={logoImg}
            alt="Kabeer The Ethnic Store"
            className="h-12 w-auto drop-shadow-lg"
          />
        </Link>
      </motion.div>

      {/* Floating Hamburger Button — top right */}
      <motion.button
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="fixed top-5 right-6 z-[60] w-11 h-11 flex flex-col items-center justify-center gap-[5px] rounded-xl bg-black/30 backdrop-blur-md border border-white/10 hover:bg-black/50 transition-all duration-300"
        aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
      >
        <span
          className="block h-[2px] rounded-full bg-white transition-all duration-300 origin-center"
          style={{
            width: isMenuOpen ? '20px' : '22px',
            transform: isMenuOpen ? 'rotate(45deg) translateY(7px)' : 'none',
          }}
        />
        <span
          className="block h-[2px] rounded-full bg-white transition-all duration-300"
          style={{
            width: '16px',
            opacity: isMenuOpen ? 0 : 1,
            transform: isMenuOpen ? 'translateX(8px)' : 'none',
          }}
        />
        <span
          className="block h-[2px] rounded-full bg-white transition-all duration-300 origin-center"
          style={{
            width: isMenuOpen ? '20px' : '12px',
            transform: isMenuOpen ? 'rotate(-45deg) translateY(-7px)' : 'none',
          }}
        />
      </motion.button>

      {/* Overlay + Sidebar */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Blurred backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-[55] bg-black/40 backdrop-blur-sm"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Vertical Sidebar — slides in from right */}
            <motion.nav
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="fixed top-0 right-0 h-full z-[58] flex flex-col"
              style={{
                width: '40%',
                minWidth: '320px',
                maxWidth: '480px',
                background: 'linear-gradient(180deg, #0a0a0a 0%, #111111 50%, #0a0a0a 100%)',
                borderRadius: '24px 0 0 24px',
                boxShadow: '-8px 0 40px rgba(0,0,0,0.5), -2px 0 12px rgba(0,0,0,0.3)',
              }}
            >
              {/* Top spacing for hamburger area */}
              <div className="h-20" />

              {/* Nav Links */}
              <div className="flex-1 px-10 py-6">
                <div className="mb-10">
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="text-white/40 text-xs uppercase tracking-[0.2em] mb-6"
                  >
                    Navigation
                  </motion.p>

                  {/* Shop All Link */}
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      to="/shop"
                      className="block py-4 text-[#E89B3C] text-2xl font-light transition-colors duration-300 border-b border-white/5 group"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="flex items-center justify-between">
                        Shop All
                        <span className="text-white/0 group-hover:text-[#E89B3C]/60 transition-all duration-300 text-sm">→</span>
                      </span>
                    </Link>
                  </motion.div>

                  {/* Categories */}
                  {navLinks.map((link, index) => (
                    <motion.div
                      key={link}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: 0.17 + index * 0.07,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <Link
                        to={`/shop?category=${link.toLowerCase()}`}
                        className="block py-4 text-white text-2xl font-light hover:text-[#E89B3C] transition-colors duration-300 border-b border-white/5 last:border-b-0 group"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span className="flex items-center justify-between">
                          {link}
                          <span className="text-white/0 group-hover:text-[#E89B3C]/60 transition-all duration-300 text-sm">→</span>
                        </span>
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Action Icons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                >
                  <p className="text-white/40 text-xs uppercase tracking-[0.2em] mb-5">
                    Quick Actions
                  </p>
                  <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/8 border border-white/10 hover:bg-white/15 text-white/80 hover:text-[#E89B3C] transition-all duration-300 text-sm">
                      <Search className="w-4 h-4" />
                      <span>Search</span>
                    </button>
                    <button className="p-2.5 rounded-full bg-white/8 border border-white/10 hover:bg-white/15 text-white/80 hover:text-[#E89B3C] transition-all duration-300">
                      <Heart className="w-4 h-4" />
                    </button>
                    <Link to="/account" onClick={() => setIsMenuOpen(false)} className="p-2.5 rounded-full bg-white/8 border border-white/10 hover:bg-white/15 text-white/80 hover:text-[#E89B3C] transition-all duration-300">
                      <User className="w-4 h-4" />
                    </Link>
                    <Link to="/cart" onClick={() => setIsMenuOpen(false)} className="p-2.5 rounded-full bg-white/8 border border-white/10 hover:bg-white/15 text-white/80 hover:text-[#E89B3C] transition-all duration-300 relative inline-flex">
                      <ShoppingBag className="w-4 h-4" />
                      <span className="absolute -top-1 -right-1 bg-[#E89B3C] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-medium">
                        0
                      </span>
                    </Link>
                  </div>
                </motion.div>
              </div>

              {/* Footer area */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="px-10 py-8 border-t border-white/5"
              >
                <p className="text-white/30 text-xs">
                  © 2025 Kabeer The Ethnic Store
                </p>
                <p className="text-white/20 text-[11px] mt-1">
                  Tradition · Elegance · Craftsmanship
                </p>
              </motion.div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}