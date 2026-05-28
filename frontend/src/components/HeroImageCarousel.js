import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

/* ── Import hero images ── */
import hero1 from '../assets/hero-1.png';
import hero2 from '../assets/hero-2.png';
import hero3 from '../assets/hero-3.png';
import hero4 from '../assets/hero-4.png';
import hero5 from '../assets/hero-5.png';

const slides = [
  { src: hero1, alt: 'A beautiful stack of colorful books with warm reading lamp', caption: 'Discover Stories', sub: 'Explore thousands of books from your community' },
  { src: hero2, alt: 'Community members exchanging books in a park', caption: 'Exchange Freely', sub: 'Trade books with fellow readers near you' },
  { src: hero3, alt: 'An open book with magical particles floating from its pages', caption: 'Unlock Knowledge', sub: 'Every page is a doorway to new worlds' },
  { src: hero4, alt: 'A cozy reading nook with bookshelves and plants', caption: 'Read & Relax', sub: 'Find your next favorite read today' },
  { src: hero5, alt: 'A global network of readers connected through literature', caption: 'Connect Globally', sub: 'Join a worldwide community of book lovers' },
];

const AUTO_PLAY_INTERVAL = 3000;

/* ── Slide transition variants ── */
const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 1.04,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: 'spring', stiffness: 200, damping: 28 },
      opacity: { duration: 0.5 },
      scale: { duration: 0.5 },
    },
  },
  exit: (direction) => ({
    x: direction > 0 ? '-60%' : '60%',
    opacity: 0,
    scale: 0.96,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  }),
};

