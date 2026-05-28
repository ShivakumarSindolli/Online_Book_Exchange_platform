import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftRight, Inbox, Send, Check, X, Package, MessageCircle,
  Contact, Star, Clock, CheckCircle2, Truck, BookOpen
} from 'lucide-react';
import ChatModal from './ChatModal';
import ConfirmationModal from './ConfirmationModal';
import RatingModal from './RatingModal';

/* ── Animation helpers ── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] },
});

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: (i) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  }),
};

/* ── Status configuration ── */
const statusConfig = {
  pending:  { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)', icon: Clock,        label: 'Pending' },
  accepted: { color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)', icon: CheckCircle2, label: 'Accepted' },
  rejected: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)',  icon: X,            label: 'Rejected' },
};

const deliveryConfig = {
  sent:     { color: '#6366f1', bg: 'rgba(99,102,241,0.1)',  border: 'rgba(99,102,241,0.25)', icon: Truck,        label: 'Shipped' },
  received: { color: '#22d3ee', bg: 'rgba(34,211,238,0.1)',  border: 'rgba(34,211,238,0.25)', icon: CheckCircle2, label: 'Completed' },
};

/* ── Reusable Status Badge ── */
function StatusBadge({ status, deliveryStatus }) {
  const cfg = statusConfig[status] || statusConfig.pending;
  const delCfg = deliveryConfig[deliveryStatus];
  const Icon = cfg.icon;
  return (
    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
        padding: '0.25rem 0.65rem', borderRadius: '999px', fontSize: '0.72rem',
        fontWeight: 600, letterSpacing: '0.02em',
        color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`,
      }}>
        <Icon size={12} /> {cfg.label}
      </span>
      {delCfg && (() => {
        const DIcon = delCfg.icon;
        return (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
            padding: '0.25rem 0.65rem', borderRadius: '999px', fontSize: '0.72rem',
            fontWeight: 600, letterSpacing: '0.02em',
            color: delCfg.color, background: delCfg.bg, border: `1px solid ${delCfg.border}`,
          }}>
            <DIcon size={12} /> {delCfg.label}
          </span>
        );
      })()}
    </div>
  );
}

/* ── Reusable Action Button ── */
function ActionBtn({ onClick, icon: Icon, label, variant = 'ghost', color, title }) {
  const styles = {
    primary: {
      background: 'var(--grad-brand)', color: '#fff', border: 'none',
      boxShadow: '0 2px 12px rgba(168,85,247,0.25)',
    },
    success: {
      background: 'rgba(16,185,129,0.12)', color: '#10b981',
      border: '1px solid rgba(16,185,129,0.25)',
    },
    danger: {
      background: 'rgba(239,68,68,0.08)', color: '#ef4444',
      border: '1px solid rgba(239,68,68,0.2)',
    },
    warning: {
      background: 'rgba(245,158,11,0.08)', color: '#f59e0b',
      border: '1px solid rgba(245,158,11,0.2)',
    },
    ghost: {
      background: 'var(--bg-surface)', color: color || 'var(--text-2)',
      border: '1px solid var(--border)',
    },
  };
  const s = styles[variant] || styles.ghost;
  return (
    <motion.button
      whileHover={{ scale: 1.04, y: -1 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      title={title || label}
      style={{
        ...s,
        display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
        padding: label ? '0.4rem 0.85rem' : '0.4rem 0.55rem',
        borderRadius: '10px', fontSize: '0.78rem', fontWeight: 600,
        cursor: 'pointer', transition: 'all 0.2s ease',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <Icon size={14} />
      {label && <span>{label}</span>}
    </motion.button>
  );
}

/* ── Request Card Component ── */
function RequestCard({ req, type, currentUserId, onAccept, onReject, onMarkSent, onDeliverClick, onViewContact, onChat, onRate, hasRated, index }) {
  const isIncoming = type === 'incoming';
  const counterparty = isIncoming ? req.requesterId : req.ownerId;

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      layout
      className="request-card"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-lg)',
        padding: '1.15rem 1.25rem',
      }}
    >
      {/* Top row: Book info + Status */}
      <div className="request-card-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.75rem' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
            <div style={{
              width: 28, height: 28, borderRadius: 'var(--r-sm)',
              background: isIncoming ? 'rgba(168,85,247,0.1)' : 'rgba(34,211,238,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <BookOpen size={14} color={isIncoming ? 'var(--violet)' : 'var(--cyan)'} />
            </div>
            <h4 className="request-card-title" style={{
              fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-1)',
              margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {req.bookId.title}
            </h4>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-3)', margin: 0 }}>
            {isIncoming ? 'Requested by' : 'Owned by'}{' '}
            <span style={{ fontWeight: 600, color: 'var(--text-2)' }}>{counterparty.username}</span>
          </p>
        </div>
        <StatusBadge status={req.status} deliveryStatus={req.deliveryStatus} />
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--border)', margin: '0.5rem 0 0.75rem' }} />

      {/* Action row */}
      <div className="request-card-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', justifyContent: 'flex-end' }}>
        {/* Incoming: Accept / Reject */}
        {isIncoming && req.status === 'pending' && (
          <>
            <ActionBtn onClick={() => onAccept(req._id)} icon={Check} label="Accept" variant="success" />
            <ActionBtn onClick={() => onReject(req._id)} icon={X} label="Reject" variant="danger" />
          </>
        )}

        {/* Incoming: Mark as Sent */}
        {isIncoming && req.status === 'accepted' && req.deliveryStatus === 'pending' && (
          <ActionBtn onClick={() => onMarkSent(req._id)} icon={Package} label="Mark as Sent" variant="warning" />
        )}

        {/* Incoming: Waiting label */}
        {isIncoming && req.status === 'accepted' && req.deliveryStatus === 'sent' && (
          <span style={{
            fontSize: '0.75rem', color: 'var(--text-3)', fontStyle: 'italic',
            display: 'flex', alignItems: 'center', gap: '0.3rem',
            padding: '0.3rem 0.7rem', borderRadius: '8px', background: 'var(--bg-elevated)',
          }}>
            <Clock size={12} /> Waiting for receiver…
          </span>
        )}

        {/* Outgoing: Confirm Receipt */}
        {!isIncoming && req.status === 'accepted' && req.deliveryStatus === 'sent' && (
          <ActionBtn onClick={() => onDeliverClick(req)} icon={CheckCircle2} label="Confirm Receipt" variant="success" />
        )}

        {/* Accepted: Contact + Chat */}
        {req.status === 'accepted' && (
          <>
            <ActionBtn onClick={() => onViewContact(req._id)} icon={Contact} title="View Contact" variant="ghost" color="var(--cyan)" />
            <ActionBtn onClick={() => onChat(req)} icon={MessageCircle} title="Chat" variant="primary" />
          </>
        )}

        {/* Completed: Rate or Rated */}
        {req.deliveryStatus === 'received' && !hasRated && (
          <ActionBtn onClick={() => onRate(req)} icon={Star} label="Rate" variant="warning" />
        )}
        {req.deliveryStatus === 'received' && hasRated && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
            fontSize: '0.75rem', fontWeight: 600, color: '#10b981',
            padding: '0.3rem 0.7rem', borderRadius: '8px',
            background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
          }}>
            <CheckCircle2 size={12} /> Rated
          </span>
        )}
      </div>
    </motion.div>
  );
}

/* ── Section Tab Button ── */
function TabButton({ active, onClick, icon: Icon, label, count, accentColor }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.65rem 1.25rem', borderRadius: 'var(--r-md)',
        border: active ? `1px solid ${accentColor}40` : '1px solid var(--border)',
        background: active ? `${accentColor}10` : 'var(--bg-surface)',
        color: active ? accentColor : 'var(--text-3)',
        cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
        fontFamily: "'Inter', sans-serif",
        transition: 'all 0.25s ease',
      }}
    >
      <Icon size={16} />
      <span>{label}</span>
      <span style={{
        background: active ? `${accentColor}20` : 'var(--bg-elevated)',
        color: active ? accentColor : 'var(--text-3)',
        padding: '0.1rem 0.5rem', borderRadius: '999px',
        fontSize: '0.72rem', fontWeight: 700, minWidth: '22px', textAlign: 'center',
      }}>
        {count}
      </span>
    </motion.button>
  );
}

/* ════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════ */
export default function Requests({ token }) {
  const [requests, setRequests] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [contactInfo, setContactInfo] = useState(null);
  const [chatRequest, setChatRequest] = useState(null);
  const [showDeliverConfirmModal, setShowDeliverConfirmModal] = useState(false);
  const [requestToDeliver, setRequestToDeliver] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [requestToRate, setRequestToRate] = useState(null);
  const [activeTab, setActiveTab] = useState('incoming');
  const navigate = useNavigate();

  const handleCloseChat = useCallback(() => setChatRequest(null), []);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    const decoded = jwtDecode(token);
    setCurrentUserId(decoded.userId);
    fetch('http://127.0.0.1:5000/api/requests', { headers: { Authorization: `Bearer ${token}` }})
      .then(res => res.json())
      .then(data => setRequests(Array.isArray(data) ? data : []))
      .catch((err) => { console.error(err); setRequests([]); });
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
      await fetch(`http://127.0.0.1:5000/api/requests/${requestId}/sent`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }});
      setRequests(requests.map(req => req._id === requestId ? { ...req, deliveryStatus: 'sent' } : req));
      toast.success('Marked as sent! Waiting for receiver to confirm.');
    } catch (error) { toast.error(error.message || 'Failed to mark as sent'); }
  };

  const handleDeliverClick = (request) => { setRequestToDeliver(request); setShowDeliverConfirmModal(true); };
  const handleCloseDeliverModal = () => { setRequestToDeliver(null); setShowDeliverConfirmModal(false); };

  const handleConfirmDelivery = async () => {
    if (!requestToDeliver) return;
    try {
      await fetch(`http://127.0.0.1:5000/api/requests/${requestToDeliver._id}/receive`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }});
      setRequests(requests.map(req => req._id === requestToDeliver._id ? { ...req, deliveryStatus: 'received' } : req));
      toast.success('Receipt confirmed! The transaction is complete.');
    } catch (error) { toast.error(error.message || 'Failed to confirm receipt'); }
    finally { handleCloseDeliverModal(); }
  };

  const handleRateClick = (request) => { setRequestToRate(request); setShowRatingModal(true); };

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
    } catch (error) { toast.error("Failed to submit rating"); }
  };

  const infoToShow = contactInfo && contactInfo.owner ? (currentUserId === contactInfo.owner._id ? contactInfo.requester : contactInfo.owner) : null;
  const incoming = requests.filter(req => req.ownerId._id === currentUserId);
  const outgoing = requests.filter(req => req.requesterId._id === currentUserId);
  const hasUserRated = (req) => req.ownerId._id === currentUserId ? req.isRatedByOwner : req.isRatedByRequester;
  const activeRequests = activeTab === 'incoming' ? incoming : outgoing;

  return (
    <div className="page-wrapper" style={{ paddingTop: 0, paddingBottom: '4rem' }}>
      {/* ── Modals ── */}
      {chatRequest && <ChatModal token={token} request={chatRequest} onClose={handleCloseChat} currentUserId={currentUserId} />}
      <ConfirmationModal show={showDeliverConfirmModal} onClose={handleCloseDeliverModal} onConfirm={handleConfirmDelivery} title="Confirm Receipt" confirmText="Yes, Received" confirmButtonClass="btn-success">
        <p>Please confirm that you have received <strong style={{color:'var(--text-1)'}}>&quot;{requestToDeliver?.bookId?.title}&quot;</strong>?</p>
        <p style={{ color: 'var(--text-3)', marginBottom: 0 }}>This will complete the transaction.</p>
      </ConfirmationModal>
      <RatingModal show={showRatingModal} onClose={() => setShowRatingModal(false)} onSubmit={handleRatingSubmit} title="Rate your exchange" />

      {/* ── Page Header ── */}
      <div style={{
        background: 'linear-gradient(180deg, var(--bg-elevated) 0%, transparent 100%)',
        borderBottom: '1px solid var(--border)',
        padding: '2rem 1.5rem 1.5rem',
        textAlign: 'center',
      }}>
        <div className="container">
          <motion.div {...fadeUp(0)}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.35rem 1rem', borderRadius: '999px',
              background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
              color: 'var(--indigo)', fontSize: '0.75rem', fontWeight: 600,
              marginBottom: '0.75rem',
            }}>
              <ArrowLeftRight size={13} /> Exchange Hub
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-1)', marginBottom: '0.4rem' }}>
              My Requests
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-3)', maxWidth: '480px', margin: '0 auto' }}>
              Manage incoming and outgoing book exchange requests
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container" style={{ maxWidth: '900px', marginTop: '1.5rem' }}>

        {/* ── Contact Info Card ── */}
        <AnimatePresence>
          {infoToShow && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.97 }}
              style={{
                background: 'rgba(34,211,238,0.04)',
                border: '1px solid rgba(34,211,238,0.2)',
                borderRadius: 'var(--r-lg)',
                padding: '1.25rem',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--cyan)', fontWeight: 700, fontSize: '0.9rem' }}>
                  <Contact size={16} /> Contact Information
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setContactInfo(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer' }}
                >
                  <X size={16} />
                </motion.button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
                {[
                  { label: 'Username', value: infoToShow.username },
                  { label: 'Email', value: infoToShow.email },
                  { label: 'Phone', value: infoToShow.phone || '—' },
                ].map(item => (
                  <div key={item.label} style={{ padding: '0.65rem 0.85rem', borderRadius: 'var(--r-sm)', background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-4)', marginBottom: '0.2rem' }}>{item.label}</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-1)' }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Tab Switcher ── */}
        <motion.div {...fadeUp(0.1)} style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <TabButton active={activeTab === 'incoming'} onClick={() => setActiveTab('incoming')} icon={Inbox} label="Incoming" count={incoming.length} accentColor="#a855f7" />
          <TabButton active={activeTab === 'outgoing'} onClick={() => setActiveTab('outgoing')} icon={Send} label="Outgoing" count={outgoing.length} accentColor="#22d3ee" />
        </motion.div>

        {/* ── Request Cards Grid ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
          >
            {activeRequests.length > 0 ? (
              activeRequests.map((req, i) => (
                <RequestCard
                  key={req._id}
                  req={req}
                  type={activeTab}
                  currentUserId={currentUserId}
                  onAccept={(id) => handleStatusUpdate(id, 'accepted')}
                  onReject={(id) => handleStatusUpdate(id, 'rejected')}
                  onMarkSent={handleMarkAsSent}
                  onDeliverClick={handleDeliverClick}
                  onViewContact={viewContact}
                  onChat={setChatRequest}
                  onRate={handleRateClick}
                  hasRated={hasUserRated(req)}
                  index={i}
                />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  textAlign: 'center', padding: '3rem 1.5rem',
                  background: 'var(--bg-surface)', border: '1px solid var(--border)',
                  borderRadius: 'var(--r-lg)',
                }}
              >
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'var(--bg-elevated)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1rem',
                }}>
                  {activeTab === 'incoming' ? <Inbox size={24} color="var(--text-4)" /> : <Send size={24} color="var(--text-4)" />}
                </div>
                <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-2)', marginBottom: '0.3rem' }}>
                  No {activeTab} requests
                </p>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-4)' }}>
                  {activeTab === 'incoming'
                    ? 'When someone requests one of your books, it will appear here.'
                    : 'Browse books and send exchange requests to get started.'}
                </p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}