import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { BookOpen, User, MapPin, Tag, Image, CloudUpload, Loader2 } from 'lucide-react';

export default function AddBook({ token }) {
  const [form, setForm] = useState({ title: '', author: '', condition: 'Good', type: 'lend', price: '', city: '', state: '' });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { if (!token) navigate('/login'); }, [token, navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    for (const key in form) formData.append(key, form[key]);
    if (image) formData.append('image', image);
    try {
      const res = await fetch('https://online-book-exchange-platform-hpp1.onrender.com/api/books', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('Book added successfully!');
      navigate('/browse');
    } catch (err) { toast.error(`Error: ${err.message}`); }
    finally { setLoading(false); }
  };

  const inputStyle = {
    width: '100%',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    color: 'var(--text-1)',
    borderRadius: '10px',
    padding: '0.65rem 0.9rem',
    fontSize: '0.9rem',
    fontFamily: "'Inter', sans-serif",
    outline: 'none',
    transition: 'all 0.15s ease',
  };
  const labelStyle = {
    fontSize: '0.73rem', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.08em',
    color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: '0.35rem',
    marginBottom: '0.4rem',
  };

  return (
    <div className="auth-page" style={{ alignItems: 'flex-start', paddingTop: '6rem', paddingBottom: '3rem' }}>
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: '100%', maxWidth: '560px',
          background: 'var(--bg-overlay)',
          border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: '20px',
          padding: '2.5rem 2.25rem',
          boxShadow: '0 0 60px rgba(99,102,241,0.15), 0 24px 64px rgba(0,0,0,0.6)',
          backdropFilter: 'blur(30px)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.12))',
            border: '1px solid rgba(99,102,241,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.1rem',
          }}>
            <BookOpen size={22} color="#818cf8" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.3rem' }}>Add a New Book</h2>
          <p style={{ color: '#64748b', fontSize: '0.88rem' }}>Share your book with the community</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Title */}
          <div>
            <label style={labelStyle}><BookOpen size={11} /> Title</label>
            <input name="title" type="text" placeholder="Book title" onChange={handleChange} style={inputStyle} required
              onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }} />
          </div>

          {/* Author */}
          <div>
            <label style={labelStyle}><User size={11} /> Author</label>
            <input name="author" type="text" placeholder="Author name" onChange={handleChange} style={inputStyle} required
              onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }} />
          </div>

          {/* City & State */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={labelStyle}><MapPin size={11} /> City</label>
              <input name="city" type="text" placeholder="Mumbai" onChange={handleChange} style={inputStyle} required
                onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }} />
            </div>
            <div>
              <label style={labelStyle}><MapPin size={11} /> State</label>
              <input name="state" type="text" placeholder="Maharashtra" onChange={handleChange} style={inputStyle} required
                onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }} />
            </div>
          </div>

          {/* Condition & Type */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={labelStyle}><Tag size={11} /> Condition</label>
              <select name="condition" value={form.condition} onChange={handleChange} style={{ ...inputStyle, cursor: 'pointer' }} required>
                {['New','Like New','Good','Fair','Used'].map(c => (
                  <option key={c} style={{ background: 'var(--bg-overlay)', color: 'var(--text-1)' }}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}><Tag size={11} /> Type</label>
              <select name="type" value={form.type} onChange={handleChange} style={{ ...inputStyle, cursor: 'pointer' }} required>
                <option value="lend" style={{ background: 'var(--bg-overlay)', color: 'var(--text-1)' }}>Lend</option>
                <option value="sell" style={{ background: 'var(--bg-overlay)', color: 'var(--text-1)' }}>Sell</option>
              </select>
            </div>
          </div>

          {/* Price (if sell) */}
          {form.type === 'sell' && (
            <div>
              <label style={labelStyle}><Tag size={11} /> Price (₹)</label>
              <input name="price" type="number" placeholder="Enter price" value={form.price} onChange={handleChange} style={inputStyle} required
                onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }} />
            </div>
          )}

          {/* Image upload */}
          <div>
            <label style={labelStyle}><Image size={11} /> Book Cover Photo</label>
            <label htmlFor="book-image" style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem',
              border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '12px',
              padding: '1.5rem', cursor: 'pointer', color: '#64748b',
              transition: 'all 0.2s ease', fontSize: '0.88rem',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; e.currentTarget.style.background = 'rgba(99,102,241,0.04)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'transparent'; }}
            >
              {preview ? (
                <img src={preview} alt="Preview" style={{ maxHeight: '160px', borderRadius: '8px', objectFit: 'cover' }} />
              ) : (
                <><Image size={28} style={{ opacity: 0.4 }} /><span>Click to upload cover image</span></>
              )}
            </label>
            <input id="book-image" type="file" name="image" onChange={handleImageChange} accept="image/*" required style={{ display: 'none' }} />
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading} style={{
            marginTop: '0.5rem',
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            color: '#fff', border: 'none', borderRadius: '10px',
            padding: '0.8rem', fontWeight: 700, fontSize: '0.95rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            boxShadow: '0 0 24px rgba(99,102,241,0.4)',
            transition: 'all 0.25s ease',
            opacity: loading ? 0.7 : 1,
          }}>
            {loading ? <><Loader2 size={17} style={{ animation: 'spin 0.7s linear infinite' }} /> Uploading...</> : <><CloudUpload size={17} /> Add Book</>}
          </button>
        </form>
      </motion.div>
    </div>
  );
}