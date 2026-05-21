import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
import ChatModal from './ChatModal';
import ConfirmationModal from './ConfirmationModal';
import RatingModal from './RatingModal';

export default function Requests({ token }) {
  const [requests, setRequests] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [contactInfo, setContactInfo] = useState(null);
  const [chatRequest, setChatRequest] = useState(null);
  const [showDeliverConfirmModal, setShowDeliverConfirmModal] = useState(false);
  const [requestToDeliver, setRequestToDeliver] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [requestToRate, setRequestToRate] = useState(null);
  const navigate = useNavigate();

  const handleCloseChat = useCallback(() => setChatRequest(null), []);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    const decoded = jwtDecode(token);
    setCurrentUserId(decoded.userId);
    fetch('http://127.0.0.1:5000/api/requests', { headers: { Authorization: `Bearer ${token}` }})
      .then(res => res.json())
      .then(data => setRequests(Array.isArray(data) ? data : []))
      .catch((err) => {
          console.error(err);
          setRequests([]);
      });
  }, [token, navigate]);

  const handleStatusUpdate = async (id, status) => {
    try {
      await fetch(`http://127.0.0.1:5000/api/requests/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ status }) });
      setRequests(requests.map(req => req._id === id ? { ...req, status } : req));
      toast.success(`Request has been ${status}.`);
    } catch(err) { toast.error("Failed to update status."); }
  };
  
  const viewContact = async (id) => {
    try {
         const res = await fetch(`http://127.0.0.1:5000/api/requests/${id}/contact`, { headers: { Authorization: `Bearer ${token}` }});
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setContactInfo(data);
    } catch(err) { toast.error(err.message); }
  };

  const handleMarkAsSent = async (requestId) => {
    try {
      await fetch(`http://127.0.0.1:5000/api/requests/${requestId}/sent`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(requests.map(req => req._id === requestId ? { ...req, deliveryStatus: 'sent' } : req));
      toast.success('Marked as sent! Waiting for receiver to confirm.');
    } catch (error) { toast.error(error.message || 'Failed to mark as sent'); }
  };

  const handleDeliverClick = (request) => {
    setRequestToDeliver(request);
    setShowDeliverConfirmModal(true);
  };

  const handleCloseDeliverModal = () => {
    setRequestToDeliver(null);
    setShowDeliverConfirmModal(false);
  };

  const handleConfirmDelivery = async () => {
    if (!requestToDeliver) return;
    try {
      await fetch(`http://127.0.0.1:5000/api/requests/${requestToDeliver._id}/receive`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(requests.map(req => req._id === requestToDeliver._id ? { ...req, deliveryStatus: 'received' } : req));
      toast.success('Receipt confirmed! The transaction is complete.');
    } catch (error) {
      toast.error(error.message || 'Failed to confirm receipt');
    } finally {
      handleCloseDeliverModal();
    }
  };

  const handleRateClick = (request) => {
    setRequestToRate(request);
    setShowRatingModal(true);
  };

  const handleRatingSubmit = async (rating, comment) => {
    if (!requestToRate) return;
    const userToRateId = currentUserId === requestToRate.ownerId._id ? requestToRate.requesterId._id : requestToRate.ownerId._id;
    const isOwnerRating = currentUserId === requestToRate.ownerId._id;
    try {
        await fetch(`http://127.0.0.1:5000/api/user/rate/${userToRateId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ rating, comment, requestId: requestToRate._id })
        });
        toast.success("Thank you for your rating!");
        setRequests(requests.map(r => {
          if (r._id === requestToRate._id) {
            return isOwnerRating ? { ...r, isRatedByOwner: true } : { ...r, isRatedByRequester: true };
          }
          return r;
        }));
        setShowRatingModal(false);
    } catch (error) { 
        toast.error("Failed to submit rating"); 
    }
  };

  const infoToShow = contactInfo && contactInfo.owner ? (currentUserId === contactInfo.owner._id ? contactInfo.requester : contactInfo.owner) : null;
  const incoming = requests.filter(req => req.ownerId._id === currentUserId);
  const outgoing = requests.filter(req => req.requesterId._id === currentUserId);
  const hasUserRated = (req) => req.ownerId._id === currentUserId ? req.isRatedByOwner : req.isRatedByRequester;

  return (
    <div className="container py-4 animate-fadeInUp">
      {chatRequest && <ChatModal token={token} request={chatRequest} onClose={handleCloseChat} currentUserId={currentUserId} />}
      <ConfirmationModal show={showDeliverConfirmModal} onClose={handleCloseDeliverModal} onConfirm={handleConfirmDelivery} title="Confirm Receipt" confirmText="Yes, Received" confirmButtonClass="btn-success">
        <p>Please confirm that you have received <strong style={{color:'var(--text-primary)'}}>"{requestToDeliver?.bookId?.title}"</strong>?</p>
        <p className="text-muted mb-0">This will complete the transaction.</p>
      </ConfirmationModal>
      <RatingModal show={showRatingModal} onClose={() => setShowRatingModal(false)} onSubmit={handleRatingSubmit} title={`Rate your exchange`} />

      <h2 className="mb-4 section-heading"><i className="bi bi-arrow-left-right me-2" style={{color: 'var(--accent-blue)'}}></i>My Requests</h2>

      {infoToShow && (
        <div className="card card-ui mb-4 animate-scaleIn border-info" style={{ background: 'rgba(34,211,238,0.05)' }}>
          <div className="card-header border-bottom border-info d-flex justify-content-between align-items-center bg-transparent py-3">
            <h5 className="mb-0 text-info"><i className="bi bi-person-lines-fill me-2"></i>Contact Information</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={() => setContactInfo(null)}></button>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-4"><div className="text-muted small">Username</div><div className="fw-bold">{infoToShow.username}</div></div>
              <div className="col-md-4"><div className="text-muted small">Email</div><div className="fw-bold">{infoToShow.email}</div></div>
              <div className="col-md-4"><div className="text-muted small">Phone</div><div className="fw-bold">{infoToShow.phone}</div></div>
            </div>
          </div>
        </div>
      )}
      
      <div className="card card-ui mb-5 border-0">
        <div className="card-header bg-transparent border-bottom-0 pt-4 pb-3">
            <h4 className="mb-0 d-flex align-items-center">
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(168,85,247,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px' }}>
                    <i className="bi bi-box-arrow-in-down-right" style={{ color: 'var(--accent-purple)' }}></i>
                </div>
                Incoming Requests
            </h4>
        </div>
        <div className="card-body p-0"><div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead style={{ background: 'rgba(255,255,255,0.02)' }}><tr><th style={{paddingLeft:'1.5rem'}}>Book Title</th><th>Requester</th><th>Status</th><th className="text-end" style={{paddingRight:'1.5rem'}}>Actions</th></tr></thead>
            <tbody>
              {incoming.length > 0 ? incoming.map(req => (
                <tr key={req._id}>
                  <td style={{paddingLeft:'1.5rem', color:'var(--text-primary)'}} className="fw-bold">{req.bookId.title}</td>
                  <td style={{color:'var(--text-secondary)'}}>{req.requesterId.username}</td>
                  <td>
                    <span className={`badge bg-${req.status === 'accepted' ? 'success' : req.status === 'rejected' ? 'danger' : 'warning'}`}>{req.status}</span>
                    {req.deliveryStatus === 'sent' && <span className="badge bg-info ms-2">Sent</span>}
                    {req.deliveryStatus === 'received' && <span className="badge bg-secondary ms-2 border border-secondary">Completed</span>}
                  </td>
                  <td className="text-end" style={{paddingRight:'1.5rem'}}><div className="d-flex justify-content-end gap-2">
                      {req.status === 'pending' && (<><button onClick={() => handleStatusUpdate(req._id, 'accepted')} className="btn btn-success btn-sm rounded-pill px-3"><i className="bi bi-check-lg me-1"></i>Accept</button><button onClick={() => handleStatusUpdate(req._id, 'rejected')} className="btn btn-outline-danger btn-sm rounded-pill px-3"><i className="bi bi-x-lg me-1"></i>Reject</button></>)}
                      {req.status === 'accepted' && req.deliveryStatus === 'pending' && (
                          <button onClick={() => handleMarkAsSent(req._id)} className="btn btn-outline-warning btn-sm rounded-pill px-3"><i className="bi bi-box-seam me-1"></i>Mark as Sent</button>
                      )}
                      {req.status === 'accepted' && req.deliveryStatus === 'sent' && (<span className="text-muted small fst-italic py-1 px-2 rounded" style={{background:'rgba(255,255,255,0.05)'}}>Waiting for receiver...</span>)}
                      {req.status === 'accepted' && (<><button onClick={() => viewContact(req._id)} className="btn btn-outline-info btn-sm rounded-pill px-3" title="View Contact"><i className="bi bi-person-lines-fill"></i></button><button onClick={() => setChatRequest(req)} className="btn btn-primary btn-sm rounded-pill px-3" title="Chat"><i className="bi bi-chat-dots"></i></button></>)}
                      {req.deliveryStatus === 'received' && !hasUserRated(req) && (<button onClick={() => handleRateClick(req)} className="btn btn-outline-warning btn-sm rounded-pill px-3"><i className="bi bi-star-fill me-1"></i>Rate</button>)}
                      {req.deliveryStatus === 'received' && hasUserRated(req) && (<span className="text-success small fst-italic py-1 px-2 rounded" style={{background:'rgba(16,185,129,0.1)'}}><i className="bi bi-check-circle-fill me-1"></i>Rated</span>)}
                  </div></td>
                </tr>
              )) : <tr><td colSpan="4" className="text-center py-4 text-muted">No incoming requests.</td></tr>}
            </tbody>
          </table>
        </div></div>
      </div>

      <div className="card card-ui border-0">
        <div className="card-header bg-transparent border-bottom-0 pt-4 pb-3">
            <h4 className="mb-0 d-flex align-items-center">
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(34,211,238,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px' }}>
                    <i className="bi bi-box-arrow-up-right" style={{ color: 'var(--accent-cyan)' }}></i>
                </div>
                Outgoing Requests
            </h4>
        </div>
        <div className="card-body p-0"><div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
          <thead style={{ background: 'rgba(255,255,255,0.02)' }}><tr><th style={{paddingLeft:'1.5rem'}}>Book Title</th><th>Owner</th><th>Status</th><th className="text-end" style={{paddingRight:'1.5rem'}}>Actions</th></tr></thead>
            <tbody>
              {outgoing.length > 0 ? outgoing.map(req => (
                <tr key={req._id}>
                  <td style={{paddingLeft:'1.5rem', color:'var(--text-primary)'}} className="fw-bold">{req.bookId.title}</td>
                  <td style={{color:'var(--text-secondary)'}}>{req.ownerId.username}</td>
                  <td>
                    <span className={`badge bg-${req.status === 'accepted' ? 'success' : req.status === 'rejected' ? 'danger' : 'warning'}`}>{req.status}</span>
                    {req.deliveryStatus === 'sent' && <span className="badge bg-info ms-2">Shipped</span>}
                    {req.deliveryStatus === 'received' && <span className="badge bg-secondary ms-2 border border-secondary">Completed</span>}
                  </td>
                  <td className="text-end" style={{paddingRight:'1.5rem'}}><div className="d-flex justify-content-end gap-2">
                      {req.status === 'accepted' && req.deliveryStatus === 'sent' && (<button onClick={() => handleDeliverClick(req)} className="btn btn-success btn-sm rounded-pill px-3"><i className="bi bi-check2-circle me-1"></i>Confirm Receipt</button>)}
                      {req.status === 'accepted' && (<><button onClick={() => viewContact(req._id)} className="btn btn-outline-info btn-sm rounded-pill px-3" title="View Contact"><i className="bi bi-person-lines-fill"></i></button><button onClick={() => setChatRequest(req)} className="btn btn-primary btn-sm rounded-pill px-3" title="Chat"><i className="bi bi-chat-dots"></i></button></>)}
                      {req.deliveryStatus === 'received' && !hasUserRated(req) && (<button onClick={() => handleRateClick(req)} className="btn btn-outline-warning btn-sm rounded-pill px-3"><i className="bi bi-star-fill me-1"></i>Rate</button>)}
                      {req.deliveryStatus === 'received' && hasUserRated(req) && (<span className="text-success small fst-italic py-1 px-2 rounded" style={{background:'rgba(16,185,129,0.1)'}}><i className="bi bi-check-circle-fill me-1"></i>Rated</span>)}
                  </div></td>
                </tr>
              )) : <tr><td colSpan="4" className="text-center py-4 text-muted">No outgoing requests.</td></tr>}
            </tbody>
          </table>
        </div></div>
      </div>
    </div>
  );
}