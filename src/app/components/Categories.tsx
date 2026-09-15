import { motion } from 'motion/react';
import { useInView } from 'motion/react';
import { useRef } from 'react';

const categories = [
  {
    name: 'Sarees',
    image: 'https://images.unsplash.com/photo-1769275061088-85697a30ee50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB3b21hbiUyMHNhcmVlJTIwdHJhZGl0aW9uYWwlMjBldGhuaWN8ZW58MXx8fHwxNzc2NDIzODQ2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'Timeless elegance in every drape',
    color: 'from-[#6B2C3E] to-[#8B4052]',
  },
  {
    name: 'Lehengas',
    image: 'https://images.unsplash.com/photo-1767955694884-d4bf352c23c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBsZWhlbmdhJTIwYnJpZGFsJTIwZXRobmljJTIwd2VhcnxlbnwxfHx8fDE3NzY0MjM4NDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'Bridal dreams come alive',
    color: 'from-[#E89B3C] to-[#D4823A]',
  },
  {
    name: 'Suits',
    image: 'https://images.unsplash.com/photo-1759840278862-ef629e9b0f64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBzYWx3YXIlMjBrYW1lZXolMjB0cmFkaXRpb25hbCUyMGRyZXNzfGVufDF8fHx8MTc3NjQyMzg0N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'Graceful comfort meets style',
    color: 'from-[#A14A5A] to-[#6B2C3E]',
  },
  {
    name: 'Kurtis',
    image: 'https://images.unsplash.com/photo-1769063382706-8156b3b33eac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBldGhuaWMlMjBrdXJ0aSUyMHdvbWFuJTIwZmFzaGlvbnxlbnwxfHx8fDE3NzY0MjM4NDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    description: 'Everyday ethnic fashion',
    color: 'from-[#C28950] to-[#E89B3C]',
  },
];

function CategoryCard({ category, index }: { category: typeof categories[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group relative overflow-hidden rounded-2xl aspect-[3/4] cursor-pointer"
    >
      <img
        src={category.image}
        alt={category.name}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-40 group-hover:opacity-60 transition-opacity duration-300`}></div>
      <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
        <motion.h3
          className="text-3xl mb-2"
          initial={{ y: 20, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
          transition={{ delay: index * 0.1 + 0.3 }}
        >
          {category.name}
        </motion.h3>
        <motion.p
          className="text-sm opacity-90"
          initial={{ y: 20, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
          transition={{ delay: index * 0.1 + 0.4 }}
        >
          {category.description}
        </motion.p>
        <motion.div
          className="mt-4 w-12 h-0.5 bg-white origin-left"
          initial={{ scaleX: 0 }}
          whileHover={{ scaleX: 1 }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  );
}

export function Categories() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section ref={ref} className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-[#f5ede6]">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl text-[#2d1b20] mb-4">
            Our <span className="text-[#6B2C3E] font-serif italic">Collections</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore our curated selection of traditional Indian wear, crafted with love and attention to detail
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <CategoryCard key={category.name} category={category} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}