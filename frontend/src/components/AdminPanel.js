import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, BookOpen, ArrowLeftRight, Search,
  Trash2, Shield, ShieldOff, TrendingUp,
  BookMarked, UserCheck, Clock, AlertTriangle, ToggleLeft,
  ToggleRight, RefreshCw, BarChart3, MapPin, Eye
} from 'lucide-react';

const API = 'http://127.0.0.1:5000/api/admin';

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
  { id: 'users', label: 'Users', icon: <Users size={16} /> },
  { id: 'books', label: 'Books', icon: <BookOpen size={16} /> },
  { id: 'requests', label: 'Requests', icon: <ArrowLeftRight size={16} /> },
];

// ── Stat Card ──
function StatCard({ icon, label, value, color, sub }) {
  return (
    <motion.div className="admin-stat-card" whileHover={{ y: -4, scale: 1.02 }}>
      <div className="admin-stat-icon" style={{ background: `${color}18`, border: `1px solid ${color}35`, color }}>{icon}</div>
      <div className="admin-stat-value">{value}</div>
      <div className="admin-stat-label">{label}</div>
      {sub && <div className="admin-stat-sub">{sub}</div>}
    </motion.div>
  );
}

// ── Dashboard Tab ──
function DashboardTab({ stats }) {
  if (!stats) return <div className="admin-loading"><RefreshCw size={20} className="spin" /> Loading stats...</div>;
  return (
    <div className="admin-dashboard">
      <div className="admin-stats-grid">
        <StatCard icon={<Users size={20} />} label="Total Users" value={stats.totalUsers} color="#a855f7" sub={`+${stats.newUsersThisWeek} this week`} />
        <StatCard icon={<BookOpen size={20} />} label="Total Books" value={stats.totalBooks} color="#6366f1" sub={`+${stats.newBooksThisWeek} this week`} />
        <StatCard icon={<BookMarked size={20} />} label="Available" value={stats.availableBooks} color="#10b981" />
        <StatCard icon={<ArrowLeftRight size={20} />} label="Exchanged" value={stats.exchangedBooks} color="#f59e0b" />
        <StatCard icon={<Clock size={20} />} label="Pending" value={stats.pendingRequests} color="#f472b6" />
        <StatCard icon={<UserCheck size={20} />} label="Accepted" value={stats.acceptedRequests} color="#22d3ee" />
        <StatCard icon={<AlertTriangle size={20} />} label="Rejected" value={stats.rejectedRequests} color="#ef4444" />
        <StatCard icon={<TrendingUp size={20} />} label="Total Requests" value={stats.totalRequests} color="#8b5cf6" sub={`+${stats.newRequestsThisWeek} this week`} />
      </div>
      <div className="admin-charts-row">
        <div className="admin-chart-card">
          <h3><BarChart3 size={16} /> Books by Condition</h3>
          <div className="admin-bar-chart">
            {stats.booksByCondition?.map(item => {
              const max = Math.max(...stats.booksByCondition.map(i => i.count), 1);
              return (
                <div key={item._id} className="admin-bar-row">
                  <span className="admin-bar-label">{item._id || 'Unknown'}</span>
                  <div className="admin-bar-track"><motion.div className="admin-bar-fill" initial={{ width: 0 }} animate={{ width: `${(item.count / max) * 100}%` }} transition={{ duration: 0.6, delay: 0.1 }} /></div>
                  <span className="admin-bar-count">{item.count}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="admin-chart-card">
          <h3><MapPin size={16} /> Top Cities</h3>
          <div className="admin-bar-chart">
            {stats.topCities?.map((item, i) => {
              const max = Math.max(...stats.topCities.map(c => c.count), 1);
              const colors = ['#a855f7', '#6366f1', '#f472b6', '#22d3ee', '#10b981'];
              return (
                <div key={item._id} className="admin-bar-row">
                  <span className="admin-bar-label">{item._id || 'Unknown'}</span>
                  <div className="admin-bar-track"><motion.div className="admin-bar-fill" style={{ background: colors[i % 5] }} initial={{ width: 0 }} animate={{ width: `${(item.count / max) * 100}%` }} transition={{ duration: 0.6, delay: i * 0.08 }} /></div>
                  <span className="admin-bar-count">{item.count}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="admin-chart-card">
          <h3><BookOpen size={16} /> Books by Type</h3>
          <div className="admin-type-chips">
            {stats.booksByType?.map(item => (
              <div key={item._id} className={`admin-type-chip ${item._id}`}>
                <span className="admin-type-dot" />{item._id === 'sell' ? '💰 For Sale' : '🔄 For Lending'}<strong>{item.count}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Users Tab ──
function UsersTab({ token }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const headers = { Authorization: `Bearer ${token}` };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (roleFilter !== 'all') params.set('role', roleFilter);
      const res = await fetch(`${API}/users?${params}`, { headers });
      if (!res.ok) throw new Error('Failed to fetch users');
      setUsers(await res.json());
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  }, [search, roleFilter, token]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const toggleRole = async (id, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const res = await fetch(`${API}/users/${id}/role`, { method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ role: newRole }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(`Role updated to ${newRole}`);
      fetchUsers();
    } catch (err) { toast.error(err.message); }
  };

  const deleteUser = async (id, username) => {
    if (!window.confirm(`Delete user "${username}" and all their data? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${API}/users/${id}`, { method: 'DELETE', headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('User deleted');
      fetchUsers();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div>
      <div className="admin-toolbar">
        <div className="admin-search-box"><Search size={16} /><input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <select className="admin-filter-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="all">All Roles</option><option value="user">Users</option><option value="admin">Admins</option>
        </select>
      </div>
      {loading ? <div className="admin-loading"><RefreshCw size={20} className="spin" /> Loading...</div> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>User</th><th>Email</th><th>Location</th><th>Role</th><th>Books</th><th>Requests</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map(u => (
                <motion.tr key={u._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} layout>
                  <td><div className="admin-user-cell"><div className="admin-avatar-sm">{u.username?.charAt(0).toUpperCase()}</div><div><div className="admin-user-name">{u.username}</div><div className="admin-user-phone">{u.phone}</div></div></div></td>
                  <td><span className="admin-email">{u.email}</span></td>
                  <td><span className="admin-location"><MapPin size={12} />{u.city}, {u.state}</span></td>
                  <td><span className={`admin-role-badge ${u.role}`}>{u.role === 'admin' ? <><Shield size={11} /> Admin</> : <><Eye size={11} /> User</>}</span></td>
                  <td><span className="admin-count-badge">{u.bookCount}</span></td>
                  <td><span className="admin-count-badge">{u.requestCount}</span></td>
                  <td>
                    <div className="admin-actions">
                      <button className="admin-btn-icon" title={u.role === 'admin' ? 'Demote to User' : 'Promote to Admin'} onClick={() => toggleRole(u._id, u.role)}>
                        {u.role === 'admin' ? <ShieldOff size={15} /> : <Shield size={15} />}
                      </button>
                      <button className="admin-btn-icon danger" title="Delete User" onClick={() => deleteUser(u._id, u.username)}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <div className="admin-empty">No users found</div>}
        </div>
      )}
    </div>
  );
}

// ── Books Tab ──
function BooksTab({ token }) {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const headers = { Authorization: `Bearer ${token}` };

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (typeFilter !== 'all') params.set('type', typeFilter);
      const res = await fetch(`${API}/books?${params}`, { headers });
      if (!res.ok) throw new Error('Failed to fetch books');
      setBooks(await res.json());
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  }, [search, statusFilter, typeFilter, token]);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'available' ? 'exchanged' : 'available';
    try {
      const res = await fetch(`${API}/books/${id}/status`, { method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) });
      if (!res.ok) throw new Error('Failed to update');
      toast.success(`Status → ${newStatus}`);
      fetchBooks();
    } catch (err) { toast.error(err.message); }
  };

  const deleteBook = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This also removes related requests.`)) return;
    try {
      const res = await fetch(`${API}/books/${id}`, { method: 'DELETE', headers });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Book deleted');
      fetchBooks();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div>
      <div className="admin-toolbar">
        <div className="admin-search-box"><Search size={16} /><input placeholder="Search books..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <select className="admin-filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option><option value="available">Available</option><option value="exchanged">Exchanged</option>
        </select>
        <select className="admin-filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="all">All Types</option><option value="sell">For Sale</option><option value="lend">For Lending</option>
        </select>
      </div>
      {loading ? <div className="admin-loading"><RefreshCw size={20} className="spin" /> Loading...</div> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Book</th><th>Author</th><th>Owner</th><th>Type</th><th>Price</th><th>Condition</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {books.map(b => (
                <motion.tr key={b._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} layout>
                  <td><div className="admin-book-cell">{b.imageUrl && <img src={`http://127.0.0.1:5000${b.imageUrl}`} alt="" className="admin-book-thumb" />}<span className="admin-book-title">{b.title}</span></div></td>
                  <td>{b.author}</td>
                  <td><span className="admin-email">{b.userId?.username || 'N/A'}</span></td>
                  <td><span className={`admin-type-badge ${b.type}`}>{b.type === 'sell' ? '💰 Sale' : '🔄 Lend'}</span></td>
                  <td>{b.type === 'sell' ? `₹${b.price}` : '—'}</td>
                  <td><span className="admin-condition-badge">{b.condition}</span></td>
                  <td><span className={`admin-status-badge ${b.status}`}>{b.status}</span></td>
                  <td>
                    <div className="admin-actions">
                      <button className="admin-btn-icon" title="Toggle Status" onClick={() => toggleStatus(b._id, b.status)}>
                        {b.status === 'available' ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                      </button>
                      <button className="admin-btn-icon danger" title="Delete Book" onClick={() => deleteBook(b._id, b.title)}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {books.length === 0 && <div className="admin-empty">No books found</div>}
        </div>
      )}
    </div>
  );
}

// ── Requests Tab ──
function RequestsTab({ token }) {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const headers = { Authorization: `Bearer ${token}` };

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await fetch(`${API}/requests?${params}`, { headers });
      if (!res.ok) throw new Error('Failed to fetch');
      setRequests(await res.json());
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  }, [statusFilter, token]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const deleteRequest = async (id) => {
    if (!window.confirm('Delete this request?')) return;
    try {
      const res = await fetch(`${API}/requests/${id}`, { method: 'DELETE', headers });
      if (!res.ok) throw new Error('Failed');
      toast.success('Request deleted');
      fetchRequests();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div>
      <div className="admin-toolbar">
        <select className="admin-filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option><option value="pending">Pending</option><option value="accepted">Accepted</option><option value="rejected">Rejected</option>
        </select>
      </div>
      {loading ? <div className="admin-loading"><RefreshCw size={20} className="spin" /> Loading...</div> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Book</th><th>Requester</th><th>Owner</th><th>Status</th><th>Delivery</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {requests.map(r => (
                <motion.tr key={r._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} layout>
                  <td><span className="admin-book-title">{r.bookId?.title || 'Deleted'}</span></td>
                  <td><span className="admin-email">{r.requesterId?.username || 'N/A'}</span></td>
                  <td><span className="admin-email">{r.ownerId?.username || 'N/A'}</span></td>
                  <td><span className={`admin-status-badge ${r.status}`}>{r.status}</span></td>
                  <td><span className={`admin-status-badge ${r.deliveryStatus}`}>{r.deliveryStatus}</span></td>
                  <td><span className="admin-date">{new Date(r.createdAt).toLocaleDateString()}</span></td>
                  <td>
                    <button className="admin-btn-icon danger" title="Delete Request" onClick={() => deleteRequest(r._id)}>
                      <Trash2 size={15} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {requests.length === 0 && <div className="admin-empty">No requests found</div>}
        </div>
      )}
    </div>
  );
}

// ── Main Admin Panel ──
export default function AdminPanel({ token }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    try {
      const decoded = jwtDecode(token);
      if (decoded.role !== 'admin') { toast.error('Admin access required'); navigate('/'); }
    } catch { navigate('/login'); }
  }, [token, navigate]);

  useEffect(() => {
    if (!token) return;
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API}/stats`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setStats(await res.json());
      } catch (err) { console.error(err); }
    };
    fetchStats();
  }, [token]);

  return (
    <div className="admin-panel">
      <div className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-icon"><Shield size={18} color="#fff" /></div>
          <div><div className="admin-sidebar-title">Admin Panel</div><div className="admin-sidebar-sub">Management Console</div></div>
        </div>
        <nav className="admin-sidebar-nav">
          {tabs.map(tab => (
            <button key={tab.id} className={`admin-nav-btn ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
              {tab.icon}<span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
      <div className="admin-content">
        <div className="admin-content-header">
          <h1 className="admin-page-title">{tabs.find(t => t.id === activeTab)?.label}</h1>
          <span className="admin-breadcrumb">Admin / {tabs.find(t => t.id === activeTab)?.label}</span>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
            {activeTab === 'dashboard' && <DashboardTab stats={stats} />}
            {activeTab === 'users' && <UsersTab token={token} />}
            {activeTab === 'books' && <BooksTab token={token} />}
            {activeTab === 'requests' && <RequestsTab token={token} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