const captionVariants = {
  enter: { opacity: 0, y: 20 },
  center: { opacity: 1, y: 0, transition: { delay: 0.25, duration: 0.5 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

/**
 * HeroImageCarousel — Premium full-width carousel with text captions,
 * animated progress bar, thumbnail strip, and play/pause controls.
 */
export default function HeroImageCarousel() {
  const [[currentIndex, direction], setSlide] = useState([0, 0]);
  const [isHovered, setIsHovered] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(null);

  const paginate = useCallback((newDirection) => {
    setSlide(([prev]) => {
      const next = (prev + newDirection + slides.length) % slides.length;
      return [next, newDirection];
    });
    setProgress(0);
  }, []);

  const goToSlide = useCallback((index) => {
    setSlide(([prev]) => [index, index > prev ? 1 : -1]);
    setProgress(0);
  }, []);

  /* Auto-play with progress tracking */
  useEffect(() => {
    if (isPaused || isHovered) {
      cancelAnimationFrame(progressRef.current);
      return;
    }

    const startTime = Date.now();
    const baseProgress = progress;

    const animateProgress = () => {
      const elapsed = Date.now() - startTime;
      const remaining = AUTO_PLAY_INTERVAL * (1 - baseProgress / 100);
      const newProgress = baseProgress + ((elapsed / remaining) * (100 - baseProgress));

      if (newProgress >= 100) {
        setProgress(0);
        paginate(1);
      } else {
        setProgress(newProgress);
        progressRef.current = requestAnimationFrame(animateProgress);
      }
    };

    progressRef.current = requestAnimationFrame(animateProgress);

    return () => {
      cancelAnimationFrame(progressRef.current);
    };
  }, [isPaused, isHovered, currentIndex, paginate, progress]);

  /* Keyboard navigation */
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowLeft') paginate(-1);
      if (e.key === 'ArrowRight') paginate(1);
      if (e.key === ' ') { e.preventDefault(); setIsPaused(p => !p); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [paginate]);

  return (
    <div
      className="hero-carousel"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="region"
      aria-label="Hero image carousel"
      aria-roledescription="carousel"
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '720px',
        aspectRatio: '16 / 9',
        margin: '0 auto',
        borderRadius: 'var(--r-xl)',
        overflow: 'hidden',
        perspective: '1200px',
      }}
    >
      {/* Glowing border ring */}
      <div className="hero-carousel-glow" />

      {/* ── Slides ── */}
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.img
          key={currentIndex}
          src={slides[currentIndex].src}
          alt={slides[currentIndex].alt}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: 'var(--r-xl)',
          }}
          draggable={false}
        />
      </AnimatePresence>

      {/* ── Gradient overlays ── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, transparent 30%, rgba(5,3,15,0.65) 100%)',
        borderRadius: 'var(--r-xl)',
        pointerEvents: 'none', zIndex: 1,
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(90deg, rgba(5,3,15,0.3) 0%, transparent 40%)',
        borderRadius: 'var(--r-xl)',
        pointerEvents: 'none', zIndex: 1,
      }} />

      {/* ── Caption overlay ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          variants={captionVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="carousel-caption"
          style={{
            position: 'absolute',
            bottom: '3.5rem', left: '1.75rem',
            zIndex: 2, maxWidth: '55%',
          }}
        >
          <h3 style={{
            fontSize: 'clamp(1.1rem, 2.5vw, 1.6rem)',
            fontWeight: 800, color: '#fff',
            margin: 0, lineHeight: 1.2,
            textShadow: '0 2px 12px rgba(0,0,0,0.5)',
          }}>
            {slides[currentIndex].caption}
          </h3>
          <p style={{
            fontSize: 'clamp(0.72rem, 1.2vw, 0.88rem)',
            color: 'rgba(255,255,255,0.75)',
            margin: '0.3rem 0 0',
            textShadow: '0 1px 8px rgba(0,0,0,0.4)',
          }}>
            {slides[currentIndex].sub}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* ── Navigation buttons ── */}
      <motion.button
        className="carousel-nav-btn carousel-nav-prev"
        onClick={() => paginate(-1)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Previous slide"
      >
        <ChevronLeft size={18} />
      </motion.button>

      <motion.button
        className="carousel-nav-btn carousel-nav-next"
        onClick={() => paginate(1)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Next slide"
      >
        <ChevronRight size={18} />
      </motion.button>

      {/* ── Bottom bar: Progress + Dots + Play/Pause ── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        zIndex: 3, padding: '0 1.25rem 0.85rem',
        display: 'flex', alignItems: 'center', gap: '0.75rem',
      }}>
        {/* Progress bar */}
        <div style={{
          flex: 1, height: '3px', borderRadius: '2px',
          background: 'rgba(255,255,255,0.15)',
          overflow: 'hidden',
        }}>
          <motion.div
            style={{
              height: '100%', borderRadius: '2px',
              background: 'linear-gradient(90deg, var(--violet), var(--indigo))',
              width: `${progress}%`,
            }}
            transition={{ duration: 0.05 }}
          />
        </div>

        {/* Dot indicators */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {slides.map((_, i) => (
            <motion.button
              key={i}
              className={`carousel-dot ${i === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(i)}
              whileHover={{ scale: 1.3 }}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === currentIndex ? 'true' : undefined}
            />
          ))}
        </div>

        {/* Play/Pause */}
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsPaused(p => !p)}
          aria-label={isPaused ? 'Play carousel' : 'Pause carousel'}
          style={{
            width: 24, height: 24, borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.25)',
            background: 'rgba(0,0,0,0.3)',
            backdropFilter: 'blur(8px)',
            color: '#fff', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', padding: 0,
          }}
        >
          {isPaused ? <Play size={10} /> : <Pause size={10} />}
        </motion.button>
      </div>

      {/* ── Thumbnail strip ── */}
      <div className="carousel-thumbnails" style={{
        position: 'absolute', bottom: '0.85rem', right: '1.25rem',
        zIndex: 3, display: 'flex', gap: '0.35rem',
      }}>
        {slides.map((slide, i) => (
          <motion.button
            key={i}
            onClick={() => goToSlide(i)}
            whileHover={{ scale: 1.08, y: -2 }}
            aria-label={`Go to slide ${i + 1}`}
            style={{
              width: 40, height: 28,
              borderRadius: '6px',
              overflow: 'hidden',
              border: i === currentIndex ? '2px solid rgba(168,85,247,0.8)' : '1px solid rgba(255,255,255,0.15)',
              opacity: i === currentIndex ? 1 : 0.5,
              cursor: 'pointer',
              padding: 0,
              transition: 'all 0.25s ease',
              boxShadow: i === currentIndex ? '0 0 10px rgba(168,85,247,0.3)' : 'none',
            }}
          >
            <img
              src={slide.src}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              draggable={false}
            />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
