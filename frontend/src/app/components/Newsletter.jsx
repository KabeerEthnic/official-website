import { motion } from 'motion/react';
import { useInView } from 'motion/react';
import { useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from './ui/button.jsx';
import { Input } from './ui/input.jsx';
import { newsletter } from '../../lib/api/index.js';

export function Newsletter({ data = {} }) {
  const {
    title = '',
    titleAccent = '',
    description = '',
    buttonLabel = 'Subscribe',
    note = '',
  } = data;

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || status === 'saving') return;

    setStatus('saving');
    try {
      await newsletter.subscribe(email);
      setStatus('done');
      setMessage('Thank you — we will be in touch.');
      setEmail('');
    } catch (error) {
      setStatus('error');
      setMessage(error.message);
    }
  };

  return (
    <section ref={ref} className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0F2418] via-[#112A1C] to-[#0D1F15]"></div>

      {/* Decorative warm glows */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/[0.05] rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#E89B3C]/[0.08] rounded-full blur-3xl"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center text-white"
        >


          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-4xl sm:text-5xl mb-6"
          >
            {title}{' '}
            <span className="font-serif italic">{titleAccent}</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl mb-8 text-rose-50"
          >
            {description}
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
              disabled={status === 'saving'}
              className="bg-white text-[#531323] hover:bg-[#f5ede6] px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              {status === 'saving' ? 'Subscribing' : status === 'done' ? 'Subscribed' : buttonLabel}
              <Send className="w-5 h-5 ml-2" />
            </Button>
          </motion.form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-sm text-[#ffffff] mt-4"
          >
            {message || note}
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}