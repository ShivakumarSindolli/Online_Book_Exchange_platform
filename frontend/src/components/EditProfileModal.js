import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Phone, MapPin, X, Save, Edit3 } from 'lucide-react';

export default function EditProfileModal({ show, onClose, currentUser, onUpdate }) {
  const [formData, setFormData] = useState({ username: '', phone: '', city: '', state: '' });

  useEffect(() => {
    if (currentUser) {
      setFormData({
        username: currentUser.username || '',
        phone: currentUser.phone || '',
        city: currentUser.city || '',
        state: currentUser.state || '',
      });
    }
  }, [currentUser]);

  if (!show) return null;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = (e) => { e.preventDefault(); onUpdate(formData); };

  const labelStyle = {
    fontSize: '0.73rem', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.08em',
    color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: '0.35rem',
    marginBottom: '0.4rem',
  };
  const inputStyle = {
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
            width: '90%', maxWidth: '480px',
            background: 'var(--bg-overlay)',
            border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: 'var(--r-xl)',
            boxShadow: '0 0 60px rgba(99,102,241,0.15), 0 24px 64px rgba(0,0,0,0.6)',
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
                background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--indigo)',
              }}>
                <Edit3 size={16} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>
                Edit Profile
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
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}><User size={11} /> Username</label>
                <input name="username" type="text" value={formData.username} onChange={handleChange}
                  placeholder="Username" style={inputStyle} required
                  onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              <div>
                <label style={labelStyle}><Phone size={11} /> Phone Number</label>
                <input name="phone" type="tel" value={formData.phone} onChange={handleChange}
                  placeholder="+91 99999 99999" style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyle}><MapPin size={11} /> City</label>
                  <input name="city" type="text" value={formData.city} onChange={handleChange}
                    placeholder="Mumbai" style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
                    onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                <div>
                  <label style={labelStyle}><MapPin size={11} /> State</label>
                  <input name="state" type="text" value={formData.state} onChange={handleChange}
                    placeholder="Maharashtra" style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
                    onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
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
                type="submit" className="btn btn-primary btn-sm" style={{ gap: '0.4rem' }}>
                <Save size={14} /> Save Changes
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}