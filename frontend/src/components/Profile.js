import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, MapPin, Star, Edit3, MessageSquare,
  Award, Shield, BookOpen, TrendingUp, Calendar
} from 'lucide-react';
import StarRating from './StarRating';
import EditProfileModal from './EditProfileModal';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] },
});

export default function Profile({ token }) {
  const [profile, setProfile] = useState(null);
  const [givenRatings, setGivenRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchAllData = useCallback(async () => {
    if (!token) return;
    try {
      const [profileRes, givenRatingsRes] = await Promise.all([
        fetch('https://online-book-exchange-platform-hpp1.onrender.com/api/user/profile', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('https://online-book-exchange-platform-hpp1.onrender.com/api/user/ratings/given', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      if (!profileRes.ok || !givenRatingsRes.ok) throw new Error('Failed to fetch profile data');
      const profileData = await profileRes.json();
      const givenRatingsData = await givenRatingsRes.json();
      setProfile(profileData);
      setGivenRatings(givenRatingsData);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) navigate('/login');
    else fetchAllData();
  }, [token, navigate, fetchAllData]);

  useEffect(() => {
    const handleFocus = () => fetchAllData();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchAllData]);

  const handleProfileUpdate = async (updatedData) => {
    try {
      await fetch('https://online-book-exchange-platform-hpp1.onrender.com/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(updatedData)
      });
      toast.success("Profile updated successfully!");
      setIsEditModalOpen(false);
      fetchAllData();
    } catch (error) { toast.error('Failed to update profile'); }
  };

  if (loading) return (
    <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(168,85,247,0.2)', borderTopColor: '#a855f7', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ fontSize: '0.9rem', color: 'var(--text-3)' }}>Loading profile...</p>
      </div>
    </div>
  );

  if (!profile) return (
    <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <p style={{ color: 'var(--text-3)', fontSize: '1rem' }}>Could not load profile.</p>
    </div>
  );

  return (
    <>
      <EditProfileModal
        show={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentUser={profile}
        onUpdate={handleProfileUpdate}
      />

      <div className="page-wrapper" style={{ paddingTop: 0, paddingBottom: '4rem' }}>

        {/* ── Page Header ── */}
        <div style={{
          background: 'linear-gradient(180deg, var(--bg-elevated) 0%, transparent 100%)',
          borderBottom: '1px solid var(--border)',
          padding: '2rem 1.5rem 1.5rem',
          textAlign: 'center',
        }}>
          <div className="container">
            <motion.div {...fadeUp(0)}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.1em', color: 'var(--violet)',
                background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)',
                padding: '0.3rem 0.85rem', borderRadius: '99px', marginBottom: '1rem',
              }}>
                <User size={13} /> My Profile
              </span>
              <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
                Your <span style={{ background: 'linear-gradient(90deg,#a855f7,#f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Profile</span>
              </h1>
              <p style={{ color: 'var(--text-3)', marginBottom: '0' }}>
                Manage your account and view your exchange history
              </p>
            </motion.div>
          </div>
        </div>

        <div className="container" style={{ maxWidth: '960px', marginTop: '2rem' }}>

          {/* ── Profile Card ── */}
          <motion.div {...fadeUp(0.1)} style={{
            position: 'relative',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-xl)',
            overflow: 'hidden',
            marginBottom: '2rem',
          }}>
            {/* Gradient banner */}
            <div style={{
              height: '120px',
              background: 'linear-gradient(135deg, rgba(168,85,247,0.3), rgba(99,102,241,0.2), rgba(244,114,182,0.15))',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(circle at 30% 50%, rgba(168,85,247,0.2), transparent 60%)',
              }} />
            </div>

            <div style={{ padding: '0 2rem 2rem', textAlign: 'center', marginTop: '-50px', position: 'relative' }}>
              {/* Avatar */}
              <div style={{
                width: '100px', height: '100px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                border: '4px solid var(--bg-base)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1rem',
                fontSize: '2.5rem', fontWeight: 900, color: '#fff',
                boxShadow: '0 8px 32px rgba(168,85,247,0.3)',
              }}>
                {profile.username.charAt(0).toUpperCase()}
              </div>

              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-1)', marginBottom: '0.75rem' }}>
                {profile.username}
              </h2>

              {/* Info chips */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                <span style={chipStyle}><Mail size={13} /> {profile.email}</span>
                {profile.phone && <span style={chipStyle}><Phone size={13} /> {profile.phone}</span>}
                <span style={chipStyle}><MapPin size={13} /> {profile.city}, {profile.state}</span>
              </div>

              {/* Rating display */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
                background: 'rgba(168,85,247,0.06)',
                border: '1px solid rgba(168,85,247,0.15)',
                borderRadius: 'var(--r-lg)',
                padding: '0.75rem 1.5rem',
                marginBottom: '1.5rem',
              }}>
                <StarRating rating={profile.averageRating} readOnly={true} />
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-1)' }}>{profile.averageRating}</span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>({profile.ratings.length} reviews)</span>
              </div>

              <div>
                <motion.button
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setIsEditModalOpen(true)}
                  className="btn btn-ghost"
                  style={{ gap: '0.5rem' }}
                >
                  <Edit3 size={15} /> Edit Profile
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* ── Stats Row ── */}
          <motion.div {...fadeUp(0.15)} style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            marginBottom: '2rem',
          }}>
            {[
              { icon: <Star size={20} />, value: profile.averageRating, label: 'Avg Rating', color: '#facc15' },
              { icon: <MessageSquare size={20} />, value: profile.ratings.length, label: 'Reviews Received', color: '#a855f7' },
              { icon: <Award size={20} />, value: givenRatings.length, label: 'Reviews Given', color: '#22d3ee' },
            ].map((stat, i) => (
              <div key={i} style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--r-lg)',
                padding: '1.25rem',
                textAlign: 'center',
                transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
                cursor: 'default',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${stat.color}50`; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 32px ${stat.color}15`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ color: stat.color, marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>{stat.icon}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: "'Sora', sans-serif", color: 'var(--text-1)', lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '0.3rem' }}>{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* ── Reviews Grid ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>

            {/* Reviews Received */}
            <motion.div {...fadeUp(0.2)} style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-xl)',
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 'var(--r-sm)',
                  background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--violet)',
                }}>
                  <Star size={15} />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>Reviews Received</h3>
              </div>
              <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {profile.ratings.length > 0 ? profile.ratings.map((r) => (
                  <div key={r._id} style={{
                    background: 'var(--bg-elevated)',
                    borderRadius: 'var(--r-md)',
                    padding: '1rem',
                    transition: 'all 0.25s ease',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontSize: '0.7rem', fontWeight: 800,
                        }}>
                          {(r.user?.username || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-1)' }}>
                          {r.user?.username || 'A user'}
                        </span>
                      </div>
                      <StarRating rating={r.rating} readOnly={true} />
                    </div>
                    {r.comment && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-3)', margin: '0.5rem 0 0', fontStyle: 'italic', lineHeight: 1.6 }}>
                        "{r.comment}"
                      </p>
                    )}
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-4)', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Calendar size={10} /> {new Date(r.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                )) : (
                  <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                    <Star size={32} style={{ color: 'var(--text-4)', opacity: 0.3, marginBottom: '0.75rem' }} />
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-4)' }}>No reviews received yet.</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Reviews Given */}
            <motion.div {...fadeUp(0.25)} style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-xl)',
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 'var(--r-sm)',
                  background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--cyan)',
                }}>
                  <MessageSquare size={15} />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>Reviews Given</h3>
              </div>
              <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {givenRatings.length > 0 ? givenRatings.map((r) => (
                  <div key={r._id} style={{
                    background: 'var(--bg-elevated)',
                    borderRadius: 'var(--r-md)',
                    padding: '1rem',
                    transition: 'all 0.25s ease',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-4)' }}>To</span>
                        <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-1)' }}>
                          {r.ratedUser?.username || 'a user'}
                        </span>
                      </div>
                      <StarRating rating={r.rating} readOnly={true} />
                    </div>
                    {r.comment && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-3)', margin: '0.5rem 0 0', fontStyle: 'italic', lineHeight: 1.6 }}>
                        "{r.comment}"
                      </p>
                    )}
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-4)', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Calendar size={10} /> {new Date(r.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                )) : (
                  <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                    <MessageSquare size={32} style={{ color: 'var(--text-4)', opacity: 0.3, marginBottom: '0.75rem' }} />
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-4)' }}>You haven't reviewed anyone yet.</p>
                  </div>
                )}
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </>
  );
}

/* ── Reusable chip style ── */
const chipStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.35rem',
  fontSize: '0.82rem',
  fontWeight: 500,
  color: 'var(--text-3)',
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--r-full)',
  padding: '0.35rem 0.85rem',
};