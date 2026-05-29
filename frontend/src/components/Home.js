import { Link } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, useMotionValue, useTransform, useSpring, useScroll, useInView, AnimatePresence } from 'framer-motion';
import {
  BookOpen, ArrowLeftRight, PlusCircle, MessageSquare,
  Bookmark, Star, Search, Users, TrendingUp, MapPin,
  ArrowRight, Zap, Shield, Heart, Layers, Globe, Sparkles,
  Quote, ChevronRight, Library, BookMarked, Flame, Award
} from 'lucide-react';
import HeroImageCarousel from './HeroImageCarousel';

/* ══════════════════════════════════════════════════════════════
   ANIMATION HELPERS
   ══════════════════════════════════════════════════════════════ */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] },
});

const fadeScale = (delay = 0) => ({
  initial: { opacity: 0, scale: 0.9 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] },
});

const stagger = {
  initial: {},
  whileInView: {},
  viewport: { once: true },
  transition: { staggerChildren: 0.12 },
};

const childFade = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
};

/* ══════════════════════════════════════════════════════════════
   TYPING EFFECT
   ══════════════════════════════════════════════════════════════ */
function TypingText({ words, className }) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[index];
    const timeout = setTimeout(() => {
      if (!deleting) {
        setText(word.substring(0, text.length + 1));
        if (text.length + 1 === word.length) {
          setTimeout(() => setDeleting(true), 1800);
        }
      } else {
        setText(word.substring(0, text.length - 1));
        if (text.length === 0) {
          setDeleting(false);
          setIndex((i) => (i + 1) % words.length);
        }
      }
    }, deleting ? 40 : 80);
    return () => clearTimeout(timeout);
  }, [text, deleting, index, words]);

  return (
    <span className={className}>
      {text}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
        style={{ display: 'inline-block', width: '3px', height: '1em', background: 'var(--violet)', marginLeft: '2px', verticalAlign: 'text-bottom' }}
      />
    </span>
  );
}

/* ══════════════════════════════════════════════════════════════
   PARTICLE SYSTEM
   ══════════════════════════════════════════════════════════════ */
function ParticleField() {
  const particles = useMemo(() =>
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 8,
      opacity: Math.random() * 0.5 + 0.1,
      color: ['#a855f7', '#6366f1', '#f472b6', '#22d3ee', '#818cf8'][Math.floor(Math.random() * 5)],
    })), []);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {particles.map(p => (
        <motion.div
          key={p.id}
          animate={{
            y: [0, -80, 0],
            x: [0, (Math.random() - 0.5) * 40, 0],
            opacity: [p.opacity, p.opacity * 1.8, p.opacity],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: p.color,
            boxShadow: `0 0 ${p.size * 4}px ${p.color}`,
            filter: 'blur(0.5px)',
          }}
        />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MOUSE PARALLAX
   ══════════════════════════════════════════════════════════════ */
function useMouseParallax() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouse = useCallback((e) => {
    const { clientX, clientY } = e;
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    mouseX.set((clientX - cx) / cx);
    mouseY.set((clientY - cy) / cy);
  }, [mouseX, mouseY]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, [handleMouse]);

  return { mouseX, mouseY };
}

/* ══════════════════════════════════════════════════════════════
   3D TILT WRAPPER
   ══════════════════════════════════════════════════════════════ */
function Tilt3D({ children, intensity = 10, glare = true, style = {} }) {
  const ref = useRef(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 200, damping: 25 });
  const springY = useSpring(rotateY, { stiffness: 200, damping: 25 });
  const glareOpacity = useMotionValue(0);
  const glareXVal = useMotionValue(50);
  const glareYVal = useMotionValue(50);

  const handleMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    rotateX.set(-y * intensity);
    rotateY.set(x * intensity);
    glareOpacity.set(0.15);
    glareXVal.set((x + 0.5) * 100);
    glareYVal.set((y + 0.5) * 100);
  };

  const handleLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    glareOpacity.set(0);
  };

  const glareBackground = useTransform(
    [glareXVal, glareYVal],
    ([gx, gy]) => `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.2), transparent 60%)`
  );

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        ...style,
        perspective: '1000px',
        transformStyle: 'preserve-3d',
        rotateX: springX,
        rotateY: springY,
        position: 'relative',
      }}
    >
      {children}
      {glare && (
        <motion.div
          style={{
            position: 'absolute', inset: 0,
            borderRadius: 'inherit',
            background: glareBackground,
            opacity: glareOpacity,
            pointerEvents: 'none',
            zIndex: 10,
          }}
        />
      )}
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   ANIMATED COUNTER
   ══════════════════════════════════════════════════════════════ */
