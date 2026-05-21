import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import ConfirmationModal from './ConfirmationModal';

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
      <div className="text-center p-5" style={{ height: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner-border text-warning" role="status"><span className="visually-hidden">Loading...</span></div>
      </div>
    );

    return (
        <div className="container py-4 animate-fadeInUp">
            <ConfirmationModal show={showConfirmModal} onClose={() => setShowConfirmModal(false)} onConfirm={handleConfirmRemove} title="Remove from Wishlist" confirmText="Remove" confirmButtonClass="btn-danger">
                <p>Remove <strong style={{color:'var(--text-primary)'}}>"{bookToRemove?.title}"</strong> from your wishlist?</p>
            </ConfirmationModal>

            <h2 className="mb-4 section-heading"><i className="bi bi-star-fill me-2 text-warning"></i>My Wishlist</h2>
            
            <div className="card card-ui border-0">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                                <tr>
                                    <th style={{ width: '80px', paddingLeft: '1.5rem' }}>Cover</th>
                                    <th>Title</th>
                                    <th>Author</th>
                                    <th>Owner</th>
                                    <th className="text-end" style={{ paddingRight: '1.5rem' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {wishlist.length > 0 ? (
                                    wishlist.map((book, i) => (
                                        <tr key={book._id} className={`animate-fadeInUp delay-${(i % 5) + 1}`}>
                                            <td style={{ paddingLeft: '1.5rem' }}>
                                                {book.imageUrl ? (
                                                    <img src={`http://127.0.0.1:5000${book.imageUrl}`} alt={book.title} style={{ width: '50px', height: '70px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-glass)' }} />
                                                ) : (
                                                    <div style={{ width: '50px', height: '70px', background: 'var(--bg-glass)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                      <i className="bi bi-book text-muted"></i>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="fw-bold" style={{ color: 'var(--text-primary)' }}>{book.title}</td>
                                            <td style={{ color: 'var(--text-secondary)' }}>{book.author}</td>
                                            <td>
                                                <span className="badge bg-secondary rounded-pill px-3 py-2 border border-secondary" style={{ background: 'rgba(255,255,255,0.05) !important' }}>
                                                    <i className="bi bi-person-circle me-1"></i> {book.userId?.username || 'Unknown'}
                                                </span>
                                            </td>
                                            <td className="text-end" style={{ paddingRight: '1.5rem' }}>
                                                <button className="btn btn-outline-danger btn-sm rounded-pill px-3" onClick={() => { setBookToRemove(book); setShowConfirmModal(true); }}>
                                                    <i className="bi bi-trash3 me-1"></i> Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5">
                                            <div className="d-flex flex-column align-items-center">
                                                <i className="bi bi-star text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                                                <h5 style={{ color: 'var(--text-primary)' }}>Your wishlist is empty</h5>
                                                <p style={{ color: 'var(--text-muted)' }}>Save books you're interested in for later.</p>
                                                <Link to="/browse" className="btn btn-outline-primary mt-2 px-4 rounded-pill">Explore Books</Link>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}