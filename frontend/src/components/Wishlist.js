import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Trash2, BookOpen, Search, User, ArrowRight,
  Sparkles, Image as ImageIcon, Star, ExternalLink, Tag
} from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';

/* ── animation helpers ── */
const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: (i) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  }),
  exit: { opacity: 0, x: -60, scale: 0.9, transition: { duration: 0.3 } },
};

export default function Wishlist({ token }) {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [bookToRemove, setBookToRemove] = useState(null);
  const navigate = useNavigate();

  const fetchWishlist = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:5000/api/user/wishlist', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch wishlist');
      const data = await res.json();
      setWishlist(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(error.message);
      setWishlist([]);
    } finally { setLoading(false); }
  }, [token]);

  useEffect(() => {
    if (!token) navigate('/login');
    else fetchWishlist();
  }, [token, navigate, fetchWishlist]);

  const handleConfirmRemove = async () => {
    if (!bookToRemove) return;
    try {
      await fetch(`http://127.0.0.1:5000/api/user/wishlist/${bookToRemove._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success('Removed from wishlist');
      setWishlist(prev => prev.filter(book => book._id !== bookToRemove._id));
    } catch (error) { toast.error(error.message); }
    finally { setShowConfirmModal(false); setBookToRemove(null); }
  };

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Heart size={32} color="var(--pink)" fill="var(--pink)" />
      </motion.div>
    </div>
  );

  return (
    <div className="container" style={{ padding: '2rem 1.5rem 4rem' }}>
      <ConfirmationModal
        show={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmRemove}
        title="Remove from Wishlist"
        confirmText="Remove"
        confirmButtonClass="btn-danger"
      >
        <p>Remove <strong style={{ color: 'var(--text-1)' }}>"{bookToRemove?.title}"</strong> from your wishlist?</p>
      </ConfirmationModal>

      {/* ── Page Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{ marginBottom: '2rem' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: 48, height: 48,
              background: 'linear-gradient(135deg, #f472b6, #ec4899)',
              borderRadius: 'var(--r-lg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 24px rgba(244,114,182,0.4)',
            }}>
              <Heart size={22} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', fontWeight: 800, margin: 0, color: 'var(--text-1)' }}>
                My Wishlist
              </h2>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-3)' }}>
                {wishlist.length} book{wishlist.length !== 1 ? 's' : ''} saved for later
              </p>
            </div>
          </div>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Link
              to="/browse"
              className="btn btn-ghost"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Search size={16} /> Discover More
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Wishlist Stats Ribbon ── */}
      {wishlist.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          style={{
            display: 'flex', alignItems: 'center', gap: '1.5rem',
            padding: '1rem 1.5rem',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-lg)',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Heart size={16} color="var(--pink)" fill="var(--pink)" />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-2)', fontWeight: 500 }}>
              <strong style={{ color: 'var(--text-1)', fontWeight: 800 }}>{wishlist.length}</strong> Saved
            </span>
          </div>
          <div style={{ width: '1px', height: '20px', background: 'var(--border)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Tag size={15} color="var(--emerald)" />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-2)', fontWeight: 500 }}>
              <strong style={{ color: 'var(--text-1)', fontWeight: 800 }}>
                {wishlist.filter(b => b.type === 'lend').length}
              </strong> Free to Borrow
            </span>
          </div>
          <div style={{ width: '1px', height: '20px', background: 'var(--border)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Star size={15} color="var(--amber)" />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-2)', fontWeight: 500 }}>
              <strong style={{ color: 'var(--text-1)', fontWeight: 800 }}>
                {wishlist.filter(b => b.type === 'sell').length}
              </strong> For Sale
            </span>
          </div>
        </motion.div>
      )}

      {/* ── Wishlist Cards Grid ── */}
      {wishlist.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1rem',
        }}>
          <AnimatePresence>
            {wishlist.map((book, i) => (
              <motion.div
                key={book._id}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r-xl)',
                  overflow: 'hidden',
                  display: 'flex',
                  backdropFilter: 'blur(20px)',
                  transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(244,114,182,0.35)';
                  e.currentTarget.style.boxShadow = '0 16px 48px rgba(244,114,182,0.1), 0 0 32px rgba(244,114,182,0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Cover image */}
                <div style={{
                  width: '110px', flexShrink: 0,
                  position: 'relative', overflow: 'hidden',
                  background: 'linear-gradient(135deg, rgba(244,114,182,0.08), rgba(168,85,247,0.06))',
                }}>
                  {book.imageUrl ? (
                    <img
                      src={`http://127.0.0.1:5000${book.imageUrl}`}
                      alt={book.title}
                      style={{
                        width: '100%', height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.5s cubic-bezier(0.16,1,0.3,1)',
                      }}
                      onMouseEnter={(e) => { e.target.style.transform = 'scale(1.08)'; }}
                      onMouseLeave={(e) => { e.target.style.transform = 'scale(1)'; }}
                    />
                  ) : (
                    <div style={{
                      width: '100%', height: '100%', minHeight: '140px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--text-4)',
                    }}>
                      <ImageIcon size={32} />
                    </div>
                  )}
                  {/* Wishlist heart icon */}
                  <div style={{
                    position: 'absolute', top: '0.5rem', right: '0.5rem',
                    width: 28, height: 28,
                    background: 'rgba(244,114,182,0.2)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid rgba(244,114,182,0.3)',
                  }}>
                    <Heart size={13} color="#f472b6" fill="#f472b6" />
                  </div>
                </div>

                {/* Content */}
                <div style={{
                  padding: '1.1rem 1.25rem',
                  flex: 1,
                  display: 'flex', flexDirection: 'column', gap: '0.45rem',
                  minWidth: 0,
                }}>
                  <h4 style={{
                    fontSize: '0.95rem', fontWeight: 700,
                    color: 'var(--text-1)', margin: 0,
                    lineHeight: 1.3,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {book.title}
                  </h4>

                  <p style={{
                    fontSize: '0.82rem', color: 'var(--text-3)', margin: 0,
                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                  }}>
                    <BookOpen size={13} /> {book.author || 'Unknown Author'}
                  </p>

                  {/* Owner */}
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                    fontSize: '0.75rem', fontWeight: 600,
                    color: 'var(--text-3)',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--r-full)',
                    padding: '0.2rem 0.6rem',
                    width: 'fit-content',
                  }}>
                    <User size={12} /> {book.userId?.username || 'Unknown'}
                  </div>

                  {/* Type badge */}
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.15rem' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                      fontSize: '0.68rem', fontWeight: 700,
                      padding: '0.2rem 0.55rem',
                      borderRadius: 'var(--r-full)',
                      background: book.type === 'sell' ? 'rgba(16,185,129,0.12)' : 'rgba(34,211,238,0.12)',
                      border: `1px solid ${book.type === 'sell' ? 'rgba(16,185,129,0.25)' : 'rgba(34,211,238,0.25)'}`,
                      color: book.type === 'sell' ? '#34d399' : '#67e8f9',
                      letterSpacing: '0.04em',
                    }}>
                      <Tag size={10} />
                      {book.type === 'sell' ? `₹${book.price}` : 'Free to Borrow'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div style={{
                    display: 'flex', gap: '0.5rem',
                    marginTop: 'auto', paddingTop: '0.5rem',
                  }}>
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => navigate('/browse')}
                      className="btn btn-sm"
                      style={{
                        background: 'rgba(99,102,241,0.1)',
                        border: '1px solid rgba(99,102,241,0.25)',
                        color: '#818cf8',
                        display: 'flex', alignItems: 'center', gap: '0.35rem',
                        fontSize: '0.78rem', fontWeight: 600,
                        padding: '0.35rem 0.7rem',
                        borderRadius: 'var(--r-md)',
                        cursor: 'pointer',
                      }}
                    >
                      <ExternalLink size={13} /> View
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => { setBookToRemove(book); setShowConfirmModal(true); }}
                      className="btn btn-sm"
                      style={{
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.25)',
                        color: '#f87171',
                        display: 'flex', alignItems: 'center', gap: '0.35rem',
                        fontSize: '0.78rem', fontWeight: 600,
                        padding: '0.35rem 0.7rem',
                        borderRadius: 'var(--r-md)',
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={13} /> Remove
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        /* ── Empty State ── */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{
            textAlign: 'center',
            padding: '5rem 2rem',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-2xl)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: 80, height: 80,
              background: 'linear-gradient(135deg, #f472b6, #ec4899)',
              borderRadius: 'var(--r-xl)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem',
              boxShadow: '0 0 40px rgba(244,114,182,0.3)',
            }}
          >
            <Sparkles size={36} color="#fff" />
          </motion.div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-1)', marginBottom: '0.5rem' }}>
            Your wishlist is empty
          </h3>
          <p style={{ color: 'var(--text-3)', maxWidth: '380px', margin: '0 auto 1.75rem', lineHeight: 1.6 }}>
            Save books you're interested in for later. Browse the community library to find your next read!
          </p>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Link
              to="/browse"
              className="btn btn-primary btn-lg"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Search size={18} /> Explore Books <ArrowRight size={16} />
            </Link>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}