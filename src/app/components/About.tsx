import { motion } from 'motion/react';
import { useInView } from 'motion/react';
import { useRef } from 'react';
import { Award, Heart, Sparkles, Users } from 'lucide-react';

const stats = [
  { icon: Users, value: '50K+', label: 'Happy Customers' },
  { icon: Sparkles, value: '1000+', label: 'Designs' },
  { icon: Award, value: '15+', label: 'Years of Excellence' },
  { icon: Heart, value: '98%', label: 'Customer Satisfaction' },
];

export function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section ref={ref} className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#f5ede6] to-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1774437891409-f4874cdd0ac4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB3b21hbiUyMHRyYWRpdGlvbmFsJTIwZmVzdGl2ZSUyMHdlYXJ8ZW58MXx8fHwxNzc2NDIzODQ4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Kabeer The Ethnic Store"
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#6B2C3E]/40 to-transparent"></div>
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#E89B3C] rounded-full blur-3xl opacity-30"></div>
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-[#6B2C3E] rounded-full blur-3xl opacity-30"></div>
          </motion.div>

          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl sm:text-5xl text-gray-900 mb-6">
              Where Tradition Meets{' '}
              <span className="text-[#6B2C3E] font-serif italic">Elegance</span>
            </h2>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              At Kabeer The Ethnic Store, we believe in celebrating the rich heritage of Indian
              craftsmanship. Each piece in our collection tells a story of tradition, artistry,
              and timeless beauty.
            </p>
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              From handwoven sarees to intricately embroidered lehengas, we curate ethnic wear
              that empowers women to embrace their cultural roots while making a modern statement.
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                    className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300"
                  >
                    <Icon className="w-8 h-8 text-[#6B2C3E] mb-3" />
                    <div className="text-3xl text-gray-900 mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}