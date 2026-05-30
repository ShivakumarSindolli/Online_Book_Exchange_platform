import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Search, PlusCircle, ArrowLeftRight, User, Star,
  ChevronDown, LogOut, Menu, X, Library, Shield
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Navbar({ token, logout }) {
  const [username, setUsername] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUsername(decoded.username);
        setIsAdmin(decoded.role === 'admin');
      } catch { logout(); }
    } else { setUsername(null); setIsAdmin(false); }
  }, [token, logout]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); setDropOpen(false); }, [location]);

  const handleLogout = () => { logout(); navigate('/login'); };
  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: '/browse', label: 'Browse', icon: <Search size={15} /> },
    ...(token ? [
      { to: '/add-book',  label: 'Add Book',  icon: <PlusCircle size={15} /> },
      { to: '/requests',  label: 'Requests',  icon: <ArrowLeftRight size={15} /> },
    ] : []),
  ];

  return (
    <>
      <nav className={`navbar-shell ${scrolled ? 'scrolled' : ''}`}>
        {/* Brand */}
        <Link to="/" className="navbar-brand">
          <div className="navbar-brand-icon">
            <BookOpen size={16} color="#fff" />
          </div>
          BookExchange
        </Link>

        {/* Desktop nav */}
        <ul className="navbar-links navbar-desktop" style={{ display: 'flex' }}>
          {navLinks.map(link => (
            <li key={link.to}>
              <Link to={link.to} className={`navbar-link ${isActive(link.to) ? 'active' : ''}`}>
                {link.icon} {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop actions */}
        <div className="navbar-actions navbar-desktop" style={{ display: 'flex' }}>
          <ThemeToggle size="md" />
          {token && username ? (
            <div style={{ position: 'relative' }}>
              <button
                className="navbar-avatar"
                onClick={() => setDropOpen(p => !p)}
              >
                <div className="avatar-circle">{username.charAt(0).toUpperCase()}</div>
                <span>{username}</span>
                <motion.div animate={{ rotate: dropOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown size={14} />
                </motion.div>
              </button>

              <AnimatePresence>
                {dropOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.18 }}
                    style={{
                      position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                      minWidth: '200px',
                      background: 'var(--bg-overlay)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--r-lg)',
                      boxShadow: 'var(--shadow-xl)',
                      padding: '0.5rem',
                      backdropFilter: 'blur(24px)',
                    }}
                    onMouseLeave={() => setDropOpen(false)}
                  >
                    <div style={{ padding: '0.5rem 0.75rem 0.75rem', borderBottom: '1px solid var(--border)', marginBottom: '0.35rem' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Account</div>
                      <div style={{ fontSize: '0.88rem', color: 'var(--text-1)', fontWeight: 600, marginTop: '0.2rem' }}>{username}</div>
                    </div>
                    {[
                      { to: '/profile',  icon: <User size={15} />,      label: 'My Profile' },
                      { to: '/my-books', icon: <Library size={15} />,   label: 'My Books' },
                      { to: '/wishlist', icon: <Star size={15} />,       label: 'My Wishlist' },
                      ...(isAdmin ? [{ to: '/admin', icon: <Shield size={15} />, label: 'Admin Panel' }] : []),
                    ].map(item => (
                      <Link key={item.to} to={item.to} className="dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-2)', textDecoration: 'none' }}>
                        <span style={{ color: 'var(--text-3)' }}>{item.icon}</span>{item.label}
                      </Link>
                    ))}
                    <div className="dropdown-divider" style={{ margin: '0.35rem 0' }} />
                    <button
                      className="dropdown-item"
                      onClick={handleLogout}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#f87171', background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}
                    >
                      <LogOut size={15} /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="navbar-toggle" onClick={() => setMobileOpen(p => !p)}>
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="navbar-mobile"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.22 }}
          >
            <ul className="navbar-links" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.25rem' }}>
              {navLinks.map(link => (
                <li key={link.to} style={{ width: '100%' }}>
                  <Link to={link.to} className={`navbar-link ${isActive(link.to) ? 'active' : ''}`} style={{ width: '100%', padding: '0.65rem 1rem' }}>
                    {link.icon} {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ThemeToggle size="sm" />
              <span style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>Toggle theme</span>
            </div>
            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.75rem', flexDirection: 'column' }}>
              {token && username ? (
                <>
                  <Link to="/profile"  className="navbar-link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><User size={15} /> My Profile</Link>
                  <Link to="/my-books" className="navbar-link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Library size={15} /> My Books</Link>
                  <Link to="/wishlist" className="navbar-link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Star size={15} /> My Wishlist</Link>
                  {isAdmin && <Link to="/admin" className="navbar-link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#c084fc' }}><Shield size={15} /> Admin Panel</Link>}
                  <button onClick={handleLogout} className="btn btn-ghost btn-sm" style={{ width: '100%', color: '#f87171', justifyContent: 'flex-start' }}>
                    <LogOut size={15} /> Logout
                  </button>
                </>
              ) : (
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Link to="/login"    className="btn btn-ghost btn-sm" style={{ flex: 1 }}>Sign In</Link>
                  <Link to="/register" className="btn btn-primary btn-sm" style={{ flex: 1 }}>Get Started</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}