import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';
import './ConfirmationModal.css';

export default function ConfirmationModal({ 
  show, 
  onClose, 
  onConfirm, 
  title, 
  children, 
  confirmText = 'Confirm',
  confirmButtonClass = 'btn-danger'
}) {
  if (!show) return null;

  const isDanger = confirmButtonClass.includes('danger') || confirmButtonClass.includes('rose') || confirmButtonClass.includes('red');

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
          className="modal-content card card-ui"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '90%', maxWidth: '440px',
            background: 'var(--bg-overlay)',
            border: `1px solid ${isDanger ? 'rgba(239,68,68,0.2)' : 'rgba(99,102,241,0.2)'}`,
            borderRadius: 'var(--r-xl)',
            boxShadow: isDanger
              ? '0 0 60px rgba(239,68,68,0.1), 0 24px 64px rgba(0,0,0,0.6)'
              : '0 0 60px rgba(99,102,241,0.15), 0 24px 64px rgba(0,0,0,0.6)',
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
                background: isDanger ? 'rgba(239,68,68,0.12)' : 'rgba(99,102,241,0.12)',
                border: `1px solid ${isDanger ? 'rgba(239,68,68,0.25)' : 'rgba(99,102,241,0.25)'}`,
                display: 'flex', alignItems: 'center', justifycontent: 'center',
                color: isDanger ? 'var(--red)' : 'var(--indigo)',
                alignItems: 'center', justifyContent: 'center'
              }}>
                <AlertCircle size={16} />
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

          {/* Body */}
          <div style={{ padding: '1.5rem', color: 'var(--text-3)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            {children}
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
              type="button"
              onClick={onConfirm}
              className={`btn btn-sm ${confirmButtonClass}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontWeight: 600,
              }}
            >
              {confirmText}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}