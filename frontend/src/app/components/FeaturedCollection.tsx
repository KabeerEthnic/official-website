import { motion } from 'motion/react';
import { useInView } from 'motion/react';
import { useRef, useState, useEffect } from 'react';
import { Star, Heart, ShoppingCart, ChevronUp, ChevronDown } from 'lucide-react';

const productsColumn1 = [
  {
    id: 1,
    name: 'Royal Silk Saree',
    price: '₹12,999',
    image: 'https://images.unsplash.com/photo-1769275061088-85697a30ee50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB3b21hbiUyMHNhcmVlJTIwdHJhZGl0aW9uYWwlMjBldGhuaWN8ZW58MXx8fHwxNzc2NDIzODQ2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.8,
    reviews: 234,
  },
  {
    id: 2,
    name: 'Banarasi Elegance',
    price: '₹15,499',
    image: 'https://images.unsplash.com/photo-1769275061088-85697a30ee50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB3b21hbiUyMHNhcmVlJTIwdHJhZGl0aW9uYWwlMjBldGhuaWN8ZW58MXx8fHwxNzc2NDIzODQ2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 5.0,
    reviews: 189,
  },
  {
    id: 3,
    name: 'Chanderi Drape',
    price: '₹9,999',
    image: 'https://images.unsplash.com/photo-1769275061088-85697a30ee50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB3b21hbiUyMHNhcmVlJTIwdHJhZGl0aW9uYWwlMjBldGhuaWN8ZW58MXx8fHwxNzc2NDIzODQ2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.6,
    reviews: 156,
  },
  {
    id: 4,
    name: 'Georgette Beauty',
    price: '₹7,999',
    image: 'https://images.unsplash.com/photo-1769275061088-85697a30ee50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB3b21hbiUyMHNhcmVlJTIwdHJhZGl0aW9uYWwlMjBldGhuaWN8ZW58MXx8fHwxNzc2NDIzODQ2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.7,
    reviews: 203,
  },
];

const productsColumn2 = [
  {
    id: 5,
    name: 'Designer Lehenga',
    price: '₹25,999',
    image: 'https://images.unsplash.com/photo-1767955694884-d4bf352c23c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBsZWhlbmdhJTIwYnJpZGFsJTIwZXRobmljJTIwd2VhcnxlbnwxfHx8fDE3NzY0MjM4NDd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 5.0,
    reviews: 412,
  },
  {
    id: 6,
    name: 'Bridal Collection',
    price: '₹32,999',
    image: 'https://images.unsplash.com/photo-1767955694884-d4bf352c23c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBsZWhlbmdhJTIwYnJpZGFsJTIwZXRobmljJTIwd2VhcnxlbnwxfHx8fDE3NzY0MjM4NDd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.9,
    reviews: 567,
  },
  {
    id: 7,
    name: 'Royal Wedding Lehenga',
    price: '₹28,499',
    image: 'https://images.unsplash.com/photo-1767955694884-d4bf352c23c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBsZWhlbmdhJTIwYnJpZGFsJTIwZXRobmljJTIwd2VhcnxlbnwxfHx8fDE3NzY0MjM4NDd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.8,
    reviews: 298,
  },
  {
    id: 8,
    name: 'Embroidered Masterpiece',
    price: '₹22,999',
    image: 'https://images.unsplash.com/photo-1767955694884-d4bf352c23c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBsZWhlbmdhJTIwYnJpZGFsJTIwZXRobmljJTIwd2VhcnxlbnwxfHx8fDE3NzY0MjM4NDd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.7,
    reviews: 334,
  },
];

