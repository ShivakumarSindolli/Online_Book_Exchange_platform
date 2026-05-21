import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar   from './components/Navbar';
import Home     from './components/Home';
import Footer   from './components/Footer';
import Register from './components/Register';
import Login    from './components/Login';
import AddBook  from './components/AddBook';
import BrowseBooks from './components/BrowseBooks';
import Requests from './components/Requests';
import MyBooks  from './components/MyBooks';
import Profile  from './components/Profile';
import Wishlist from './components/Wishlist';

import './index.css';
import './App.css';

function AppContent() {
  const [token, setToken] = useState(null);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const stored = localStorage.getItem('token');
    if (stored) setToken(stored);
  }, []);

  const handleSetToken = (t) => { localStorage.setItem('token', t); setToken(t); };
  const logout = () => { localStorage.removeItem('token'); setToken(null); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        theme="dark"
        toastStyle={{
          background: 'rgba(12,7,28,0.95)',
          border: '1px solid rgba(168,85,247,0.25)',
          color: '#f8fafc',
          borderRadius: '12px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}
      />
      <Navbar token={token} logout={logout} />
      <main style={{ flex: 1, paddingTop: isHomePage ? '0px' : '80px' }}>
        <Routes>
          <Route path="/"         element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login"    element={<Login setToken={handleSetToken} />} />
          <Route path="/add-book" element={<AddBook  token={token} />} />
          <Route path="/browse"   element={<BrowseBooks token={token} />} />
          <Route path="/requests" element={<Requests token={token} />} />
          <Route path="/my-books" element={<MyBooks  token={token} />} />
          <Route path="/profile"  element={<Profile  token={token} />} />
          <Route path="/wishlist" element={<Wishlist token={token} />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;