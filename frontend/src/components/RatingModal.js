import React, { useState } from 'react';
import StarRating from './StarRating'; 

export default function RatingModal({ show, onClose, onSubmit, title }) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');

    if (!show) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(rating, comment);
        setRating(0);
        setHoverRating(0);
        setComment('');
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content card card-ui" style={{ maxWidth: '500px', width: '90%' }}>
                <div className="modal-header card-header border-bottom">
                    <h5 className="modal-title card-title mb-0 d-flex align-items-center">
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px' }}>
                            <i className="bi bi-star-fill text-warning" style={{ fontSize: '1rem' }}></i>
                        </div>
                        {title}
                    </h5>
                    <button type="button" className="btn-close" onClick={onClose}></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body card-body text-center">
                        <p style={{ color: 'var(--text-2)' }}>How was your experience with this exchange? Please leave a rating.</p>
                        
                        <div className="mb-4 d-flex justify-content-center p-3 rounded" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                           <StarRating rating={rating} onRating={setRating} hoverRating={hoverRating} onHover={setHoverRating} />
                        </div>

                        <div className="text-start">
                            <label htmlFor="ratingComment" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-3)', marginBottom: '0.4rem', display: 'block' }}>Optional Comment</label>
                            <textarea
                                className="form-control"
                                placeholder="Leave a comment here (optional)"
                                id="ratingComment"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                style={{ height: '100px' }}
                            ></textarea>
                        </div>
                    </div>
                    <div className="modal-footer card-footer d-flex justify-content-end gap-2 border-top">
                        <button type="button" className="btn btn-secondary px-4 rounded-pill" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-warning px-4 rounded-pill" disabled={rating === 0}>
                            Submit Rating
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}