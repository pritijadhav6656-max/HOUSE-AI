import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Users,
  History,
  Cpu,
  MessageSquare,
  Database,
  Search,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useDebounce } from '../hooks/useDebounce';
import StatCard from '../components/StatCard';
import Pagination from '../components/Pagination';
import ConfirmationDialog from '../components/ConfirmationDialog';
import SkeletonLoader from '../components/SkeletonLoader';
import ErrorState from '../components/ErrorState';
import { formatINR, formatDateShort, formatDateTime } from '../utils/formatters';

const AdminDashboardPage = () => {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [overview, setOverview] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [overviewError, setOverviewError] = useState('');

  // Users state
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [usersPage, setUsersPage] = useState(1);
  const [usersPages, setUsersPages] = useState(1);
  const [usersTotal, setUsersTotal] = useState(0);
  const [userToDelete, setUserToDelete] = useState(null);

  // Predictions state
  const [predictions, setPredictions] = useState([]);
  const [predSearch, setPredSearch] = useState('');
  const [predSort, setPredSort] = useState('newest');
  const [predsPage, setPredsPage] = useState(1);
  const [predsPages, setPredsPages] = useState(1);
  const [predsTotal, setPredsTotal] = useState(0);

  // Contacts state
  const [contacts, setContacts] = useState([]);
  const [contactSearch, setContactSearch] = useState('');
  const [contactStatusFilter, setContactStatusFilter] = useState('');
  const [contactsPage, setContactsPage] = useState(1);
  const [contactsPages, setContactsPages] = useState(1);
  const [contactsTotal, setContactsTotal] = useState(0);

  const debouncedUserSearch = useDebounce(userSearch, 300);
  const debouncedPredSearch = useDebounce(predSearch, 300);
  const debouncedContactSearch = useDebounce(contactSearch, 300);

  const fetchOverview = useCallback(async () => {
    setLoadingOverview(true);
    setOverviewError('');
    try {
      const res = await api.get('/admin/overview');
      if (res.data?.success) {
        setOverview(res.data.data);
      }
    } catch (err) {
      setOverviewError(err.response?.data?.message || 'Unable to load admin overview.');
    } finally {
      setLoadingOverview(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get('/admin/users', {
        params: {
          search: debouncedUserSearch,
          role: userRoleFilter,
          page: usersPage,
          limit: 10,
        },
      });
      if (res.data?.success) {
        setUsers(res.data.data || []);
        setUsersTotal(res.data.total || 0);
        setUsersPages(res.data.pages || 1);
      }
    } catch {
      // Handled
    }
  }, [debouncedUserSearch, userRoleFilter, usersPage]);

  const fetchPredictions = useCallback(async () => {
    try {
      const res = await api.get('/admin/predictions', {
        params: {
          search: debouncedPredSearch,
          sort: predSort,
          page: predsPage,
          limit: 10,
        },
      });
      if (res.data?.success) {
        setPredictions(res.data.data || []);
        setPredsTotal(res.data.total || 0);
        setPredsPages(res.data.pages || 1);
      }
    } catch {
      // Handled
    }
  }, [debouncedPredSearch, predSort, predsPage]);

  const fetchContacts = useCallback(async () => {
    try {
      const res = await api.get('/admin/contacts', {
        params: {
          search: debouncedContactSearch,
          status: contactStatusFilter,
          page: contactsPage,
          limit: 10,
        },
      });
      if (res.data?.success) {
        setContacts(res.data.data || []);
        setContactsTotal(res.data.total || 0);
        setContactsPages(res.data.pages || 1);
      }
    } catch {
      // Handled
    }
  }, [debouncedContactSearch, contactStatusFilter, contactsPage]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
  }, [activeTab, fetchUsers]);

  useEffect(() => {
    if (activeTab === 'predictions') fetchPredictions();
  }, [activeTab, fetchPredictions]);

  useEffect(() => {
    if (activeTab === 'contacts') fetchContacts();
  }, [activeTab, fetchContacts]);

  const handleToggleUserRole = async (u) => {
    const newRole = u.role === 'admin' ? 'user' : 'admin';
    try {
      const res = await api.patch(`/admin/users/${u._id}`, { role: newRole });
      if (res.data?.success) {
        showToast(`Updated ${u.name}'s role to ${newRole}.`, 'success');
        fetchUsers();
        fetchOverview();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Role update failed.', 'error');
    }
  };

  const handleToggleUserActive = async (u) => {
    try {
      const res = await api.patch(`/admin/users/${u._id}`, { isActive: !u.isActive });
      if (res.data?.success) {
        showToast(`Account ${!u.isActive ? 'activated' : 'deactivated'}.`, 'success');
        fetchUsers();
        fetchOverview();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Account status update failed.', 'error');
    }
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      const res = await api.delete(`/admin/users/${userToDelete._id}`);
      if (res.data?.success) {
        showToast('User account deleted.', 'success');
        setUserToDelete(null);
        fetchUsers();
        fetchOverview();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Unable to delete user.', 'error');
    }
  };

  const handleToggleContactStatus = async (c) => {
    const nextStatus = c.status === 'resolved' ? 'pending' : 'resolved';
    try {
      const res = await api.patch(`/admin/contacts/${c._id}`, { status: nextStatus });
      if (res.data?.success) {
        showToast(`Message marked as ${nextStatus}.`, 'success');
        fetchContacts();
        fetchOverview();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update contact status.', 'error');
    }
  };

  const handleDeleteContact = async (id) => {
    try {
      const res = await api.delete(`/admin/contacts/${id}`);
      if (res.data?.success) {
        showToast('Contact inquiry deleted.', 'success');
        fetchContacts();
        fetchOverview();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete contact.', 'error');
    }
  };

  if (loadingOverview) {
    return (
      <div className="space-y-6">
        <SkeletonLoader type="stats" />
        <SkeletonLoader rows={4} />
      </div>
    );
  }

  if (overviewError) {
    return <ErrorState title="Admin Portal Error" message={overviewError} onRetry={fetchOverview} />;
  }

  const stats = overview?.stats || {};
  const sys = overview?.systemStatus || {};

  const tabs = [
    { id: 'overview', label: 'System Overview', icon: Shield },
    { id: 'users', label: `Users (${stats.totalUsers || 0})`, icon: Users },
    { id: 'predictions', label: `Predictions (${stats.totalPredictions || 0})`, icon: History },
    { id: 'model', label: 'ML Model Status', icon: Cpu },
    { id: 'contacts', label: `Contacts (${stats.pendingContacts || 0} Pending)`, icon: MessageSquare },
  ];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-[#0F172A] text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-300 bg-purple-500/15 border border-purple-400/20 px-3 py-1 rounded-full mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Administrator Control Center</span>
          </div>
          <h2 className="text-2xl font-extrabold">HOUSE AI Platform Governance</h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Monitor MongoDB collections, Python ML service status, user accounts, and global
            predictions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <span
            className={`px-3 py-1.5 rounded-xl font-bold ${
              sys.database?.connected
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : 'bg-red-500/15 text-red-300 border border-red-500/30'
            }`}
          >
            MongoDB: {sys.database?.state || 'unknown'}
          </span>
          <span
            className={`px-3 py-1.5 rounded-xl font-bold ${
              sys.mlService?.online
                ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
            }`}
          >
            Python ML: {sys.mlService?.online ? 'Online (8000)' : 'Offline'}
          </span>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Registered Users"
          value={stats.totalUsers ?? 0}
          subtitle={`${stats.activeUsers ?? 0} Active • ${stats.adminCount ?? 0} Admins`}
          icon={Users}
          accent="blue"
        />
        <StatCard
          title="Global Predictions"
          value={stats.totalPredictions ?? 0}
          subtitle={`${stats.recentPredictionsCount ?? 0} in last 30 days`}
          icon={History}
          accent="purple"
        />
        <StatCard
          title="Active ML Model R²"
          value={sys.activeModel?.r2Score ?? 'N/A'}
          subtitle={sys.activeModel?.algorithm || 'Gradient Boosting'}
          icon={Cpu}
          accent="emerald"
        />
        <StatCard
          title="Location Master DB"
          value={stats.locationRecordsCount ?? 820}
          subtitle="36 States/UTs • 150 Cities Indexed"
          icon={Database}
          accent="amber"
        />
      </div>

      {/* TABS */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === t.id
                  ? 'bg-[#0F172A] text-white shadow-xs'
                  : 'bg-white text-[#64748B] hover:text-[#0F172A] border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card-surface p-6">
            <h3 className="text-base font-bold text-[#0F172A] mb-4">Recent Global Predictions</h3>
            <div className="space-y-3">
              {(overview?.recentPredictions || []).map((p) => (
                <div
                  key={p._id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-bold text-[#0F172A]">
                      {p.locality}, {p.city} ({p.state})
                    </div>
                    <div className="text-[#64748B]">
                      {p.bhk} BHK • {p.area} sq.ft. • By {p.userId?.name || 'User'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-extrabold text-[#2563EB]">
                      {p.predictedPrice ? formatINR(p.predictedPrice) : 'Unsupported City'}
                    </div>
                    <div className="text-[11px] text-[#64748B]">{formatDateShort(p.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card-surface p-6">
            <h3 className="text-base font-bold text-[#0F172A] mb-4">Recently Registered Users</h3>
            <div className="space-y-3">
              {(overview?.recentUsers || []).map((u) => (
                <div
                  key={u._id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-bold text-[#0F172A]">{u.name}</div>
                    <div className="text-[#64748B]">{u.email}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                        u.role === 'admin'
                          ? 'bg-purple-100 text-[#6D4AFF]'
                          : 'bg-blue-50 text-[#2563EB]'
                      }`}
                    >
                      {u.role}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        u.isActive ? 'bg-emerald-50 text-[#10B981]' : 'bg-red-50 text-[#EF4444]'
                      }`}
                    >
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="card-surface p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => {
                  setUserSearch(e.target.value);
                  setUsersPage(1);
                }}
                placeholder="Search users by name or email..."
                className="input-field pl-9 text-xs py-2"
              />
            </div>
            <select
              value={userRoleFilter}
              onChange={(e) => {
                setUserRoleFilter(e.target.value);
                setUsersPage(1);
              }}
              className="input-field sm:w-44 text-xs py-2"
            >
              <option value="">All Roles</option>
              <option value="user">Standard Users</option>
              <option value="admin">Administrators</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 uppercase text-[#64748B] font-bold">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Joined</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const isSelf = u._id === currentUser?._id;
                  return (
                    <tr key={u._id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#0F172A]">{u.name}</div>
                        <div className="text-[#64748B]">{u.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-md font-bold uppercase text-[10px] ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-[#6D4AFF]'
                              : 'bg-blue-50 text-[#2563EB]'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-md font-bold text-[10px] ${
                            u.isActive ? 'bg-emerald-50 text-[#10B981]' : 'bg-red-50 text-[#EF4444]'
                          }`}
                        >
                          {u.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#64748B]">{formatDateShort(u.createdAt)}</td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          type="button"
                          disabled={isSelf}
                          onClick={() => handleToggleUserRole(u)}
                          className="btn-secondary text-xs py-1 px-2.5"
                        >
                          Make {u.role === 'admin' ? 'User' : 'Admin'}
                        </button>
                        <button
                          type="button"
                          disabled={isSelf}
                          onClick={() => handleToggleUserActive(u)}
                          className="btn-secondary text-xs py-1 px-2.5"
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          type="button"
                          disabled={isSelf}
                          onClick={() => setUserToDelete(u)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#EF4444] disabled:opacity-30"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination
            page={usersPage}
            pages={usersPages}
            total={usersTotal}
            onPageChange={setUsersPage}
          />
        </div>
      )}

      {/* TAB 3: GLOBAL PREDICTIONS */}
      {activeTab === 'predictions' && (
        <div className="card-surface p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={predSearch}
                onChange={(e) => {
                  setPredSearch(e.target.value);
                  setPredsPage(1);
                }}
                placeholder="Search by state, city, or locality..."
                className="input-field pl-9 text-xs py-2"
              />
            </div>
            <select
              value={predSort}
              onChange={(e) => {
                setPredSort(e.target.value);
                setPredsPage(1);
              }}
              className="input-field sm:w-48 text-xs py-2"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price_desc">Highest Valuation</option>
              <option value="price_asc">Lowest Valuation</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 uppercase text-[#64748B] font-bold">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Property</th>
                  <th className="py-3 px-4">Valuation</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {predictions.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#0F172A]">{p.userId?.name || 'User'}</div>
                      <div className="text-[#64748B]">{p.userId?.email || ''}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#0F172A]">
                        {p.locality}, {p.city}
                      </div>
                      <div className="text-[#64748B]">{p.state}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      {p.bhk} BHK {p.propertyType} ({p.area} sq.ft.)
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-[#2563EB]">
                      {p.predictedPrice ? formatINR(p.predictedPrice) : 'Unsupported Coverage'}
                    </td>
                    <td className="py-3.5 px-4 text-[#64748B]">{formatDateShort(p.createdAt)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/prediction-result/${p._id}`}
                        className="btn-secondary text-xs py-1 px-2.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            page={predsPage}
            pages={predsPages}
            total={predsTotal}
            onPageChange={setPredsPage}
          />
        </div>
      )}

      {/* TAB 4: MODEL MANAGEMENT */}
      {activeTab === 'model' && (
        <div className="card-surface p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-[#0F172A]">
                Active Python Machine Learning Model Configuration
              </h3>
              <p className="text-xs text-[#64748B]">
                Read-only governance view (arbitrary model binary upload/execution is disabled for
                security)
              </p>
            </div>
            <Link to="/model-performance" className="btn-primary text-xs">
              Open Full ML Analytics
            </Link>
          </div>

          {sys.activeModel ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-[#64748B] block">Model Artifact Name</span>
                <strong className="text-[#0F172A]">{sys.activeModel.modelName}</strong>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-[#64748B] block">Selected Algorithm</span>
                <strong className="text-[#2563EB]">{sys.activeModel.algorithm}</strong>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-[#64748B] block">Test R² / MAE / RMSE</span>
                <strong className="text-[#10B981]">
                  R² {sys.activeModel.r2Score} • MAE {formatINR(sys.activeModel.mae)}
                </strong>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-[#64748B] block">Supported ML Cities</span>
                <strong className="text-[#0F172A]">
                  {sys.activeModel.coveredCitiesCount} Verified Urban Centers
                </strong>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-[#64748B] block">Model Version</span>
                <strong className="text-[#0F172A]">v{sys.activeModel.modelVersion}</strong>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-[#64748B] block">Training Timestamp</span>
                <strong className="text-[#0F172A]">
                  {formatDateTime(sys.activeModel.trainingDate)}
                </strong>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[#64748B]">Model metadata unavailable.</p>
          )}
        </div>
      )}

      {/* TAB 5: CONTACT MANAGEMENT */}
      {activeTab === 'contacts' && (
        <div className="card-surface p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={contactSearch}
                onChange={(e) => {
                  setContactSearch(e.target.value);
                  setContactsPage(1);
                }}
                placeholder="Search contact messages..."
                className="input-field pl-9 text-xs py-2"
              />
            </div>
            <select
              value={contactStatusFilter}
              onChange={(e) => {
                setContactStatusFilter(e.target.value);
                setContactsPage(1);
              }}
              className="input-field sm:w-44 text-xs py-2"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div className="space-y-3">
            {contacts.length === 0 ? (
              <p className="text-center py-8 text-xs text-[#64748B]">No contact messages found.</p>
            ) : (
              contacts.map((c) => (
                <div
                  key={c._id}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#0F172A]">{c.subject}</span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          c.status === 'resolved'
                            ? 'bg-emerald-50 text-[#10B981]'
                            : 'bg-amber-50 text-[#F59E0B]'
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#1E293B]">{c.message}</p>
                    <p className="text-[11px] text-[#64748B]">
                      From: <strong>{c.name}</strong> ({c.email}) • {formatDateTime(c.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleContactStatus(c)}
                      className="btn-secondary text-xs py-1.5 px-3"
                    >
                      {c.status === 'resolved' ? (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-amber-500" />
                          Reopen
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                          Mark Resolved
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteContact(c._id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-[#EF4444]"
                      title="Delete Message"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <Pagination
            page={contactsPage}
            pages={contactsPages}
            total={contactsTotal}
            onPageChange={setContactsPage}
          />
        </div>
      )}

      <ConfirmationDialog
        isOpen={Boolean(userToDelete)}
        onClose={() => setUserToDelete(null)}
        onConfirm={confirmDeleteUser}
        title="Delete User Account"
        message={
          userToDelete
            ? `Are you sure you want to delete ${userToDelete.name} (${userToDelete.email}) and all of their stored predictions?`
            : ''
        }
        confirmLabel="Delete User"
      />
    </div>
  );
};

export default AdminDashboardPage;
