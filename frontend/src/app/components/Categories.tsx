import { motion } from 'motion/react';
import { useInView } from 'motion/react';
import { useRef, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const categories = [
  {
    name: 'Silk Sarees',
    image: 'https://images.unsplash.com/photo-1769275061088-85697a30ee50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB3b21hbiUyMHNhcmVlJTIwdHJhZGl0aW9uYWwlMjBldGhuaWN8ZW58MXx8fHwxNzc2NDIzODQ2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Timeless elegance in pure silk',
  },
  {
    name: 'Bridal Lehengas',
    image: 'https://images.unsplash.com/photo-1767955694884-d4bf352c23c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBsZWhlbmdhJTIwYnJpZGFsJTIwZXRobmljJTIwd2VhcnxlbnwxfHx8fDE3NzY0MjM4NDd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Royal dreams for your special day',
  },
  {
    name: 'Anarkali Suits',
    image: 'https://images.unsplash.com/photo-1759840278862-ef629e9b0f64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBzYWx3YXIlMjBrYW1lZXolMjB0cmFkaXRpb25hbCUyMGRyZXNzfGVufDF8fHx8MTc3NjQyMzg0N3ww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Graceful comfort meets style',
  },
  {
    name: 'Designer Kurtis',
    image: 'https://images.unsplash.com/photo-1769063382706-8156b3b33eac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBldGhuaWMlMjBrdXJ0aSUyMHdvbWFuJTIwZmFzaGlvbnxlbnwxfHx8fDE3NzY0MjM4NDd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Everyday ethnic fashion',
  },
  {
    name: 'Banarasi Sarees',
    image: 'https://images.unsplash.com/photo-1769275061088-85697a30ee50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB3b21hbiUyMHNhcmVlJTIwdHJhZGl0aW9uYWwlMjBldGhuaWN8ZW58MXx8fHwxNzc2NDIzODQ2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Heritage weaves from Banaras',
  },
  {
    name: 'Party Wear Gowns',
    image: 'https://images.unsplash.com/photo-1767955694884-d4bf352c23c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBsZWhlbmdhJTIwYnJpZGFsJTIwZXRobmljJTIwd2VhcnxlbnwxfHx8fDE3NzY0MjM4NDd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Glamorous evenings await',
  },
  {
    name: 'Sharara Sets',
    image: 'https://images.unsplash.com/photo-1759840278862-ef629e9b0f64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBzYWx3YXIlMjBrYW1lZXolMjB0cmFkaXRpb25hbCUyMGRyZXNzfGVufDF8fHx8MTc3NjQyMzg0N3ww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Flowy elegance for celebrations',
  },
  {
    name: 'Palazzo Suits',
    image: 'https://images.unsplash.com/photo-1769063382706-8156b3b33eac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBldGhuaWMlMjBrdXJ0aSUyMHdvbWFuJTIwZmFzaGlvbnxlbnwxfHx8fDE3NzY0MjM4NDd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Contemporary fusion wear',
  },
  {
    name: 'Indo-Western',
    image: 'https://images.unsplash.com/photo-1767955694884-d4bf352c23c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBsZWhlbmdhJTIwYnJpZGFsJTIwZXRobmljJTIwd2VhcnxlbnwxfHx8fDE3NzY0MjM4NDd8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Best of both worlds',
  },
  {
    name: 'Festive Collection',
    image: 'https://images.unsplash.com/photo-1769275061088-85697a30ee50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB3b21hbiUyMHNhcmVlJTIwdHJhZGl0aW9uYWwlMjBldGhuaWN8ZW58MXx8fHwxNzc2NDIzODQ2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Celebrate in style',
  },
];

export function Categories() {
  const ref = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  // currentIndex = index of the LEFT center card
  // currentIndex + 1 = RIGHT center card
  const maxIndex = categories.length - 2; // last valid pair

  const scrollTo = useCallback((direction: 'left' | 'right') => {
    if (isAnimating) return; // prevent rapid clicks
    if (direction === 'left' && currentIndex > 0) {
      setIsAnimating(true);
      setCurrentIndex(currentIndex - 1);
      setTimeout(() => setIsAnimating(false), 700);
    } else if (direction === 'right' && currentIndex < maxIndex) {
      setIsAnimating(true);
      setCurrentIndex(currentIndex + 1);
      setTimeout(() => setIsAnimating(false), 700);
    }
  }, [isAnimating, currentIndex, maxIndex]);

  const jumpTo = useCallback((index: number) => {
    if (isAnimating || index === currentIndex) return;
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 700);
  }, [isAnimating, currentIndex]);

  // Build visible card slots:
  // far-left-2, far-left-1, LEFT CENTER, RIGHT CENTER, far-right-1, far-right-2
  const slots: { index: number; role: 'far-left-2' | 'far-left-1' | 'center-left' | 'center-right' | 'far-right-1' | 'far-right-2' }[] = [];

  // Far background cards (very blurry, barely visible)
  if (currentIndex - 2 >= 0) slots.push({ index: currentIndex - 2, role: 'far-left-2' });
  if (currentIndex - 1 >= 0) slots.push({ index: currentIndex - 1, role: 'far-left-1' });

  // Center clear cards
  slots.push({ index: currentIndex, role: 'center-left' });
  slots.push({ index: currentIndex + 1, role: 'center-right' });

  // Far background cards (very blurry, barely visible)
  if (currentIndex + 2 < categories.length) slots.push({ index: currentIndex + 2, role: 'far-right-1' });
  if (currentIndex + 3 < categories.length) slots.push({ index: currentIndex + 3, role: 'far-right-2' });

  const getCardStyles = (role: string) => {
    switch (role) {
      case 'far-left-2':
        return {
          translateX: '-138%',
          zIndex: 1,
          blur: 5,
          opacity: 0.5,
          scale: 0.78,
        };
      case 'far-left-1':
        return {
          translateX: '-95%',
          zIndex: 5,
          blur: 3,
          opacity: 0.7,
          scale: 0.88,
        };
      case 'center-left':
        return {
          translateX: '-52%',
          zIndex: 20,
          blur: 0,
          opacity: 1,
          scale: 1,
        };
      case 'center-right':
        return {
          translateX: '52%',
          zIndex: 20,
          blur: 0,
          opacity: 1,
          scale: 1,
        };
      case 'far-right-1':
        return {
          translateX: '95%',
          zIndex: 5,
          blur: 3,
          opacity: 0.7,
          scale: 0.88,
        };
      case 'far-right-2':
        return {
          translateX: '138%',
          zIndex: 1,
          blur: 5,
          opacity: 0.5,
          scale: 0.78,
        };
      default:
        return { translateX: '0%', zIndex: 1, blur: 0, opacity: 0, scale: 1 };
    }
  };

  return (
    <section ref={ref} className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Premium dark green background with warm ambient glows */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0F2418] via-[#112A1C] to-[#0F2418]"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#E89B3C]/[0.04] rounded-full blur-[120px]"></div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FFF5EB]/[0.03] rounded-full blur-[100px]"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#F5E6E8]/[0.03] rounded-full blur-[80px]"></div>

      <div className="max-w-[1600px] mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl sm:text-6xl text-white mb-4 drop-shadow-lg">
            Our <span className="text-[#E89B3C] font-serif italic">Collections</span>
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto drop-shadow-sm">
            Explore our curated selection of traditional Indian wear
          </p>
        </motion.div>

        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={() => scrollTo('left')}
            disabled={currentIndex === 0}
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-30 bg-white/95 backdrop-blur-md p-4 rounded-full shadow-2xl hover:bg-[#E89B3C] hover:text-white transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/95 disabled:hover:text-gray-900"
            aria-label="Previous"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={() => scrollTo('right')}
            disabled={currentIndex >= maxIndex}
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 bg-white/95 backdrop-blur-md p-4 rounded-full shadow-2xl hover:bg-[#E89B3C] hover:text-white transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/95 disabled:hover:text-gray-900"
            aria-label="Next"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Cards Container */}
          <div className="relative h-[580px] flex items-center justify-center">
            <div className="relative w-full max-w-5xl mx-auto flex items-center justify-center">
              {slots.map(({ index, role }) => {
                const category = categories[index];
                const styles = getCardStyles(role);
                const isCenter = role === 'center-left' || role === 'center-right';
                const isFar = role.startsWith('far');

                return (
                  <motion.div
                    key={category.name}
                    animate={{
                      opacity: styles.opacity,
                      scale: styles.scale,
                      filter: `blur(${styles.blur}px)`,
                      x: styles.translateX,
                    }}
                    transition={{
                      duration: 0.7,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                    className="group absolute overflow-hidden rounded-3xl cursor-pointer"
                    style={{
                      width: '340px',
                      height: '500px',
                      zIndex: styles.zIndex,
                      boxShadow: isCenter
                        ? '0 25px 60px rgba(0,0,0,0.4), 0 0 50px rgba(232,155,60,0.1)'
                        : '0 10px 30px rgba(0,0,0,0.3)',
                    }}
                    onClick={() => {
                      if (role === 'far-left-1' || role === 'far-left-2') {
                        scrollTo('left');
                      } else if (role === 'far-right-1' || role === 'far-right-2') {
                        scrollTo('right');
                      }
                    }}
                  >
                    {/* Image — clear and vivid for center cards */}
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />

                    {/* 
                      Center cards: only a subtle dark gradient at the BOTTOM for text readability.
                      No color saturation overlay at all — image stays crystal clear.
                      
                      Background cards: heavy tinted overlay to push them back visually.
                    */}
                    {isCenter ? (
                      /* Clean bottom-only gradient for text — no tint on the image itself */
                      <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                    ) : (
                      /* Lighter tint on background cards — products still visible */
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0F2418]/60 via-[#0F2418]/25 to-[#0F2418]/10"></div>
                    )}

                    {/* Text overlay — only prominent on center cards */}
                    <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
                      <h3
                        className={`font-serif mb-2 drop-shadow-lg transition-all duration-300 ${isCenter ? 'text-3xl sm:text-4xl' : 'text-2xl'
                          }`}
                      >
                        {category.name}
                      </h3>
                      {isCenter && (
                        <>
                          <p className="text-base sm:text-lg opacity-95 mb-4 drop-shadow-md">
                            {category.description}
                          </p>
                          <div className="w-14 h-1 bg-white/80 transform origin-left transition-transform duration-500 group-hover:scale-x-150 rounded-full" />
                        </>
                      )}
                    </div>

                    {/* Shimmer on hover — center cards only */}
                    {isCenter && (
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Scroll Indicator Dots */}
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => jumpTo(index)}
                className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex
                    ? 'w-12 bg-[#E89B3C]'
                    : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
