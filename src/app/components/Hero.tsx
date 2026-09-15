import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { Button } from './ui/button';

export function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1769275061088-85697a30ee50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB3b21hbiUyMHNhcmVlJTIwdHJhZGl0aW9uYWwlMjBldGhuaWN8ZW58MXx8fHwxNzc2NDIzODQ2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Indian ethnic wear"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#6B2C3E]/70 via-[#8B4052]/50 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-[#E89B3C]" />
              <span className="text-[#F5B968] tracking-wider uppercase text-sm">
                Timeless Elegance
              </span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl sm:text-6xl md:text-7xl mb-6 leading-tight"
          >
            Embrace Your{' '}
            <span className="text-[#E89B3C] font-serif italic">Heritage</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl sm:text-2xl mb-8 text-gray-100"
          >
            Discover the finest collection of authentic Indian ethnic wear that
            celebrates tradition and modern elegance.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button
              size="lg"
              className="bg-[#6B2C3E] hover:bg-[#8B4052] text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              Shop Collection
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-2 border-white px-8 py-6 text-lg rounded-full backdrop-blur-sm"
            >
              Explore More
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-6 h-10 border-2 border-white rounded-full flex justify-center p-2"
        >
          <motion.div className="w-1.5 h-1.5 bg-white rounded-full"></motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}