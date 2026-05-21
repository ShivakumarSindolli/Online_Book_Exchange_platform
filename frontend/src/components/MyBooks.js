import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ConfirmationModal from './ConfirmationModal';

export default function MyBooks({ token }) {
  const [myBooks, setMyBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);

  const fetchMyBooks = useCallback(async () => {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/books/my-books', {
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
      const res = await fetch(`http://127.0.0.1:5000/api/books/${bookToDelete._id}`, {
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

  if (loading) return (
    <div className="text-center p-5" style={{ height: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
    </div>
  );

  return (
    <div className="container py-4 animate-fadeInUp">
      <ConfirmationModal
        show={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        confirmText="Confirm Deletion"
      >
        <p>Are you sure you want to permanently delete the book titled: <strong style={{color:'var(--text-primary)'}}>"{bookToDelete?.title}"</strong>?</p>
        <p className="text-danger mb-0"><i className="bi bi-exclamation-triangle me-1"></i>This action cannot be undone.</p>
      </ConfirmationModal>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0 section-heading"><i className="bi bi-collection me-2" style={{color: 'var(--accent-purple)'}}></i>My Book Listings</h2>
        <button className="btn btn-primary" onClick={() => navigate('/add-book')}>
          <i className="bi bi-plus-lg me-1"></i> Add New Book
        </button>
      </div>

      <div className="card card-ui border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                <tr>
                  <th style={{ width: '80px', paddingLeft: '1.5rem' }}>Cover</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Condition</th>
                  <th>Status</th>
                  <th className="text-end" style={{ paddingRight: '1.5rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {myBooks.length > 0 ? (
                  myBooks.map((book, i) => (
                    <tr key={book._id} className={`animate-fadeInUp delay-${(i % 5) + 1}`}>
                      <td style={{ paddingLeft: '1.5rem' }}>
                        {book.imageUrl ? (
                          <img src={`http://127.0.0.1:5000${book.imageUrl}`} alt={book.title} 
                               style={{ width: '50px', height: '70px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-glass)' }}/>
                        ) : (
                          <div style={{ width: '50px', height: '70px', background: 'var(--bg-glass)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="bi bi-book text-muted"></i>
                          </div>
                        )}
                      </td>
                      <td className="fw-bold" style={{ color: 'var(--text-primary)' }}>{book.title}</td>
                      <td>
                        <span className={`badge ${book.type === 'sell' ? 'bg-success' : 'bg-info'}`}>
                          {book.type === 'sell' ? `Sell (₹${book.price})` : 'Lend'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{book.condition}</td>
                      <td>
                        <span className={`badge ${book.status === 'available' ? 'bg-primary' : 'bg-secondary'}`}>
                          {book.status}
                        </span>
                      </td>
                      <td className="text-end" style={{ paddingRight: '1.5rem' }}>
                        <button className="btn btn-outline-danger btn-sm rounded-pill px-3" onClick={() => handleDeleteClick(book)} disabled={book.status === 'exchanged'}>
                          <i className="bi bi-trash3 me-1"></i> Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <div className="d-flex flex-column align-items-center">
                        <i className="bi bi-collection text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                        <h5 style={{ color: 'var(--text-primary)' }}>No books listed yet</h5>
                        <p style={{ color: 'var(--text-muted)' }}>Start sharing your collection with the community.</p>
                        <button className="btn btn-primary mt-2" onClick={() => navigate('/add-book')}>Add Your First Book</button>
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