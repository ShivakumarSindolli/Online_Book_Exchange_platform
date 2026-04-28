import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';

const ImagePlaceholder = () => (
  <div className="d-flex align-items-center justify-content-center bg-secondary-subtle" style={{ height: '250px', color: '#6c757d' }}>
    <i className="bi bi-book fs-1"></i>
  </div>
);

export default function BrowseBooks({ token }) {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState({ city: '', state: '' });
  const [wishlist, setWishlist] = useState([]); // State to hold wishlist book IDs
  const navigate = useNavigate();

  const currentUserId = token ? jwtDecode(token).userId : null;

  // --- Fetch both books and the user's wishlist on component load ---
  useEffect(() => {
    // Fetch all available books
    const fetchBooks = (city = '', state = '') => {
      fetch(`http://localhost:5000/api/books?city=${city}&state=${state}`)
        .then(res => res.json()).then(setBooks).catch(err => console.error(err));
    };

    // Fetch the user's wishlist to know which buttons to disable
    const fetchWishlist = async () => {
      if (!token) return; // Don't fetch if user is not logged in
      try {
        const res = await fetch(`http://localhost:5000/api/user/wishlist`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        // We only need the IDs for quick lookups
        setWishlist(data.map(book => book._id));
      } catch (err) {
        console.error("Could not fetch wishlist");
      }
    };
    
    fetchBooks();
    fetchWishlist();
  }, [token]);

  const handleSearchChange = (e) => setSearch({ ...search, [e.target.name]: e.target.value });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Re-fetch books with search parameters
    fetch(`http://localhost:5000/api/books?city=${search.city}&state=${search.state}`)
      .then(res => res.json()).then(setBooks).catch(err => console.error(err));
  };

  const handleRequest = async (bookId) => {
    if (!token) { toast.warn('Please log in to make a request.'); navigate('/login'); return; }
    try {
      const res = await fetch('http://localhost:5000/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bookId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('Request sent successfully!');
    } catch (err) { toast.error(err.message); }
  };

  // --- New function to handle adding a book to the wishlist ---
  const handleAddToWishlist = async (bookId) => {
    if (!token) { toast.warn("Please log in to add to wishlist"); return; }
    try {
        await fetch(`http://localhost:5000/api/user/wishlist/${bookId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        toast.success("Added to your wishlist!");
        // Optimistically update the local wishlist state to disable the button immediately
        setWishlist([...wishlist, bookId]);
    } catch (error) {
        toast.error("Failed to add to wishlist");
    }
  };

  return (
    <div>
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold">Find Your Next Read</h1>
        <p className="fs-5 text-muted">Browse books available from our community.</p>
        <form onSubmit={handleSearchSubmit} className="row g-2 mt-4 justify-content-center">
            <div className="col-sm-4 col-md-3"><input type="text" name="city" value={search.city} onChange={handleSearchChange} placeholder="City" className="form-control form-control-lg" /></div>
            <div className="col-sm-4 col-md-3"><input type="text" name="state" value={search.state} onChange={handleSearchChange} placeholder="State" className="form-control form-control-lg" /></div>
            <div className="col-auto"><button type="submit" className="btn btn-primary btn-lg">Search</button></div>
        </form>
      </div>

      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
        {books.map(book => {
          if (!book.userId) return null;

          const isOwner = currentUserId === book.userId._id;
          const isInWishlist = wishlist.includes(book._id);

          return (
            <div key={book._id} className="col">
              <div className="card card-ui h-100 shadow-sm">
                <div className="position-relative">
                  <div className="image-overlay-container" style={{ height: '280px', overflow: 'hidden' }}>
                    {book.imageUrl ? (
                      <img
                        src={`http://localhost:5000${book.imageUrl}`}
                        className="w-100 h-100"
                        alt={book.title}
                        style={{
                          objectFit: 'cover',
                          objectPosition: 'center',
                          borderRadius: '0.375rem 0.375rem 0 0'
                        }}
                      />
                    ) : (
                      <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-light border-bottom" style={{ borderRadius: '0.375rem 0.375rem 0 0' }}>
                        <i className="bi bi-book text-muted" style={{ fontSize: '3rem' }}></i>
                      </div>
                    )}
                    <div className="image-overlay-content">
                      <h6 className="mb-2 text-white">Book Condition</h6>
                      <span className="badge bg-light text-dark fs-6 px-3 py-2">{book.condition}</span>
                    </div>
                  </div>
                </div>
                <div className="card-body d-flex flex-column p-3">
                  <div className="mb-2">
                    <span className={`badge ${book.type === 'sell' ? 'bg-success' : 'bg-info'} fs-6 px-3 py-2`}>
                      {book.type === 'sell' ? `$${book.price}` : 'Available to Lend'}
                    </span>
                  </div>
                  <h6 className="card-title fw-bold mb-2 text-truncate" title={book.title}>
                    {book.title}
                  </h6>
                  <p className="card-text text-muted small mb-2">
                    <i className="bi bi-person-fill me-1"></i>
                    {book.author}
                  </p>
                  <div className="mb-3">
                    <div className="small text-muted mb-1">
                      <i className="bi bi-person-circle me-2"></i>
                      {book.userId.username}
                    </div>
                    <div className="small text-muted">
                      <i className="bi bi-geo-alt-fill me-2"></i>
                      {book.city}, {book.state}
                    </div>
                  </div>

                  <div className="mt-auto d-grid gap-2">
                    <button
                      onClick={() => handleRequest(book._id)}
                      className={`btn ${isOwner ? 'btn-outline-secondary' : 'btn-primary'} btn-sm`}
                      disabled={isOwner}
                    >
                      {isOwner ? 'Your Book' : 'Request Book'}
                    </button>
                    {!isOwner && token && (
                      <button
                        className="btn btn-outline-warning btn-sm"
                        onClick={() => handleAddToWishlist(book._id)}
                        disabled={isInWishlist}
                      >
                        <i className="bi bi-star-fill me-1"></i>
                        {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}