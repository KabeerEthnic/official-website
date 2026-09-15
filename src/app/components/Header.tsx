import { useState, useEffect } from 'react';
import { ShoppingBag, Menu, X, Search, Heart, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import logoImg from '../../imports/image.png';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = ['Sarees', 'Lehengas', 'Suits', 'Kurtis', 'Accessories'];

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-white/90 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-shrink-0"
          >
            <img src={logoImg} alt="Kabeer The Ethnic Store" className="h-16 w-auto" />
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="text-gray-700 hover:text-[#6B2C3E] transition-colors relative group"
              >
                {link}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#E89B3C] group-hover:w-full transition-all duration-300"></span>
              </a>
            ))}
          </nav>

          {/* Icons */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="p-2 hover:text-[#6B2C3E] transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 hover:text-[#6B2C3E] transition-colors">
              <Heart className="w-5 h-5" />
            </button>
            <button className="p-2 hover:text-[#6B2C3E] transition-colors">
              <User className="w-5 h-5" />
            </button>
            <button className="p-2 hover:text-[#6B2C3E] transition-colors relative">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-[#6B2C3E] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                0
              </span>
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t"
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link}
                  href={`#${link.toLowerCase()}`}
                  className="block py-2 text-gray-700 hover:text-rose-700 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link}
                </a>
              ))}
              <div className="flex space-x-4 pt-4 border-t">
                <button className="p-2 hover:text-rose-700 transition-colors">
                  <Search className="w-5 h-5" />
                </button>
                <button className="p-2 hover:text-rose-700 transition-colors">
                  <Heart className="w-5 h-5" />
                </button>
                <button className="p-2 hover:text-rose-700 transition-colors">
                  <User className="w-5 h-5" />
                </button>
                <button className="p-2 hover:text-rose-700 transition-colors relative">
                  <ShoppingBag className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    0
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}