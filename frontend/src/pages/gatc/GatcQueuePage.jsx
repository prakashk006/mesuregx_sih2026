import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import {
  ClipboardCheck,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
  Award,
  RefreshCw,
  Building2,
  Calendar,
  Clock,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';

export default function GatcQueuePage() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Rejection Modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/assignments');
      if (res.data?.success) {
        setAssignments(res.data.data.assignments || []);
      }
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
      setMessage({ text: 'Failed to load assigned applications queue.', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleAccept = async (appId, appNumber) => {
    setActionLoading(true);
    try {
      const res = await api.post('/assignments/accept', { applicationId: appId });
      if (res.data?.success) {
        setMessage({ text: `Assignment for ${appNumber} accepted! You may now begin laboratory testing.`, type: 'success' });
        await fetchAssignments();
      }
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to accept assignment.', type: 'danger' });
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = (app) => {
    setSelectedApp(app);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return;

    setActionLoading(true);
    try {
      const res = await api.post('/assignments/reject', {
        applicationId: selectedApp.application?.id || selectedApp.applicationId,
        reason: rejectionReason.trim(),
      });
      if (res.data?.success) {
        setMessage({ text: `Reassignment request submitted for ${selectedApp.application?.applicationNumber}. Administrator notified.`, type: 'info' });
        setRejectModalOpen(false);
        await fetchAssignments();
      }
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to reject assignment.', type: 'danger' });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredAssignments = assignments.filter((a) => {
    const app = a.application;
    const matchesSearch =
      (app?.applicationNumber || '').toLowerCase().includes(search.toLowerCase()) ||
      (app?.instrument?.customId || '').toLowerCase().includes(search.toLowerCase()) ||
      (app?.business?.businessName || '').toLowerCase().includes(search.toLowerCase()) ||
      (app?.instrument?.model || '').toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'PENDING') return a.status === 'PENDING' || a.status === 'ASSIGNED';
    if (statusFilter === 'IN_PROGRESS') return a.status === 'IN_PROGRESS' || a.status === 'ACCEPTED';
    if (statusFilter === 'COMPLETED') return a.status === 'COMPLETED';
    return true;
  });

  return (
    <div style={{ padding: '1.5rem', maxWidth: 1400, margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ClipboardCheck size={28} color="#0F766E" />
            <span>GATC Verification Queue</span>
          </h1>
          <p style={{ color: 'var(--secondary-text)', fontSize: '0.9rem', margin: '0.3rem 0 0' }}>
            Testing applications allocated to this Government Approved Test Centre
          </p>
        </div>

        <button
          onClick={fetchAssignments}
          className="btn btn-outline btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {message.text && (
        <div style={{
          padding: '0.85rem 1.25rem',
          borderRadius: 8,
          marginBottom: '1.5rem',
          fontSize: '0.9rem',
          background: message.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : message.type === 'info' ? 'rgba(14, 165, 233, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          color: message.type === 'success' ? '#34d399' : message.type === 'info' ? '#38bdf8' : '#f87171',
          border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : message.type === 'info' ? 'rgba(14, 165, 233, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span>{message.text}</span>
          <button onClick={() => setMessage({ text: '', type: '' })} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>×</button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: 450 }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by Application No, Instrument, Business..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.5rem', fontSize: '0.85rem' }}
          />
          <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--secondary-text)' }} />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { key: 'ALL', label: 'All Cases' },
            { key: 'PENDING', label: 'Pending Acceptance' },
            { key: 'IN_PROGRESS', label: 'Under Test' },
            { key: 'COMPLETED', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: 6,
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
                background: statusFilter === tab.key ? '#0F766E' : 'rgba(255, 255, 255, 0.05)',
                color: statusFilter === tab.key ? '#ffffff' : 'var(--secondary-text)',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Queue Table */}
      <div className="card" style={{ padding: '1.5rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--secondary-text)' }}>
            <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 0.75rem' }} />
            <p>Loading verification queue...</p>
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--secondary-text)' }}>
            <ClipboardCheck size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <h3 style={{ fontSize: '1.1rem', color: '#ffffff', marginBottom: '0.4rem' }}>No Applications Found</h3>
            <p style={{ maxWidth: 450, margin: '0 auto', fontSize: '0.85rem' }}>
              {search || statusFilter !== 'ALL'
                ? 'No assigned verification requests match your current search and filter criteria.'
                : 'Your GATC queue currently has no assigned test applications.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left', color: 'var(--secondary-text)' }}>
                  <th style={{ padding: '0.75rem 0.6rem' }}>Application ID</th>
                  <th style={{ padding: '0.75rem 0.6rem' }}>Business Name</th>
                  <th style={{ padding: '0.75rem 0.6rem' }}>Instrument Details</th>
                  <th style={{ padding: '0.75rem 0.6rem' }}>Scheduled Appointment</th>
                  <th style={{ padding: '0.75rem 0.6rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 0.6rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.map((a) => {
                  const app = a.application;
                  const isPendingAcceptance = a.status === 'PENDING' || a.status === 'ASSIGNED';
                  const isUnderTesting = a.status === 'ACCEPTED' || a.status === 'IN_PROGRESS';
                  const isCompleted = a.status === 'COMPLETED';

                  return (
                    <tr key={a.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem 0.6rem' }}>
                        <div style={{ fontWeight: 600, color: '#38bdf8' }}>
                          {app?.applicationNumber}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {app?.applicationType}
                        </div>
                      </td>

                      <td style={{ padding: '1rem 0.6rem' }}>
                        <div style={{ fontWeight: 600, color: '#ffffff' }}>
                          {app?.business?.businessName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          {app?.business?.district}, {app?.business?.state}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.1rem' }}>
                          Owner: {app?.business?.ownerName} • {app?.business?.mobile}
                        </div>
                      </td>

                      <td style={{ padding: '1rem 0.6rem' }}>
                        <div style={{ fontWeight: 600, color: '#ffffff' }}>
                          {app?.instrument?.model}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          {app?.instrument?.customId} • S/N: {app?.instrument?.serialNumber}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.1rem' }}>
                          Type: {app?.instrument?.instrumentType?.name} (Class {app?.instrument?.accuracyClass})
                        </div>
                      </td>

                      <td style={{ padding: '1rem 0.6rem' }}>
                        <div style={{ color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Calendar size={13} color="#94a3b8" />
                          <span>{a.scheduledDate ? new Date(a.scheduledDate).toLocaleDateString() : 'Pending'}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>
                          {a.scheduledTime || '10:00 AM'}
                        </div>
                      </td>

                      <td style={{ padding: '1rem 0.6rem' }}>
                        <StatusBadge status={app?.status || a.status} />
                        {a.rejectionReason && (
                          <div style={{ fontSize: '0.7rem', color: '#f87171', marginTop: '0.3rem', maxWidth: 160 }}>
                            {a.rejectionReason}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '1rem 0.6rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          {isPendingAcceptance && (
                            <>
                              <button
                                onClick={() => handleAccept(app?.id, app?.applicationNumber)}
                                className="btn btn-sm"
                                style={{ background: '#10B981', color: '#ffffff', fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                                disabled={actionLoading}
                              >
                                Accept Case
                              </button>
                              <button
                                onClick={() => openRejectModal(a)}
                                className="btn btn-outline btn-sm"
                                style={{ borderColor: 'rgba(239, 68, 68, 0.4)', color: '#f87171', fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                                disabled={actionLoading}
                              >
                                Reject / Reassign
                              </button>
                            </>
                          )}

                          {isUnderTesting && (
                            <Link
                              to={`/gatc/verification/${app?.id}`}
                              className="btn btn-primary btn-sm"
                              style={{ background: '#0F766E', fontSize: '0.75rem', padding: '0.35rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                            >
                              <Play size={13} />
                              <span>Execute Test</span>
                            </Link>
                          )}

                          {isCompleted && (
                            <Link
                              to={`/verify/${app?.certificate?.certificateNumber || ''}`}
                              className="btn btn-outline btn-sm"
                              style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                            >
                              <Award size={13} color="#10B981" />
                              <span>Certificate</span>
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject / Request Reassignment Modal */}
      {rejectModalOpen && selectedApp && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          padding: '1rem',
        }}>
          <div className="card" style={{ maxWidth: 500, width: '100%', padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#f87171' }}>
              <AlertTriangle size={22} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#ffffff', margin: 0 }}>
                Request Reassignment
              </h3>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--secondary-text)', marginBottom: '1rem' }}>
              You are requesting to return application <strong>{selectedApp.application?.applicationNumber}</strong> to the administrator. Per Legal Metrology regulations, you must specify a valid reason.
            </p>

            <form onSubmit={handleRejectSubmit}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ fontSize: '0.85rem' }}>
                  Reason for Reassignment <span style={{ color: '#f87171' }}>*</span>
                </label>
                <textarea
                  className="form-input"
                  rows={4}
                  placeholder="e.g. Standard test weights currently undergoing NABL calibration; required test load exceeds lab capacity; scheduling conflict..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  required
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="btn btn-outline btn-sm"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-sm"
                  style={{ background: '#ef4444', color: '#ffffff' }}
                  disabled={actionLoading || !rejectionReason.trim()}
                >
                  {actionLoading ? 'Submitting...' : 'Submit Reassignment Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
