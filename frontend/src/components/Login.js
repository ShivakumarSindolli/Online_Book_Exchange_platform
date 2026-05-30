import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, BookOpen } from 'lucide-react';

export default function Login({ setToken }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('https://online-book-exchange-platform-hpp1.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setToken(data.token);
      toast.success('Logged in successfully!');
      navigate('/');
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="auth-card"
      >
        <div className="auth-icon" style={{
          background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(244,114,182,0.12))',
          border: '1px solid rgba(168,85,247,0.3)'
        }}>
          <BookOpen size={22} color="#c084fc" />
        </div>

        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Sign in to continue to BookExchange</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              <Mail size={11} style={{ display: 'inline', marginRight: '0.3rem', verticalAlign: 'middle' }} />
              Email Address
            </label>
            <input
              id="login-email" name="email" type="email"
              placeholder="you@example.com"
              value={formData.email} onChange={handleChange}
              className="form-input" required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              <Lock size={11} style={{ display: 'inline', marginRight: '0.3rem', verticalAlign: 'middle' }} />
              Password
            </label>
            <input
              id="login-password" name="password" type="password"
              placeholder="••••••••"
              value={formData.password} onChange={handleChange}
              className="form-input" required
            />
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading
              ? <><span className="spinner" /> Signing in...</>
              : <><LogIn size={16} /> Sign In</>}
          </button>

          <p className="auth-footer-text">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}