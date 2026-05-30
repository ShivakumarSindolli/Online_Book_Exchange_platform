import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Library, PlusCircle, Trash2, BookOpen, Tag, Star,
  ShieldCheck, Clock, Package, AlertTriangle, Sparkles,
  ArrowRight, Image as ImageIcon, LayoutGrid, List
} from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';

/* ── animation helpers ── */
const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  visible: (i) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  }),
  exit: { opacity: 0, scale: 0.92, transition: { duration: 0.25 } },
};

const conditionColors = {
  New:  { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)', text: '#34d399' },
  Good: { bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.25)', text: '#818cf8' },
  Fair: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', text: '#fbbf24' },
  Poor: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)', text: '#f87171' },
};

const statusConfig = {
  available:  { icon: <ShieldCheck size={13} />, color: '#34d399', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)', label: 'Available' },
  pending:    { icon: <Clock size={13} />,       color: '#fbbf24', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', label: 'Pending' },
  exchanged:  { icon: <Package size={13} />,     color: '#818cf8', bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.25)', label: 'Exchanged' },
};

export default function MyBooks({ token }) {
  const [myBooks, setMyBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const navigate = useNavigate();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);

  const fetchMyBooks = useCallback(async () => {
    try {
      const res = await fetch('https://online-book-exchange-platform-hpp1.onrender.com/api/books/my-books', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch books');
      const data = await res.json();
      setMyBooks(data);
    } catch (error) { toast.error(error.message); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => {
    if (!token) navigate('/login');
    else fetchMyBooks();
  }, [token, navigate, fetchMyBooks]);

  const handleDeleteClick = (book) => {
    setBookToDelete(book);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!bookToDelete) return;
    try {
      const res = await fetch(`https://online-book-exchange-platform-hpp1.onrender.com/api/books/${bookToDelete._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.msg || 'Failed to delete book');
      }
      fetchMyBooks();
      toast.success('Book deleted successfully');
    } catch (error) { toast.error(error.message); }
    finally { setShowConfirmModal(false); setBookToDelete(null); }
  };

  const stats = {
    total: myBooks.length,
    available: myBooks.filter(b => b.status === 'available').length,
    exchanged: myBooks.filter(b => b.status === 'exchanged').length,
    lending: myBooks.filter(b => b.type === 'lend').length,
  };

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      >
        <Library size={32} color="var(--violet)" />
      </motion.div>
    </div>
  );

  return (
    <div className="container" style={{ padding: '2rem 1.5rem 4rem' }}>
      <ConfirmationModal
        show={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        confirmText="Confirm Deletion"
      >
        <p>Are you sure you want to permanently delete the book titled: <strong style={{ color: 'var(--text-1)' }}>"{bookToDelete?.title}"</strong>?</p>
        <p style={{ color: 'var(--red)', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0, fontSize: '0.88rem' }}>
          <AlertTriangle size={15} /> This action cannot be undone.
        </p>
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
              background: 'var(--grad-brand)',
              borderRadius: 'var(--r-lg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 24px rgba(168,85,247,0.4)',
            }}>
              <Library size={22} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', fontWeight: 800, margin: 0, color: 'var(--text-1)' }}>
                My Book Listings
              </h2>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-3)' }}>
                Manage and track all your listed books
              </p>
            </div>
          </div>
          <motion.button
            className="btn btn-primary"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/add-book')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <PlusCircle size={17} /> Add New Book
          </motion.button>
        </div>
      </motion.div>

      {/* ── Stats Row ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '0.75rem',
          marginBottom: '2rem',
        }}
      >
        {[
          { label: 'Total Books', value: stats.total, icon: <BookOpen size={18} />, color: 'var(--violet)' },
          { label: 'Available', value: stats.available, icon: <ShieldCheck size={18} />, color: '#34d399' },
          { label: 'Exchanged', value: stats.exchanged, icon: <Package size={18} />, color: '#818cf8' },
          { label: 'Lending', value: stats.lending, icon: <Tag size={18} />, color: '#22d3ee' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            whileHover={{ y: -3, scale: 1.02 }}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-lg)',
              padding: '1.25rem 1rem',
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              backdropFilter: 'blur(16px)',
              transition: 'all 0.3s ease',
            }}
          >
            <div style={{
              width: 40, height: 40,
              background: `${stat.color}18`,
              border: `1px solid ${stat.color}40`,
              borderRadius: 'var(--r-md)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: stat.color,
            }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-1)', lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── View Toggle ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem', gap: '0.35rem' }}
      >
        {[
          { mode: 'grid', icon: <LayoutGrid size={16} /> },
          { mode: 'list', icon: <List size={16} /> },
        ].map(v => (
          <motion.button
            key={v.mode}
            whileTap={{ scale: 0.9 }}
            onClick={() => setViewMode(v.mode)}
            style={{
              width: 34, height: 34,
              borderRadius: 'var(--r-sm)',
              border: '1px solid var(--border)',
              background: viewMode === v.mode ? 'rgba(168,85,247,0.15)' : 'var(--bg-surface)',
              color: viewMode === v.mode ? 'var(--violet)' : 'var(--text-3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {v.icon}
          </motion.button>
        ))}
      </motion.div>

      {/* ── Books Display ── */}
      {myBooks.length > 0 ? (
        <div style={{
          display: viewMode === 'grid'
            ? 'grid'
            : 'flex',
          gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(260px, 1fr))' : undefined,
          flexDirection: viewMode === 'list' ? 'column' : undefined,
          gap: viewMode === 'grid' ? '1.25rem' : '0.75rem',
        }}>
          <AnimatePresence>
            {myBooks.map((book, i) => {
              const status = statusConfig[book.status] || statusConfig.available;
              const condition = conditionColors[book.condition] || conditionColors.Good;

              return (
                <motion.div
                  key={book._id}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                  whileHover={{ y: viewMode === 'grid' ? -6 : -2, transition: { duration: 0.25 } }}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--r-xl)',
                    overflow: 'hidden',
                    display: viewMode === 'list' ? 'flex' : 'flex',
                    flexDirection: viewMode === 'list' ? 'row' : 'column',
                    backdropFilter: 'blur(20px)',
                    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                    cursor: 'default',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(168,85,247,0.4)';
                    e.currentTarget.style.boxShadow = '0 16px 48px rgba(168,85,247,0.12), 0 0 32px rgba(168,85,247,0.06)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Cover */}
                  <div style={{
                    width: viewMode === 'list' ? '100px' : '100%',
                    height: viewMode === 'list' ? 'auto' : '200px',
                    minHeight: viewMode === 'list' ? '120px' : undefined,
                    flexShrink: 0,
                    position: 'relative',
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(168,85,247,0.06))',
                  }}>
                    {book.imageUrl ? (
                      <img
                        src={book.imageUrl.startsWith('http') ? book.imageUrl : `https://online-book-exchange-platform-hpp1.onrender.com${book.imageUrl}`}
                        alt={book.title}
                        style={{
                          width: '100%', height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.5s cubic-bezier(0.16,1,0.3,1)',
                        }}
                        onMouseEnter={(e) => { e.target.style.transform = 'scale(1.06)'; }}
                        onMouseLeave={(e) => { e.target.style.transform = 'scale(1)'; }}
                      />
                    ) : (
                      <div style={{
                        width: '100%', height: '100%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--text-4)',
                      }}>
                        <ImageIcon size={viewMode === 'list' ? 28 : 40} />
                      </div>
                    )}

                    {/* Type badge overlay */}
                    <div style={{
                      position: 'absolute', top: '0.6rem', left: '0.6rem',
                      background: book.type === 'sell'
                        ? 'linear-gradient(135deg, #059669, #10b981)'
                        : 'linear-gradient(135deg, #0891b2, #22d3ee)',
                      color: '#fff',
                      fontSize: '0.68rem', fontWeight: 700,
                      padding: '0.2rem 0.55rem',
                      borderRadius: 'var(--r-full)',
                      letterSpacing: '0.04em',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                    }}>
                      {book.type === 'sell' ? `₹${book.price}` : 'Lend'}
                    </div>
                  </div>

                  {/* Info */}
                  <div style={{
                    padding: viewMode === 'list' ? '1rem 1.25rem' : '1.25rem',
                    flex: 1,
                    display: 'flex', flexDirection: 'column', gap: '0.6rem',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <h4 style={{
                        fontSize: '0.95rem', fontWeight: 700,
                        color: 'var(--text-1)', margin: 0,
                        lineHeight: 1.3,
                      }}>
                        {book.title}
                      </h4>
                    </div>

                    {book.author && (
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-3)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <BookOpen size={13} /> {book.author}
                      </p>
                    )}

                    {/* Badges row */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.25rem' }}>
                      {/* Status badge */}
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                        fontSize: '0.7rem', fontWeight: 600,
                        padding: '0.25rem 0.6rem',
                        borderRadius: 'var(--r-full)',
                        background: status.bg,
                        border: `1px solid ${status.border}`,
                        color: status.color,
                        letterSpacing: '0.04em',
                      }}>
                        {status.icon} {status.label}
                      </span>

                      {/* Condition badge */}
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                        fontSize: '0.7rem', fontWeight: 600,
                        padding: '0.25rem 0.6rem',
                        borderRadius: 'var(--r-full)',
                        background: condition.bg,
                        border: `1px solid ${condition.border}`,
                        color: condition.text,
                        letterSpacing: '0.04em',
                      }}>
                        <Star size={11} /> {book.condition}
                      </span>
                    </div>

                    {/* Delete button */}
                    <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeleteClick(book)}
                        disabled={book.status === 'exchanged'}
                        className="btn btn-sm"
                        style={{
                          background: 'rgba(239,68,68,0.1)',
                          border: '1px solid rgba(239,68,68,0.25)',
                          color: '#f87171',
                          display: 'flex', alignItems: 'center', gap: '0.4rem',
                          fontSize: '0.8rem', fontWeight: 600,
                          padding: '0.4rem 0.85rem',
                          borderRadius: 'var(--r-md)',
                          cursor: book.status === 'exchanged' ? 'not-allowed' : 'pointer',
                          opacity: book.status === 'exchanged' ? 0.4 : 1,
                          width: viewMode === 'grid' ? '100%' : 'auto',
                          justifyContent: 'center',
                        }}
                      >
                        <Trash2 size={14} /> Delete
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
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
              background: 'var(--grad-brand)',
              borderRadius: 'var(--r-xl)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem',
              boxShadow: '0 0 40px rgba(168,85,247,0.3)',
            }}
          >
            <Sparkles size={36} color="#fff" />
          </motion.div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-1)', marginBottom: '0.5rem' }}>
            No books listed yet
          </h3>
          <p style={{ color: 'var(--text-3)', maxWidth: '380px', margin: '0 auto 1.75rem', lineHeight: 1.6 }}>
            Start sharing your collection with the community. Your first listing is just a click away!
          </p>
          <motion.button
            className="btn btn-primary btn-lg"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/add-book')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <PlusCircle size={18} /> Add Your First Book <ArrowRight size={16} />
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}