function AnimatedCounter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const num = parseInt(target.replace(/[^\d]/g, ''), 10);
          const duration = 1800;
          const step = Math.ceil(num / (duration / 16));
          let current = 0;
          const timer = setInterval(() => {
            current += step;
            if (current >= num) { current = num; clearInterval(timer); }
            setCount(current);
          }, 16);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ══════════════════════════════════════════════════════════════
   MARQUEE
   ══════════════════════════════════════════════════════════════ */
function InfiniteMarquee({ items, speed = 30 }) {
  return (
    <div className="marquee-wrapper">
      <motion.div
        className="marquee-track"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
      >
        {[...items, ...items].map((item, i) => (
          <div key={i} className="marquee-item">
            <span style={{ color: 'var(--violet)', display: 'flex' }}>{item.icon}</span>
            <span>{item.text}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   DATA
   ══════════════════════════════════════════════════════════════ */
const features = [
  { icon: <Search size={24} />,         color: '#6366f1', title: 'Browse & Discover',   desc: 'Search thousands of books by genre, condition, or location. Filter to find exactly what you love.' },
  { icon: <ArrowLeftRight size={24} />, color: '#a855f7', title: 'Book Exchange',        desc: 'Send requests and swap books with members in your city. No money needed — just love for reading.' },
  { icon: <PlusCircle size={24} />,     color: '#f472b6', title: 'List Your Books',      desc: 'Upload books you no longer need with photos and a description. Done in under 60 seconds.' },
  { icon: <MessageSquare size={24} />,  color: '#22d3ee', title: 'Real‑time Chat',       desc: 'Coordinate pickups and negotiate exchanges via built-in live messaging with any book owner.' },
  { icon: <Bookmark size={24} />,       color: '#fb923c', title: 'Wishlist',             desc: 'Save books for later. Get notified the moment a wishlisted title becomes available near you.' },
  { icon: <Star size={24} />,           color: '#facc15', title: 'Ratings & Reviews',   desc: 'Rate every exchange. Build a trusted reputation that makes future swaps faster and easier.' },
];

const steps = [
  { num: '01', title: 'Create Your Account', desc: 'Sign up in seconds. Add your city and start exploring.', icon: <Users size={28} /> },
  { num: '02', title: 'List or Browse',       desc: 'Upload books to share or search community listings.', icon: <Library size={28} /> },
  { num: '03', title: 'Request & Exchange',   desc: 'Chat with owners and arrange a convenient pickup — free.', icon: <ArrowLeftRight size={28} /> },
];

const stats = [
  { value: '10', suffix: 'K+', label: 'Books Listed',    icon: <BookOpen size={22} /> },
  { value: '5',  suffix: 'K+', label: 'Active Members',  icon: <Users size={22} /> },
  { value: '8',  suffix: 'K+', label: 'Exchanges Done',  icon: <TrendingUp size={22} /> },
  { value: '50', suffix: '+',  label: 'Cities Covered',  icon: <MapPin size={22} /> },
];

const marqueeItems = [
  { icon: <Zap size={16} />,       text: 'Instant Matching' },
  { icon: <Shield size={16} />,    text: 'Verified Members' },
  { icon: <Heart size={16} />,     text: 'Community First' },
  { icon: <Globe size={16} />,     text: 'Global Reach' },
  { icon: <Layers size={16} />,    text: 'Smart Catalog' },
  { icon: <Flame size={16} />,     text: 'Trending Now' },
  { icon: <Award size={16} />,     text: 'Top Rated' },
  { icon: <BookMarked size={16} />,text: 'Curated Lists' },
];

const testimonials = [
  { name: 'Priya S.', role: 'Avid Reader', text: 'This platform changed how I read. I\'ve exchanged over 30 books and met amazing people!', color: '#a855f7' },
  { name: 'Rahul M.', role: 'Book Collector', text: 'Finally a place where my old books find new homes. The chat feature is super smooth.', color: '#6366f1' },
  { name: 'Sneha K.', role: 'Student', text: 'Saved so much money on textbooks. The wishlist feature notifies me instantly!', color: '#f472b6' },
];

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════ */
export default function Home() {
  const { mouseX, mouseY } = useMouseParallax();

  const orbX1 = useTransform(mouseX, [-1, 1], [-30, 30]);
  const orbY1 = useTransform(mouseY, [-1, 1], [-20, 20]);
  const orbX2 = useTransform(mouseX, [-1, 1], [20, -20]);
  const orbY2 = useTransform(mouseY, [-1, 1], [15, -15]);
  const orbX3 = useTransform(mouseX, [-1, 1], [-15, 15]);
  const orbY3 = useTransform(mouseY, [-1, 1], [-10, 10]);

  return (
    <div style={{ backgroundColor: 'var(--bg-base)', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ═════════════════ HERO ═════════════════ */}
      <section className="hero" style={{ minHeight: '100vh', paddingTop: '7rem', position: 'relative' }}>

        <ParticleField />

        {/* Animated gradient mesh */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
          <div className="hero-mesh" />
        </div>

        {/* Mouse-tracking orbs */}
        <motion.div className="hero-orb hero-orb-1" style={{ x: orbX1, y: orbY1 }} />
        <motion.div className="hero-orb hero-orb-2" style={{ x: orbX2, y: orbY2 }} />
        <motion.div className="hero-orb hero-orb-3" style={{ x: orbX3, y: orbY3 }} />

        {/* Extra animated orb */}
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.12, 0.25, 0.12] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', width: '600px', height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)',
            top: '10%', left: '50%', transform: 'translateX(-50%)',
            filter: 'blur(60px)', pointerEvents: 'none',
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>

          {/* Sparkle badge */}
          <motion.div {...fadeUp(0)} style={{ display: 'flex', justifyContent: 'center' }}>
            <motion.div
              className="hero-badge"
              whileHover={{ scale: 1.05 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Sparkles size={14} />
              </motion.div>
              Community Book Exchange Platform
            </motion.div>
          </motion.div>

          {/* Headline with typing effect */}
          <motion.h1 {...fadeUp(0.1)} className="hero-title">
            Share Books.<br />
            <TypingText
              words={['Build Community.', 'Discover Stories.', 'Connect Readers.', 'Spark Joy.']}
              className="text-grad hero-title-animated"
            />
          </motion.h1>

          {/* Sub */}
          <motion.p {...fadeUp(0.2)} className="hero-subtitle">
            Discover, exchange, and share books with people in your city.
            Turn your shelf into someone else's next adventure — completely free.
          </motion.p>

          {/* CTAs */}
          <motion.div {...fadeUp(0.3)} className="hero-cta">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link to="/browse" className="btn btn-primary btn-lg" style={{ gap: '0.6rem' }}>
                <Search size={18} /> Browse Books
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link to="/register" className="btn btn-ghost btn-lg" style={{ gap: '0.6rem' }}>
                Get Started Free <ArrowRight size={18} />
              </Link>
            </motion.div>
          </motion.div>

          {/* Hero Image Carousel with 3D Tilt */}
          <motion.div {...fadeUp(0.38)} style={{ marginBottom: '3rem' }}>
            <Tilt3D intensity={6} style={{ borderRadius: 'var(--r-xl)' }}>
              <HeroImageCarousel />
            </Tilt3D>
          </motion.div>
        </div>
      </section>

      {/* ═════════════════ MARQUEE STRIP ═════════════════ */}
      <section className="marquee-section">
        <InfiniteMarquee items={marqueeItems} speed={25} />
      </section>

      {/* ═════════════════ STATS STRIP ═════════════════ */}
      <section style={{ padding: '0 1.5rem 5rem' }}>
        <motion.div {...fadeUp(0)} className="container">
          <div className="stats-strip">
            {stats.map((s, i) => (
              <motion.div key={i} {...childFade} className="stats-strip-item" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="stats-icon-wrap">
                  {s.icon}
                </div>
                <div className="stats-strip-value">
                  <AnimatedCounter target={s.value} suffix={s.suffix} />
                </div>
                <div className="stats-strip-label">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ═════════════════ BENTO FEATURES ═════════════════ */}
      <section className="section">
        <div className="container">
          <motion.div {...fadeUp(0)} className="text-center" style={{ marginBottom: '4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <span className="section-tag"><Zap size={13} /> Everything You Need</span>
            </div>
            <h2 className="section-title">
              Platform <span className="text-grad">Features</span>
            </h2>
            <p className="section-subtitle">
              A complete ecosystem for book lovers to share, discover and connect across your city.
            </p>
          </motion.div>

          <div className="bento-grid">
            {features.map((f, i) => (
              <motion.div
                key={i}
                {...fadeScale(i * 0.08)}
                className="bento-card"
              >
                <div className="bento-card-glow" style={{ background: `radial-gradient(circle at 30% 30%, ${f.color}15, transparent 70%)` }} />
                <div
                  className="feature-icon"
                  style={{
                    background: `${f.color}18`,
                    border: `1px solid ${f.color}40`,
                    color: f.color,
                  }}
                >
                  {f.icon}
                </div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
                <div className="bento-card-line" style={{ background: `linear-gradient(90deg, ${f.color}, transparent)` }} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═════════════════ HOW IT WORKS — Timeline ═════════════════ */}
      <section className="section" style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <motion.div {...fadeUp(0)} className="text-center" style={{ marginBottom: '4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <span className="section-tag" style={{ color: 'var(--cyan)', background: 'rgba(34,211,238,0.1)', borderColor: 'rgba(34,211,238,0.2)' }}>
                <ArrowLeftRight size={13} /> Simple Process
              </span>
            </div>
            <h2 className="section-title">How It <span className="text-grad-aurora">Works</span></h2>
            <p className="section-subtitle">Three simple steps to start exchanging books with your community.</p>
          </motion.div>

          <div className="timeline-container">
            {steps.map((s, i) => (
              <motion.div key={i} {...fadeUp(i * 0.15)} className="timeline-step">
                <div className="timeline-icon-wrap">
                  <motion.div
                    className="timeline-icon"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {s.icon}
                  </motion.div>
                  {i < steps.length - 1 && <div className="timeline-connector" />}
                </div>
                <div className="timeline-content">
                  <span className="timeline-num">{s.num}</span>
                  <h3 className="step-title">{s.title}</h3>
                  <p className="step-desc">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═════════════════ TESTIMONIALS ═════════════════ */}
      <section className="section">
        <div className="container">
          <motion.div {...fadeUp(0)} className="text-center" style={{ marginBottom: '4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <span className="section-tag" style={{ color: '#f472b6', background: 'rgba(244,114,182,0.1)', borderColor: 'rgba(244,114,182,0.2)' }}>
                <Heart size={13} /> Community Love
              </span>
            </div>
            <h2 className="section-title">What Readers <span className="text-grad">Say</span></h2>
            <p className="section-subtitle">Join thousands of happy readers who are already sharing books.</p>
          </motion.div>

          <div className="testimonial-grid">
            {testimonials.map((t, i) => (
              <motion.div key={i} {...fadeUp(i * 0.12)} className="testimonial-card">
                <div className="testimonial-quote-icon" style={{ color: t.color }}>
                  <Quote size={24} />
                </div>
                <p className="testimonial-text">{t.text}</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar" style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}88)` }}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-role">{t.role}</div>
                  </div>
                </div>
                <div className="testimonial-glow" style={{ background: `radial-gradient(circle at 50% 100%, ${t.color}12, transparent 70%)` }} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═════════════════ CTA BANNER ═════════════════ */}
      <section className="section">
        <div className="container">
          <motion.div {...fadeUp(0)} className="cta-banner-premium">
            {/* Animated background elements */}
            <div className="cta-bg-element cta-bg-1" />
            <div className="cta-bg-element cta-bg-2" />
            <div className="cta-bg-element cta-bg-3" />

            <motion.div {...fadeUp(0.1)} style={{ position: 'relative', zIndex: 1 }}>
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{ display: 'inline-block', marginBottom: '1.5rem' }}
              >
                <BookOpen size={40} style={{ color: '#c084fc' }} />
              </motion.div>
              <h2 className="cta-banner-title">
                Ready to Start <span className="text-grad">Exchanging?</span>
              </h2>
              <p className="cta-banner-subtitle">
                Join thousands of readers already sharing books and building real community connections.
              </p>
              <div className="cta-actions">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                  <Link to="/register" className="btn btn-primary btn-lg">
                    <BookOpen size={18} /> Create Free Account
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                  <Link to="/browse" className="btn btn-ghost btn-lg">
                    <Search size={18} /> Browse Books First
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}