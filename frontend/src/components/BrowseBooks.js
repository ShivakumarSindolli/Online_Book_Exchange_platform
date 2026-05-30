import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
import { motion } from 'framer-motion';
import { Search, MapPin, BookOpen, User, Star, ArrowRight, Inbox, Edit, Tag } from 'lucide-react';

const childFade = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
};

export default function BrowseBooks({ token }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState({ city: '', state: '' });
  const [wishlist, setWishlist] = useState([]);
  const navigate = useNavigate();
  let currentUserId = null;
  if (token) {
    try {
      currentUserId = jwtDecode(token).userId;
    } catch (e) {
      console.error('Invalid token', e);
    }
  }

  useEffect(() => {
    fetchBooks();
    if (token) fetchWishlist();
  }, [token]); // eslint-disable-line

  const fetchBooks = async (city = '', state = '') => {
    setLoading(true);
    setError(null);
    try {
      const url = `https://online-book-exchange-platform-hpp1.onrender.com/api/books?city=${city}&state=${state}&_t=${Date.now()}`;
      console.log('[BrowseBooks] Fetching:', url);
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText || 'Error'}`);
      const data = await res.json();
      console.log('[BrowseBooks] Received', data.length, 'books');
      setBooks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('[BrowseBooks] Fetch error:', err);
      setError(err.message || String(err));
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    try {
      const res = await fetch('https://online-book-exchange-platform-hpp1.onrender.com/api/user/wishlist', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setWishlist(data.map(b => b._id));
    } catch { /* silent */ }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBooks(search.city, search.state);
  };

  const handleRequest = async (bookId) => {
    if (!token) { toast.warn('Please log in to make a request.'); navigate('/login'); return; }
    try {
      const res = await fetch('https://online-book-exchange-platform-hpp1.onrender.com/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bookId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('Request sent successfully!');
    } catch (err) { toast.error(err.message); }
  };

  const handleWishlist = async (bookId) => {
    if (!token) { toast.warn('Please log in to add to wishlist.'); return; }
    try {
      await fetch(`https://online-book-exchange-platform-hpp1.onrender.com/api/user/wishlist/${bookId}`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Added to wishlist!');
      setWishlist(prev => [...prev, bookId]);
    } catch { toast.error('Failed to add to wishlist.'); }
  };

  return (
    <div className="page-wrapper" style={{ paddingTop: 0, paddingBottom: '4rem' }}>
      {/* Page header */}
      <div style={{
        background: 'linear-gradient(180deg, var(--bg-elevated) 0%, transparent 100%)',
        borderBottom: '1px solid var(--border)',
        padding: '2rem 1.5rem 2rem',
        textAlign: 'center',
      }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.1em', color: 'var(--violet)',
            background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)',
            padding: '0.3rem 0.85rem', borderRadius: '99px', marginBottom: '1rem',
          }}>
            <BookOpen size={13} /> Community Library
          </span>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
            Find Your Next <span style={{ background: 'linear-gradient(90deg,#a855f7,#f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Read</span>
          </h1>
          <p style={{ color: 'var(--text-3)', marginBottom: '0' }}>
            Browse books available from our community members. {books.length > 0 && <span style={{ color: 'var(--violet)', fontWeight: 600 }}>({books.length} books loaded)</span>}
          </p>
        </motion.div>

        {/* Search bar */}
        <motion.form
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '2rem' }}
        >
          <div style={{ position: 'relative', minWidth: '180px' }}>
            <MapPin size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-4)', pointerEvents: 'none' }} />
            <input
              type="text" name="city" value={search.city} placeholder="City"
              onChange={e => setSearch({ ...search, city: e.target.value })}
              className="search-input-field" style={{ paddingLeft: '2.4rem' }}
            />
          </div>
          <div style={{ position: 'relative', minWidth: '180px' }}>
            <MapPin size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-4)', pointerEvents: 'none' }} />
            <input
              type="text" name="state" value={search.state} placeholder="State"
              onChange={e => setSearch({ ...search, state: e.target.value })}
              className="search-input-field" style={{ paddingLeft: '2.4rem' }}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ minWidth: '110px' }}>
            <Search size={16} /> Search
          </button>
        </motion.form>
      </div>

      {/* Book grid */}
      <div className="container" style={{ marginTop: '3rem' }}>
        {loading ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="empty-state">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '40px', height: '40px', border: '3px solid rgba(168,85,247,0.2)', borderTopColor: '#a855f7', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ fontSize: '0.9rem', color: 'var(--text-3)' }}>Loading books...</p>
            </div>
          </motion.div>
        ) : error ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="empty-state">
            <div className="empty-state-icon" style={{ color: 'var(--rose)', background: 'rgba(244,63,94,0.1)' }}><Inbox size={52} /></div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-2)', marginBottom: '0.5rem' }}>Failed to load books</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--rose)', fontFamily: 'monospace', background: 'rgba(244,63,94,0.05)', padding: '0.5rem 1rem', borderRadius: '6px' }}>{error}</p>
            <button onClick={() => fetchBooks(search.city, search.state)} className="btn btn-primary" style={{ marginTop: '1rem' }}>
              Retry
            </button>
          </motion.div>
        ) : books.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="empty-state">
            <div className="empty-state-icon"><Inbox size={52} /></div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-2)', marginBottom: '0.5rem' }}>No books found</h3>
            <p style={{ fontSize: '0.9rem' }}>Try adjusting your search filters or check back later.</p>
          </motion.div>
        ) : (
          <div className="book-grid">
            {books.map((book) => {
              console.log('[BrowseBooks] Mapping book:', book.title, '| userId:', book.userId, '| type:', typeof book.userId);
              const ownerId = (book.userId && typeof book.userId === 'object') ? book.userId._id : book.userId;
              const isOwner = currentUserId && ownerId && currentUserId === ownerId;
              const inWishlist = wishlist.includes(book._id);
              const username = (book.userId && typeof book.userId === 'object') ? book.userId.username : 'Unknown User';

              return (
                <motion.div
                  key={book._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="book-card"
                >
                  {/* Cover */}
                  <div className="book-cover">
                    {book.imageUrl ? (
                      <img src={book.imageUrl.startsWith('http') ? book.imageUrl : `https://online-book-exchange-platform-hpp1.onrender.com${book.imageUrl}`} alt={book.title} />
                    ) : (
                      <div className="book-cover-placeholder">
                        <BookOpen size={44} />
                      </div>
                    )}

                    {/* Overlay */}
                    <div className="book-cover-overlay">
                      <span style={{
                        fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
                        letterSpacing: '0.06em', color: '#fff', background: 'rgba(255,255,255,0.15)',
                        border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px',
                        padding: '0.25rem 0.6rem',
                      }}>
                        {book.condition}
                      </span>
                    </div>

                    {/* Type badge */}
                    <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                        fontSize: '0.7rem', fontWeight: 700,
                        background: book.type === 'sell' ? 'linear-gradient(135deg,#059669,#10b981)' : 'linear-gradient(135deg,#0891b2,#22d3ee)',
                        color: '#fff', borderRadius: '6px', padding: '0.25rem 0.6rem',
                      }}>
                        <Tag size={10} />
                        {book.type === 'sell' ? `₹${book.price}` : 'Lend'}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="book-body">
                    <h3 className="book-title">{book.title}</h3>
                    <p className="book-author"><Edit size={13} /> {book.author}</p>

                    <div className="book-meta">
                      <div className="book-meta-row"><User size={12} /> {username}</div>
                      <div className="book-meta-row"><MapPin size={12} /> {book.city}, {book.state}</div>
                    </div>

                    <div className="book-actions">
                      <button
                        onClick={() => !isOwner && handleRequest(book._id)}
                        className={`btn btn-sm ${isOwner ? '' : 'btn-primary'}`}
                        style={isOwner ? { background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-3)', cursor: 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', borderRadius: 'var(--r-sm)', padding: '0.45rem 1rem', fontSize: '0.82rem', fontWeight: 600 } : {}}
                        disabled={isOwner}
                      >
                        {isOwner ? 'Your Book' : <><ArrowRight size={14} /> Request Book</>}
                      </button>

                      {!isOwner && token && (
                        <button
                          onClick={() => !inWishlist && handleWishlist(book._id)}
                          className="btn btn-sm btn-ghost"
                          disabled={inWishlist}
                          style={inWishlist ? { opacity: 0.65, cursor: 'default' } : {}}
                        >
                          {inWishlist
                            ? <><Star size={13} fill="currentColor" /> In Wishlist</>
                            : <><Star size={13} /> Add to Wishlist</>}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}