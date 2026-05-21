import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen, ArrowLeftRight, PlusCircle, MessageSquare,
  Bookmark, Star, Search, Users, TrendingUp, MapPin,
  ArrowRight, Zap, Shield, Heart
} from 'lucide-react';

/* ── animation helpers ── */
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

/* ── data ── */
const features = [
  { icon: <Search size={22} />,         color: '#6366f1', glow: 'rgba(99,102,241,0.35)',  title: 'Browse & Discover',   desc: 'Search thousands of books by genre, condition, or location. Filter to find exactly what you love.' },
  { icon: <ArrowLeftRight size={22} />, color: '#a855f7', glow: 'rgba(168,85,247,0.35)', title: 'Book Exchange',        desc: 'Send requests and swap books with members in your city. No money needed — just love for reading.' },
  { icon: <PlusCircle size={22} />,     color: '#f472b6', glow: 'rgba(244,114,182,0.35)',title: 'List Your Books',      desc: 'Upload books you no longer need with photos and a description. Done in under 60 seconds.' },
  { icon: <MessageSquare size={22} />,  color: '#22d3ee', glow: 'rgba(34,211,238,0.35)', title: 'Real‑time Chat',       desc: 'Coordinate pickups and negotiate exchanges via built-in live messaging with any book owner.' },
  { icon: <Bookmark size={22} />,       color: '#fb923c', glow: 'rgba(251,146,60,0.35)', title: 'Wishlist',             desc: 'Save books for later. Get notified the moment a wishlisted title becomes available near you.' },
  { icon: <Star size={22} />,           color: '#facc15', glow: 'rgba(250,204,21,0.35)', title: 'Ratings & Reviews',   desc: 'Rate every exchange. Build a trusted reputation that makes future swaps faster and easier.' },
];

const steps = [
  { num: '01', title: 'Create Your Account', desc: 'Sign up in seconds. Add your city and start exploring books in your community immediately.' },
  { num: '02', title: 'List or Browse',       desc: 'Upload books you want to share, or search through what community members have listed.' },
  { num: '03', title: 'Request & Exchange',   desc: 'Send a request, chat with the owner, and arrange a convenient pickup — completely free.' },
];

const stats = [
  { value: '10K+', label: 'Books Listed',    icon: <BookOpen size={20} /> },
  { value: '5K+',  label: 'Active Members',  icon: <Users size={20} /> },
  { value: '8K+',  label: 'Exchanges Done',  icon: <TrendingUp size={20} /> },
  { value: '50+',  label: 'Cities Covered',  icon: <MapPin size={20} /> },
];

const pillars = [
  { icon: <Zap size={18} />,    text: 'Instant Matching' },
  { icon: <Shield size={18} />, text: 'Verified Members' },
  { icon: <Heart size={18} />,  text: 'Community First' },
];

/* ── floating book mini-cards ── */
const floatingBooks = [
  { title: 'Atomic Habits', author: 'James Clear',    color: '#6366f1' },
  { title: 'Deep Work',     author: 'Cal Newport',    color: '#a855f7' },
  { title: 'Sapiens',       author: 'Yuval N. Harari', color: '#f472b6' },
];

export default function Home() {
  return (
    <div style={{ backgroundColor: '#05030f', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ===== HERO ===== */}
      <section className="hero" style={{ minHeight: '100vh', paddingTop: '7rem' }}>
        {/* Orbs */}
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <motion.div {...fadeUp(0)} style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="hero-badge">
              <BookOpen size={13} /> Community Book Exchange Platform
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1 {...fadeUp(0.1)} className="hero-title">
            Share Books.<br />
            <span className="text-grad">Build Community.</span>
          </motion.h1>

          {/* Sub */}
          <motion.p {...fadeUp(0.2)} className="hero-subtitle">
            Discover, exchange, and share books with people in your city.
            Turn your shelf into someone else's next adventure — completely free.
          </motion.p>

          {/* Pillars */}
          <motion.div {...fadeUp(0.25)} style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            {pillars.map((p, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-3)', fontWeight: 500 }}>
                <span style={{ color: 'var(--violet)' }}>{p.icon}</span>{p.text}
              </span>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div {...fadeUp(0.3)} className="hero-cta">
            <Link to="/browse" className="btn btn-primary btn-lg">
              <Search size={18} /> Browse Books
            </Link>
            <Link to="/register" className="btn btn-ghost btn-lg">
              Get Started Free <ArrowRight size={18} />
            </Link>
          </motion.div>

          {/* Floating book cards */}
          <motion.div
            {...fadeUp(0.4)}
            style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', maxWidth: '680px', margin: '0 auto' }}
          >
            {floatingBooks.map((b, i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.7, ease: 'easeInOut' }}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r-lg)',
                  padding: '1rem 1.25rem',
                  width: '180px',
                  backdropFilter: 'blur(16px)',
                  textAlign: 'left',
                }}
              >
                <div style={{ width: '100%', height: '4px', borderRadius: '99px', background: b.color, marginBottom: '0.75rem', opacity: 0.85 }} />
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-1)', marginBottom: '0.25rem' }}>{b.title}</div>
                <div style={{ fontSize: '0.73rem', color: 'var(--text-3)' }}>{b.author}</div>
                <div style={{ marginTop: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  {[1,2,3,4,5].map(s => <Star key={s} size={10} fill={s <= 4 ? b.color : 'none'} color={b.color} />)}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== STATS STRIP ===== */}
      <section style={{ padding: '0 1.5rem 5rem' }}>
        <motion.div {...fadeUp(0)} className="container">
          <div className="stats-strip">
            {stats.map((s, i) => (
              <motion.div key={i} {...childFade} className="stats-strip-item" style={{ animationDelay: `${i * 0.1}s` }}>
                <div style={{ color: 'var(--violet)', marginBottom: '0.6rem', display: 'flex', justifyContent: 'center' }}>{s.icon}</div>
                <div className="stats-strip-value">{s.value}</div>
                <div className="stats-strip-label">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ===== FEATURES ===== */}
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

      {/* ===== HOW IT WORKS ===== */}
      <section className="section" style={{ background: 'rgba(255,255,255,0.015)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
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

      {/* ===== CTA BANNER ===== */}
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