function ProductColumn({ products, columnIndex }: { products: typeof productsColumn1; columnIndex: number }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollUp, setCanScrollUp] = useState(true);
  const [canScrollDown, setCanScrollDown] = useState(false);

  // Scroll to bottom on mount so user sees the last card first
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      // Use requestAnimationFrame to ensure the DOM has rendered
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight - el.clientHeight;
        handleScroll(); // update button states
      });
    }
  }, []);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    setCanScrollUp(scrollTop > 20);
    setCanScrollDown(scrollTop < scrollHeight - clientHeight - 20);
  };

  const scroll = (direction: 'up' | 'down') => {
    if (!scrollRef.current) return;
    const scrollAmount = 400;
    scrollRef.current.scrollBy({
      top: direction === 'down' ? scrollAmount : -scrollAmount,
      behavior: 'smooth'
    });
  };

  return (
    <div className="relative">
      {/* Scroll Up Button — at top, scroll to reveal more cards above */}
      <button
        onClick={() => scroll('up')}
        disabled={!canScrollUp}
        className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-white shadow-2xl p-3 rounded-full hover:bg-[#531323] hover:text-white transition-all duration-300 ${!canScrollUp ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        aria-label="Scroll up"
      >
        <ChevronUp className="w-5 h-5" />
      </button>

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="h-[800px] overflow-y-auto scrollbar-hide scroll-smooth relative"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <div className="space-y-0">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: columnIndex * 0.1 + index * 0.1 }}
              className="group relative overflow-hidden mb-4 rounded-2xl"
              style={{
                height: '600px',
                background: 'linear-gradient(135deg, #ffffff 0%, #FFF9F0 50%, #FFF5EB 100%)',
                boxShadow: '0 8px 32px rgba(83,19,35,0.12), 0 0 0 1px rgba(232,155,60,0.08)',
              }}
            >
              {/* Product Image - Takes most of the card */}
              <div className="relative h-[440px] overflow-hidden rounded-t-2xl">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="bg-white/95 backdrop-blur-sm p-3 rounded-full shadow-xl hover:bg-[#531323] hover:text-white transition-colors">
                    <Heart className="w-5 h-5" />
                  </button>
                  <button className="bg-white/95 backdrop-blur-sm p-3 rounded-full shadow-xl hover:bg-[#531323] hover:text-white transition-colors">
                    <ShoppingCart className="w-5 h-5" />
                  </button>
                </div>

                {/* Gradient overlay at bottom of image */}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#FFF9F0] to-transparent" />
              </div>

              {/* Price and Review Section */}
              <div className="relative h-[160px] px-6 pt-4 pb-6" style={{ background: 'linear-gradient(180deg, #FFF9F0 0%, #ffffff 100%)' }}>
                <h3 className="text-2xl mb-3 text-[#2d1b20] group-hover:text-[#531323] transition-colors duration-300 font-semibold">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(product.rating)
                            ? 'fill-[#E89B3C] text-[#E89B3C]'
                            : 'fill-gray-200 text-gray-200'
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-[#531323] font-medium">{product.rating}</span>
                  <span className="text-sm text-[#6b5e58]">({product.reviews} reviews)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-3xl text-[#531323] font-bold">{product.price}</span>
                  <button className="bg-[#531323] hover:bg-[#731830] text-white px-6 py-2.5 rounded-full transition-all duration-300 transform group-hover:scale-105 shadow-lg hover:shadow-xl font-medium">
                    Add to Cart
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Scroll Down Button — at bottom */}
      <button
        onClick={() => scroll('down')}
        disabled={!canScrollDown}
        className={`absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-20 bg-white shadow-2xl p-3 rounded-full hover:bg-[#531323] hover:text-white transition-all duration-300 ${!canScrollDown ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        aria-label="Scroll down"
      >
        <ChevronDown className="w-5 h-5" />
      </button>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

export function FeaturedCollection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section ref={ref} className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Premium dark green background with warm glows */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0F2418] via-[#0D1F15] to-[#0F2418]"></div>
      <div className="absolute top-20 left-1/4 w-[600px] h-[600px] bg-[#FFF5EB]/[0.03] rounded-full blur-[100px]"></div>
      <div className="absolute bottom-20 right-1/4 w-[500px] h-[500px] bg-[#E89B3C]/[0.04] rounded-full blur-[100px]"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] bg-[#F5E6E8]/[0.03] rounded-full blur-[120px]"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl sm:text-6xl text-white mb-4 drop-shadow-lg">
            <span className="text-[#E89B3C] font-serif italic">Featured</span> Collection
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto drop-shadow-sm">
            Handpicked pieces that define elegance and celebrate your special moments
          </p>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <ProductColumn products={productsColumn1} columnIndex={0} />
          <ProductColumn products={productsColumn2} columnIndex={1} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <button className="bg-gradient-to-r from-[#531323] to-[#E89B3C] hover:from-[#731830] hover:to-[#D4823A] text-white px-16 py-5 text-lg rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
            View All Products
          </button>
        </motion.div>
      </div>
    </section>
  );
}
