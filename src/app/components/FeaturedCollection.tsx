import { motion } from 'motion/react';
import { useInView } from 'motion/react';
import { useRef } from 'react';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';

const products = [
  {
    id: 1,
    name: 'Royal Silk Saree',
    price: '₹12,999',
    image: 'https://cpimg.tistatic.com/8284836/b/4/ethnic-dress.jpg',
    rating: 4.8,
    reviews: 234,
  },
  {
    id: 2,
    name: 'Designer Lehenga',
    price: '₹25,999',
    image: 'https://images.unsplash.com/photo-1767955694884-d4bf352c23c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBsZWhlbmdhJTIwYnJpZGFsJTIwZXRobmljJTIwd2VhcnxlbnwxfHx8fDE3NzY0MjM4NDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    rating: 5.0,
    reviews: 412,
  },
  {
    id: 3,
    name: 'Embroidered Suit Set',
    price: '₹8,499',
    image: 'https://images.unsplash.com/photo-1759840278862-ef629e9b0f64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBzYWx3YXIlMjBrYW1lZXolMjB0cmFkaXRpb25hbCUyMGRyZXNzfGVufDF8fHx8MTc3NjQyMzg0N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    rating: 4.6,
    reviews: 189,
  },
];

function ProductCard({ product, index }: { product: typeof products[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-shadow duration-300"
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-[#6B2C3E] hover:text-white transition-colors">
            <Heart className="w-5 h-5" />
          </button>
          <button className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-[#6B2C3E] hover:text-white transition-colors">
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl mb-2 text-gray-900">{product.name}</h3>
        <div className="flex items-center gap-1 mb-3">
          <Star className="w-4 h-4 fill-[#E89B3C] text-[#E89B3C]" />
          <span className="text-sm text-gray-700">{product.rating}</span>
          <span className="text-sm text-gray-500">({product.reviews} reviews)</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-2xl text-[#6B2C3E]">{product.price}</span>
          <Button className="bg-[#6B2C3E] hover:bg-[#8B4052] text-white rounded-full">
            Add to Cart
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export function FeaturedCollection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section ref={ref} className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl text-gray-900 mb-4">
            <span className="text-[#6B2C3E] font-serif italic">Featured</span> Collection
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Handpicked pieces that define elegance and celebrate your special moments
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-12"
        >
          <Button
            size="lg"
            className="bg-gradient-to-r from-[#6B2C3E] to-[#E89B3C] hover:from-[#8B4052] hover:to-[#D4823A] text-white px-12 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            View All Products
          </Button>
        </motion.div>
      </div>
    </section>
  );
}