import { motion, AnimatePresence } from 'motion/react';
import { useInView } from 'motion/react';
import { useRef, useState, useEffect, useCallback } from 'react';
import { Award, Heart, Sparkles, Users, Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';

/** Icon names the CMS stores, resolved to the icons this section draws with. */
const STAT_ICONS = { users: Users, sparkles: Sparkles, award: Award, heart: Heart };

export function About({ data = {} }) {
  const slides = data.slides ?? [];

  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFading, setIsFading] = useState(false);

  // Transition to a new slide with fade
  const transitionToSlide = useCallback(
    (nextIndex) => {
      if (isFading) return;
      setIsFading(true);

      // Wait for fade-out, then switch
      setTimeout(() => {
        setCurrentSlide(nextIndex);
        setIsFading(false);
      }, 600); // matches the exit animation duration
    },
    [isFading]
  );

  // Auto-advance when video ends
  const handleVideoEnd = useCallback(() => {
    const nextIndex = (currentSlide + 1) % slides.length;
    transitionToSlide(nextIndex);
  }, [currentSlide, slides.length, transitionToSlide]);

  // Play / Pause sync
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play().catch(() => { });
    } else {
      video.pause();
    }
  }, [isPlaying, currentSlide, isFading]);

  // Navigation handlers
  const goNext = () => {
    const nextIndex = (currentSlide + 1) % slides.length;
    transitionToSlide(nextIndex);
  };

  const goPrev = () => {
    const prevIndex = (currentSlide - 1 + slides.length) % slides.length;
    transitionToSlide(prevIndex);
  };

  const togglePlay = () => setIsPlaying((prev) => !prev);

  const slide = slides[currentSlide];

  if (!slide) return null;

  return (
    <section
      ref={sectionRef}
      className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
    >
      {/* Premium dark green background with warm glows */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0F2418] via-[#112A1C] to-[#0F2418]"></div>
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-[#FFF5EB]/[0.03] rounded-full blur-[100px]"></div>
      <div className="absolute bottom-1/3 left-1/3 w-[400px] h-[400px] bg-[#E89B3C]/[0.04] rounded-full blur-[80px]"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Video Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/5]">
              <AnimatePresence mode="wait">
                {!isFading && (
                  <motion.video
                    key={`video-${currentSlide}`}
                    ref={videoRef}
                    src={slide.videoUrl}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    autoPlay={isPlaying}
                    onEnded={handleVideoEnd}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                  />
                )}
              </AnimatePresence>

              {/* Subtle gradient at bottom of video */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F2418]/50 via-transparent to-transparent pointer-events-none"></div>
            </div>

            {/* Decorative glows */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#E89B3C] rounded-full blur-3xl opacity-40"></div>
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-[#E89B3C] rounded-full blur-3xl opacity-30"></div>

            {/* Progress bar showing current video position */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 rounded-full overflow-hidden">
              <VideoProgressBar
                videoRef={videoRef}
                isPlaying={isPlaying}
                currentSlide={currentSlide}
              />
            </div>
          </motion.div>

          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col"
          >
            <AnimatePresence mode="wait">
              {!isFading && (
                <motion.div
                  key={`content-${currentSlide}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                >
                  <h2 className="text-4xl sm:text-5xl text-white mb-6 drop-shadow-lg">
                    {slide.title}{' '}
                    <span className="text-[#E89B3C] font-serif italic">
                      {slide.highlight}
                    </span>
                  </h2>
                  <p className="text-lg text-white/90 mb-10 leading-relaxed">
                    {slide.description}
                  </p>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-5">
                    {slide.stats.map((stat, index) => {
                      const Icon = STAT_ICONS[stat.icon] ?? Sparkles;
                      return (
                        <motion.div
                          key={`${stat.label}-${index}`}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.5,
                            delay: 0.15 + index * 0.08,
                          }}
                          className="relative rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300 border border-white/15 group"
                          style={{
                            background:
                              'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,249,240,0.08) 50%, rgba(232,155,60,0.06) 100%)',
                            backdropFilter: 'blur(12px)',
                          }}
                        >
                          <div className="absolute -inset-1 bg-gradient-to-br from-[#E89B3C]/10 to-[#FFF5EB]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl"></div>
                          <Icon className="w-7 h-7 text-[#E89B3C] mb-2" />
                          <div className="text-2xl sm:text-3xl text-white mb-1 font-bold">
                            {stat.value}
                          </div>
                          <div className="text-sm text-white/75">{stat.label}</div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Controls — centered at bottom */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex items-center justify-center gap-6 mt-14"
        >
          <button
            onClick={goPrev}
            className="w-12 h-12 rounded-full border border-white/20 bg-white/5 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white hover:bg-white/15 hover:border-[#E89B3C]/40 transition-all duration-300"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={togglePlay}
            className="w-14 h-14 rounded-full border border-white/25 bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-[#E89B3C]/20 hover:border-[#E89B3C]/50 transition-all duration-300"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-0.5" />
            )}
          </button>

          <button
            onClick={goNext}
            className="w-12 h-12 rounded-full border border-white/20 bg-white/5 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white hover:bg-white/15 hover:border-[#E89B3C]/40 transition-all duration-300"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Slide indicator dots */}
          <div className="flex items-center gap-2 ml-4">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (index !== currentSlide) transitionToSlide(index);
                }}
                className={`h-2 rounded-full transition-all duration-400 ${index === currentSlide
                    ? 'w-8 bg-[#E89B3C]'
                    : 'w-2 bg-white/30 hover:bg-white/60'
                  }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Sub-component: animated progress bar synced to video playback
function VideoProgressBar({ videoRef, isPlaying, currentSlide }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(0);
  }, [currentSlide]);

  useEffect(() => {
    let raf;

    const update = () => {
      const video = videoRef.current;
      if (video && video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
      raf = requestAnimationFrame(update);
    };

    if (isPlaying) {
      raf = requestAnimationFrame(update);
    }

    return () => cancelAnimationFrame(raf);
  }, [videoRef, isPlaying, currentSlide]);

  return (
    <div
      className="h-full bg-gradient-to-r from-[#E89B3C] to-[#F5B968] rounded-full transition-[width] duration-100"
      style={{ width: `${progress}%` }}
    />
  );
}