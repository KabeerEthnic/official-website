import { motion } from 'motion/react';
import { useInView } from 'motion/react';
import { useRef, useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

export function Newsletter() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log('Subscribing:', email);
    setEmail('');
  };

  return (
    <section ref={ref} className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#6B2C3E] via-[#8B4052] to-[#A14A5A]"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#E89B3C]/20 rounded-full blur-3xl"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center text-white"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : { scale: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 mb-6 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full"
          >
            <Sparkles className="w-5 h-5 text-[#E89B3C]" />
            <span className="text-[#F5B968] tracking-wider uppercase text-sm">
              Exclusive Offers
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-4xl sm:text-5xl mb-6"
          >
            Stay Connected with{' '}
            <span className="font-serif italic">Kabeer</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl mb-8 text-rose-50"
          >
            Subscribe to our newsletter and get 15% off on your first order. Be the first to know
            about new arrivals and exclusive collections.
          </motion.p>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto"
          >
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 bg-white/90 backdrop-blur-sm border-0 px-6 py-6 text-gray-900 placeholder:text-gray-500 rounded-full text-lg focus:ring-2 focus:ring-white"
            />
            <Button
              type="submit"
              size="lg"
              className="bg-white text-[#6B2C3E] hover:bg-[#f5ede6] px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              Subscribe
              <Send className="w-5 h-5 ml-2" />
            </Button>
          </motion.form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-sm text-[#F5B968] mt-4"
          >
            We respect your privacy. Unsubscribe anytime.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}