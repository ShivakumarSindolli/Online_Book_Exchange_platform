import { Link } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import {
  BookOpen, ArrowLeftRight, PlusCircle, MessageSquare,
  Bookmark, Star, Search, Users, TrendingUp, MapPin,
  ArrowRight, Zap, Shield, Heart, Layers, Globe, Sparkles
} from 'lucide-react';
import HeroImageCarousel from './HeroImageCarousel';

/* ══════════════════════════════════════════════════════════════
   ANIMATION HELPERS
   ══════════════════════════════════════════════════════════════ */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] },
});

const stagger = {
  initial: {},
  whileInView: {},
  viewport: { once: true },
  transition: { staggerChildren: 0.1 },
};

const childFade = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
};

/* ══════════════════════════════════════════════════════════════
   PARTICLE SYSTEM — Floating luminous dots in the hero
   ══════════════════════════════════════════════════════════════ */
function ParticleField() {
  const particles = useMemo(() =>
    Array.from({ length: 40 }, (_, i) => ({
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
   MOUSE PARALLAX — Move hero elements based on cursor position
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
   3D TILT WRAPPER — Gives children a 3D tilt on mouse hover
   ══════════════════════════════════════════════════════════════ */
function Tilt3D({ children, intensity = 10, glare = true, style = {} }) {
  const ref = useRef(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 200, damping: 25 });
  const springY = useSpring(rotateY, { stiffness: 200, damping: 25 });
  const glareOpacity = useMotionValue(0);
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);

  const handleMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    rotateX.set(-y * intensity);
    rotateY.set(x * intensity);
    glareOpacity.set(0.15);
    glareX.set((x + 0.5) * 100);
    glareY.set((y + 0.5) * 100);
  };

  const handleLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    glareOpacity.set(0);
  };

  const glareBackground = useTransform(
    [glareX, glareY],
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
   ANIMATED COUNTER — Counts up numbers on scroll
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
   DATA
   ══════════════════════════════════════════════════════════════ */
const features = [
  { icon: <Search size={22} />,         color: '#6366f1', title: 'Browse & Discover',   desc: 'Search thousands of books by genre, condition, or location. Filter to find exactly what you love.' },
  { icon: <ArrowLeftRight size={22} />, color: '#a855f7', title: 'Book Exchange',        desc: 'Send requests and swap books with members in your city. No money needed — just love for reading.' },
  { icon: <PlusCircle size={22} />,     color: '#f472b6', title: 'List Your Books',      desc: 'Upload books you no longer need with photos and a description. Done in under 60 seconds.' },
  { icon: <MessageSquare size={22} />,  color: '#22d3ee', title: 'Real‑time Chat',       desc: 'Coordinate pickups and negotiate exchanges via built-in live messaging with any book owner.' },
  { icon: <Bookmark size={22} />,       color: '#fb923c', title: 'Wishlist',             desc: 'Save books for later. Get notified the moment a wishlisted title becomes available near you.' },
  { icon: <Star size={22} />,           color: '#facc15', title: 'Ratings & Reviews',   desc: 'Rate every exchange. Build a trusted reputation that makes future swaps faster and easier.' },
];

const steps = [
  { num: '01', title: 'Create Your Account', desc: 'Sign up in seconds. Add your city and start exploring books in your community immediately.' },
  { num: '02', title: 'List or Browse',       desc: 'Upload books you want to share, or search through what community members have listed.' },
  { num: '03', title: 'Request & Exchange',   desc: 'Send a request, chat with the owner, and arrange a convenient pickup — completely free.' },
];

const stats = [
  { value: '10', suffix: 'K+', label: 'Books Listed',    icon: <BookOpen size={20} /> },
  { value: '5',  suffix: 'K+', label: 'Active Members',  icon: <Users size={20} /> },
  { value: '8',  suffix: 'K+', label: 'Exchanges Done',  icon: <TrendingUp size={20} /> },
  { value: '50', suffix: '+',  label: 'Cities Covered',  icon: <MapPin size={20} /> },
];

const pillars = [
  { icon: <Zap size={16} />,       text: 'Instant Matching' },
  { icon: <Shield size={16} />,    text: 'Verified Members' },
  { icon: <Heart size={16} />,     text: 'Community First' },
  { icon: <Globe size={16} />,     text: 'Global Reach' },
  { icon: <Layers size={16} />,    text: 'Smart Catalog' },
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

        {/* Particle field */}
        <ParticleField />

        {/* Animated gradient mesh */}
        <div style={{
          position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0,
        }}>
          <div className="hero-mesh" />
        </div>

        {/* Mouse-tracking orbs */}
        <motion.div className="hero-orb hero-orb-1" style={{ x: orbX1, y: orbY1 }} />
        <motion.div className="hero-orb hero-orb-2" style={{ x: orbX2, y: orbY2 }} />
        <motion.div className="hero-orb hero-orb-3" style={{ x: orbX3, y: orbY3 }} />

        {/* Extra animated orbs */}
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

          {/* Headline */}
          <motion.h1 {...fadeUp(0.1)} className="hero-title">
            Share Books.<br />
            <span className="text-grad hero-title-animated">Build Community.</span>
          </motion.h1>

          {/* Sub */}
          <motion.p {...fadeUp(0.2)} className="hero-subtitle">
            Discover, exchange, and share books with people in your city.
            Turn your shelf into someone else's next adventure — completely free.
          </motion.p>

          {/* Pillar chips */}
          <motion.div {...fadeUp(0.25)} style={{
            display: 'flex', justifyContent: 'center', gap: '0.6rem',
            flexWrap: 'wrap', marginBottom: '2.5rem',
          }}>
            {pillars.map((p, i) => (
              <motion.span
                key={i}
                whileHover={{ scale: 1.08, y: -2 }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                  fontSize: '0.78rem', fontWeight: 600,
                  color: 'var(--text-2)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r-full)',
                  padding: '0.35rem 0.85rem',
                  backdropFilter: 'blur(12px)',
                  cursor: 'default',
                  transition: 'border-color 0.2s ease',
                }}
              >
                <span style={{ color: 'var(--violet)' }}>{p.icon}</span>{p.text}
              </motion.span>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div {...fadeUp(0.3)} className="hero-cta">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link to="/browse" className="btn btn-primary btn-lg">
                <Search size={18} /> Browse Books
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link to="/register" className="btn btn-ghost btn-lg">
                Get Started Free <ArrowRight size={18} />
              </Link>
            </motion.div>
          </motion.div>


          {/* ── Hero Image Carousel with 3D Tilt ── */}
          <motion.div {...fadeUp(0.38)} style={{ marginBottom: '3rem' }}>
            <Tilt3D intensity={6} style={{ borderRadius: 'var(--r-xl)' }}>
              <HeroImageCarousel />
            </Tilt3D>
          </motion.div>
        </div>
      </section>

      {/* ═════════════════ STATS STRIP ═════════════════ */}
      <section style={{ padding: '0 1.5rem 5rem' }}>
        <motion.div {...fadeUp(0)} className="container">
          <div className="stats-strip">
            {stats.map((s, i) => (
              <motion.div key={i} {...childFade} className="stats-strip-item" style={{ animationDelay: `${i * 0.1}s` }}>
                <div style={{ color: 'var(--violet)', marginBottom: '0.6rem', display: 'flex', justifyContent: 'center' }}>{s.icon}</div>
                <div className="stats-strip-value">
                  <AnimatedCounter target={s.value} suffix={s.suffix} />
                </div>
                <div className="stats-strip-label">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ═════════════════ FEATURES ═════════════════ */}
      <section className="section">
        <div className="container">
          <motion.div {...fadeUp(0)} className="text-center" style={{ marginBottom: '3.5rem' }}>
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

          <motion.div
            {...stagger}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}
          >
            {features.map((f, i) => (
              <motion.div key={i} {...childFade} className="feature-card">
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
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═════════════════ HOW IT WORKS ═════════════════ */}
      <section className="section" style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <motion.div {...fadeUp(0)} className="text-center" style={{ marginBottom: '3.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <span className="section-tag" style={{ color: 'var(--cyan)', background: 'rgba(34,211,238,0.1)', borderColor: 'rgba(34,211,238,0.2)' }}>
                <ArrowLeftRight size={13} /> Simple Process
              </span>
            </div>
            <h2 className="section-title">How It <span className="text-grad-aurora">Works</span></h2>
            <p className="section-subtitle">Three simple steps to start exchanging books with your community.</p>
          </motion.div>

          <motion.div {...stagger} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {steps.map((s, i) => (
              <motion.div key={i} {...childFade} className="step-card">
                <div className="step-number">{s.num}</div>
                <h3 className="step-title">{s.title}</h3>
                <p className="step-desc">{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═════════════════ CTA BANNER ═════════════════ */}
      <section className="section">
        <div className="container">
          <motion.div {...fadeUp(0)} className="cta-banner">
            <motion.div {...fadeUp(0.1)}>
              <h2 className="cta-banner-title">
                Ready to Start Exchanging?
              </h2>
              <p className="cta-banner-subtitle">
                Join thousands of readers already sharing books and building real community connections.
              </p>
              <div className="cta-actions">
                <Link to="/register" className="btn btn-primary btn-lg">
                  <BookOpen size={18} /> Create Free Account
                </Link>
                <Link to="/browse" className="btn btn-ghost btn-lg">
                  <Search size={18} /> Browse Books First
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}