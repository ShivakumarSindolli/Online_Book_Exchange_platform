import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, MessageSquare, Award } from 'lucide-react';
import StarRating from './StarRating';

export default function RatingModal({ show, onClose, onSubmit, title }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(rating, comment);
    setRating(0);
    setHoverRating(0);
    setComment('');
  };

  const labelStyle = {
    fontSize: '0.73rem', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.08em',
    color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: '0.35rem',
    marginBottom: '0.4rem',
  };

  const textareaStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid var(--border)',
    color: 'var(--text-1)',
    borderRadius: 'var(--r-md)',
    padding: '0.65rem 0.9rem',
    fontSize: '0.9rem',
    fontFamily: "'Inter', sans-serif",
    outline: 'none',
    transition: 'all 0.15s ease',
    resize: 'vertical',
    minHeight: '100px',
  };

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '90%', maxWidth: '440px',
            background: 'var(--bg-overlay)',
            border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: 'var(--r-xl)',
            boxShadow: '0 0 60px rgba(245,158,11,0.1), 0 24px 64px rgba(0,0,0,0.6)',
            backdropFilter: 'blur(30px)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                width: 36, height: 36, borderRadius: 'var(--r-md)',
                background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--amber)',
              }}>
                <Award size={16} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>
                {title}
              </h3>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
                borderRadius: 'var(--r-sm)', width: 32, height: 32,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--text-3)', transition: 'all 0.2s',
              }}
            >
              <X size={16} />
            </motion.button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: 'center' }}>
              <p style={{ color: 'var(--text-3)', fontSize: '0.88rem', margin: 0, textAlign: 'center', lineHeight: 1.5 }}>
                How was your experience with this exchange? Please select a rating below.
              </p>
              
              <div style={{
                width: '100%',
                display: 'flex', justifyContent: 'center',
                padding: '1rem',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-md)',
              }}>
                <StarRating
                  rating={rating}
                  onRating={setRating}
                  hoverRating={hoverRating}
                  onHover={setHoverRating}
                />
              </div>

              <div style={{ width: '100%' }}>
                <label style={labelStyle}><MessageSquare size={11} /> Review Comments</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share a details about the exchange (optional)"
                  style={textareaStyle}
                  onFocus={e => { e.target.style.borderColor = '#fb923c'; e.target.style.boxShadow = '0 0 0 3px rgba(251,146,60,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid var(--border)',
              display: 'flex', justifyContent: 'flex-end', gap: '0.6rem',
            }}>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                type="button" onClick={onClose} className="btn btn-ghost btn-sm">
                Cancel
              </motion.button>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                type="submit" disabled={rating === 0}
                className="btn btn-sm"
                style={{
                  background: rating === 0 ? 'var(--bg-elevated)' : 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
                  color: rating === 0 ? 'var(--text-4)' : '#fff',
                  border: 'none',
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  cursor: rating === 0 ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  boxShadow: rating === 0 ? 'none' : '0 0 16px rgba(249,115,22,0.3)',
                }}
              >
                <Star size={14} fill={rating === 0 ? 'none' : '#fff'} /> Submit Rating
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}