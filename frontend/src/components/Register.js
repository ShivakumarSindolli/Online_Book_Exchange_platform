import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { UserPlus, User, Mail, Lock, Phone, MapPin, BookOpen } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', phone: '', city: '', state: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('Registration successful! Please log in.');
      navigate('/login');
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const Field = ({ id, name, type = 'text', placeholder, label, icon }) => (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>
        <span style={{ display: 'inline', marginRight: '0.3rem', verticalAlign: 'middle' }}>{icon}</span>
        {label}
      </label>
      <input
        id={id} name={name} type={type}
        placeholder={placeholder}
        onChange={handleChange}
        className="form-input" required
      />
    </div>
  );

  return (
    <div className="auth-page">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="auth-card register"
      >
        <div className="auth-icon" style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.12))',
          border: '1px solid rgba(99,102,241,0.3)'
        }}>
          <BookOpen size={22} color="#818cf8" />
        </div>

        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Join the BookExchange community</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <Field id="r-username" name="username" placeholder="johndoe"           label="Username"     icon={<User  size={11} />} />
          <Field id="r-email"    name="email"    placeholder="you@example.com"   label="Email"        icon={<Mail  size={11} />} type="email" />
          <Field id="r-password" name="password" placeholder="••••••••"          label="Password"     icon={<Lock  size={11} />} type="password" />
          <Field id="r-phone"    name="phone"    placeholder="+91 99999 99999"   label="Phone Number" icon={<Phone size={11} />} type="tel" />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="r-city">
                <MapPin size={11} style={{ display: 'inline', marginRight: '0.3rem', verticalAlign: 'middle' }} />City
              </label>
              <input id="r-city" name="city" type="text" placeholder="Mumbai" onChange={handleChange} className="form-input" required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="r-state">
                <MapPin size={11} style={{ display: 'inline', marginRight: '0.3rem', verticalAlign: 'middle' }} />State
              </label>
              <input id="r-state" name="state" type="text" placeholder="Maharashtra" onChange={handleChange} className="form-input" required />
            </div>
          </div>

          <button type="submit" className="auth-submit" disabled={loading}
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', boxShadow: '0 0 24px rgba(99,102,241,0.4)' }}>
            {loading
              ? <><span className="spinner" /> Creating...</>
              : <><UserPlus size={16} /> Create Account</>}
          </button>

          <p className="auth-footer-text">
            Already have an account? <Link to="/login" style={{ color: '#818cf8' }}>Sign in</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}