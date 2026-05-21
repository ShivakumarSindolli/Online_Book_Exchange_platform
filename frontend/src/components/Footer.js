import { Link } from 'react-router-dom';
import { BookOpen, Share2, Send, Heart } from 'lucide-react';

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none', fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-1)', letterSpacing: '-0.03em', marginBottom: '0.75rem' }}>
              <div style={{ width: '30px', height: '30px', background: 'linear-gradient(135deg,#a855f7,#6366f1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BookOpen size={15} color="#fff" />
              </div>
              BookExchange
            </Link>
            <p className="footer-brand-desc">
              Connecting communities through books. Share stories, build friendships, and discover your next great read — all for free.
            </p>
            <div className="footer-socials">
              {[
                { icon: <Share2 size={15} />, href: '#' },
                { icon: <Share2 size={15} />, href: '#' },
                { icon: <Share2 size={15} />, href: '#' },
              ].map((s, i) => (
                <a key={i} href={s.href} className="footer-social-btn">{s.icon}</a>
              ))}
            </div>
          </div>

          {/* Navigate */}
          <div>
            <h6 className="footer-col-title">Navigate</h6>
            <ul className="footer-links">
              {[
                { to: '/browse',   label: 'Browse Books' },
                { to: '/login',    label: 'Sign In' },
                { to: '/register', label: 'Register' },
              ].map(l => (
                <li key={l.to}><Link to={l.to} className="footer-link">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Get Started */}
          <div>
            <h6 className="footer-col-title">Account</h6>
            <ul className="footer-links">
              {[
                { to: '/add-book', label: 'Add a Book' },
                { to: '/requests', label: 'My Requests' },
                { to: '/wishlist', label: 'My Wishlist' },
                { to: '/profile',  label: 'My Profile' },
              ].map(l => (
                <li key={l.to}><Link to={l.to} className="footer-link">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h6 className="footer-col-title">Stay Updated</h6>
            <p style={{ fontSize: '0.87rem', color: 'var(--text-3)', marginBottom: '1rem', lineHeight: 1.6 }}>
              Get notified when books you want become available near you.
            </p>
            <div className="footer-newsletter-input">
              <input type="email" placeholder="your@email.com" />
              <button className="btn btn-primary btn-sm" style={{ padding: '0.6rem 0.85rem' }}>
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <p className="footer-copy">© {year} BookExchange. Made with <Heart size={11} style={{ display: 'inline', color: '#f472b6', verticalAlign: 'middle', marginBottom: '1px' }} /> for book lovers.</p>
          <p className="footer-copy">Community · Open · Free</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;