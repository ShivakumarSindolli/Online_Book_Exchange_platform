import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import StarRating from './StarRating';
import EditProfileModal from './EditProfileModal';

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
                fetch('http://127.0.0.1:5000/api/user/profile', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('http://127.0.0.1:5000/api/user/ratings/given', { headers: { 'Authorization': `Bearer ${token}` } })
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
            await fetch('http://127.0.0.1:5000/api/user/profile', {
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
        <div className="text-center p-5" style={{ height: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );
    if (!profile) return <div className="text-center p-5"><h4 style={{ color: 'var(--text-muted)' }}>Could not load profile.</h4></div>;

    return (
        <>
            <EditProfileModal
                show={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                currentUser={profile}
                onUpdate={handleProfileUpdate}
            />
            <div className="container py-4 animate-fadeInUp">
                {/* Profile Info Card */}
                <div className="card card-ui mb-5 border-0" style={{ position: 'relative', overflow: 'hidden' }}>
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, height: '120px',
                        background: 'var(--accent-gradient)', opacity: 0.8, zIndex: 0
                    }}></div>
                    <div className="card-body p-4" style={{ position: 'relative', zIndex: 1, marginTop: '40px' }}>
                        <div className="text-center">
                            <div style={{
                                width: '120px', height: '120px', borderRadius: '50%',
                                background: 'var(--bg-secondary)', border: '4px solid var(--bg-glass)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 1rem', fontSize: '3.5rem', color: 'var(--accent-blue)',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                            }}>
                                {profile.username.charAt(0).toUpperCase()}
                            </div>
                            <h2 className="card-title mt-3 fw-bold">{profile.username}</h2>
                            <div className="d-flex justify-content-center gap-3 mb-3" style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                <span><i className="bi bi-envelope me-2 text-primary"></i>{profile.email}</span>
                                {profile.phone && <span><i className="bi bi-telephone me-2 text-info"></i>{profile.phone}</span>}
                                <span><i className="bi bi-geo-alt me-2 text-danger"></i>{profile.city}, {profile.state}</span>
                            </div>
                            <div className="d-flex justify-content-center align-items-center mb-4">
                                <div className="p-3 rounded" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                                    <div className="d-flex align-items-center">
                                        <StarRating rating={profile.averageRating} readOnly={true} />
                                        <span className="ms-3 fw-bold fs-5">{profile.averageRating}</span>
                                        <span className="ms-2 text-muted">({profile.ratings.length} reviews)</span>
                                    </div>
                                </div>
                            </div>
                            <button className="btn btn-outline-secondary px-4 rounded-pill" onClick={() => setIsEditModalOpen(true)}>
                                <i className="bi bi-pencil-square me-2"></i>Edit Profile
                            </button>
                        </div>
                    </div>
                </div>

                <div className="row g-4">
                    {/* Ratings Received */}
                    <div className="col-lg-6 animate-fadeInUp delay-1">
                        <div className="card card-ui h-100">
                            <div className="card-header bg-transparent border-bottom-0 pt-4 pb-0">
                                <h3 className="h5 fw-bold mb-0"><i className="bi bi-star me-2" style={{color: 'var(--accent-purple)'}}></i>Reviews Received</h3>
                            </div>
                            <div className="card-body">
                                {profile.ratings.length > 0 ? (
                                    <div className="list-group list-group-flush gap-2">
                                        {profile.ratings.map((r, i) => (
                                            <div key={r._id} className="list-group-item rounded border-0" style={{ background: 'var(--bg-surface)' }}>
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <div>
                                                        <strong style={{ color: 'var(--text-primary)' }}>{r.user?.username || 'A user'}</strong>
                                                        <span className="ms-2" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                            {new Date(r.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <StarRating rating={r.rating} readOnly={true} />
                                                </div>
                                                {r.comment && <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>"{r.comment}"</p>}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-5">
                                        <i className="bi bi-star text-muted" style={{ fontSize: '2rem' }}></i>
                                        <p className="mt-2 text-muted">No reviews received yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Ratings Given */}
                    <div className="col-lg-6 animate-fadeInUp delay-2">
                        <div className="card card-ui h-100">
                            <div className="card-header bg-transparent border-bottom-0 pt-4 pb-0">
                                <h3 className="h5 fw-bold mb-0"><i className="bi bi-chat-right-quote me-2" style={{color: 'var(--accent-cyan)'}}></i>Reviews Given</h3>
                            </div>
                            <div className="card-body">
                                {givenRatings.length > 0 ? (
                                    <div className="list-group list-group-flush gap-2">
                                        {givenRatings.map((r, i) => (
                                            <div key={r._id} className="list-group-item rounded border-0" style={{ background: 'var(--bg-surface)' }}>
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <div>
                                                        <span className="text-muted me-1">To</span>
                                                        <strong style={{ color: 'var(--text-primary)' }}>{r.ratedUser?.username || 'a user'}</strong>
                                                        <span className="ms-2" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                            {new Date(r.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <StarRating rating={r.rating} readOnly={true} />
                                                </div>
                                                {r.comment && <p className="mb-0" style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>"{r.comment}"</p>}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-5">
                                        <i className="bi bi-chat-square text-muted" style={{ fontSize: '2rem' }}></i>
                                        <p className="mt-2 text-muted">You haven't reviewed anyone yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}