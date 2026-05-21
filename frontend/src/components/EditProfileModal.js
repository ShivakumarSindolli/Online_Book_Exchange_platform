import React, { useState, useEffect } from 'react';

export default function EditProfileModal({ show, onClose, currentUser, onUpdate }) {
    const [formData, setFormData] = useState({
        username: '', phone: '', city: '', state: ''
    });

    useEffect(() => {
        if (currentUser) {
            setFormData({
                username: currentUser.username || '',
                phone: currentUser.phone || '',
                city: currentUser.city || '',
                state: currentUser.state || '',
            });
        }
    }, [currentUser]);

    if (!show) return null;

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate(formData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content card card-ui" style={{ maxWidth: '600px' }}>
                <div className="modal-header card-header border-bottom">
                    <h5 className="modal-title card-title mb-0 d-flex align-items-center">
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-gradient-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px' }}>
                            <i className="bi bi-person-gear" style={{ color: 'var(--accent-blue)', fontSize: '1.2rem' }}></i>
                        </div>
                        Edit Your Profile
                    </h5>
                    <button type="button" className="btn-close" onClick={onClose}></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body card-body">
                        <div className="form-floating mb-3">
                            <input type="text" id="username" name="username" className="form-control" value={formData.username} onChange={handleChange} placeholder="Username" required />
                            <label htmlFor="username">Username</label>
                        </div>
                        <div className="form-floating mb-3">
                            <input type="tel" id="phone" name="phone" className="form-control" value={formData.phone} onChange={handleChange} placeholder="Phone Number" />
                            <label htmlFor="phone">Phone Number</label>
                        </div>
                        <div className="row g-2">
                            <div className="col-md">
                                <div className="form-floating">
                                    <input type="text" id="city" name="city" className="form-control" value={formData.city} onChange={handleChange} placeholder="City" />
                                    <label htmlFor="city">City</label>
                                </div>
                            </div>
                            <div className="col-md">
                                <div className="form-floating">
                                    <input type="text" id="state" name="state" className="form-control" value={formData.state} onChange={handleChange} placeholder="State" />
                                    <label htmlFor="state">State</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer card-footer d-flex justify-content-end gap-2 border-top">
                        <button type="button" className="btn btn-secondary px-4 rounded-pill" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary px-4 rounded-pill">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
}