import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import {
  FlaskConical,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Building2,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Scale,
  RefreshCw,
  Eye,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

export default function AdminGatcManagementPage() {
  const [gatcs, setGatcs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedGatc, setSelectedGatc] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchGatcs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/gatc');
      if (res.data?.success) {
        setGatcs(res.data.data.gatcs || []);
      }
    } catch (err) {
      console.error('Failed to load GATC list:', err);
      setMessage({ text: 'Failed to load Government Approved Test Centres.', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGatcs();
  }, []);

  const handleStatusUpdate = async (gatcId, newStatus) => {
    setActionLoading(true);
    try {
      const res = await api.patch(`/gatc/${gatcId}/status`, {
        status: newStatus,
        remarks: `Updated by Directorate Administrator to ${newStatus}`,
      });
      if (res.data?.success) {
        setMessage({ text: `GATC status successfully updated to ${newStatus}.`, type: 'success' });
        await fetchGatcs();
        if (selectedGatc && selectedGatc.id === gatcId) {
          setSelectedGatc({ ...selectedGatc, status: newStatus });
        }
      }
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to update GATC status.', type: 'danger' });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredGatcs = gatcs.filter((g) => {
    const matchesSearch =
      (g.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (g.gatcCode || '').toLowerCase().includes(search.toLowerCase()) ||
      (g.contactPerson || '').toLowerCase().includes(search.toLowerCase()) ||
      (g.district || '').toLowerCase().includes(search.toLowerCase()) ||
      (g.authorizationNo || '').toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter !== 'ALL' && g.status !== statusFilter) return false;
    return true;
  });

  const totalGatcs = gatcs.length;
  const activeGatcs = gatcs.filter((g) => g.status === 'ACTIVE').length;
  const pendingGatcs = gatcs.filter((g) => g.status === 'PENDING_APPROVAL').length;
  const totalCompletedTests = gatcs.reduce((acc, g) => acc + (g.workload?.completed || 0), 0);

  return (
    <div style={{ padding: '1.5rem', maxWidth: 1400, margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FlaskConical size={28} color="#0F766E" />
            <span>Government Approved Test Centres (GATC)</span>
          </h1>
          <p style={{ color: 'var(--secondary-text)', fontSize: '0.9rem', margin: '0.3rem 0 0' }}>
            Accreditation oversight, workload balancing, and verification authority management
          </p>
        </div>

        <button
          onClick={fetchGatcs}
          className="btn btn-outline btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {message.text && (
        <div style={{
          padding: '0.85rem 1.25rem',
          borderRadius: 8,
          marginBottom: '1.5rem',
          fontSize: '0.9rem',
          background: message.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          color: message.type === 'success' ? '#34d399' : '#f87171',
          border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span>{message.text}</span>
          <button onClick={() => setMessage({ text: '', type: '' })} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>×</button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem',
        marginBottom: '1.75rem',
      }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--secondary-text)', textTransform: 'uppercase', fontWeight: 600 }}>
            Registered GATCs
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#ffffff', marginTop: '0.35rem' }}>
            {loading ? '...' : totalGatcs}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>
            Statewide testing network
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--secondary-text)', textTransform: 'uppercase', fontWeight: 600 }}>
            Active / Approved
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#10B981', marginTop: '0.35rem' }}>
            {loading ? '...' : activeGatcs}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '0.5rem' }}>
            Eligible for allocations
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--secondary-text)', textTransform: 'uppercase', fontWeight: 600 }}>
            Pending Review
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#f59e0b', marginTop: '0.35rem' }}>
            {loading ? '...' : pendingGatcs}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#fbbf24', marginTop: '0.5rem' }}>
            Awaiting accreditation approval
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--secondary-text)', textTransform: 'uppercase', fontWeight: 600 }}>
            GATC Verified Tests
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#38bdf8', marginTop: '0.35rem' }}>
            {loading ? '...' : totalCompletedTests}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>
            Tests completed by test houses
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: 450 }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search GATCs by Name, Code, District, Contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.5rem', fontSize: '0.85rem' }}
          />
          <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--secondary-text)' }} />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { key: 'ALL', label: 'All Statuses' },
            { key: 'ACTIVE', label: 'Active Only' },
            { key: 'PENDING_APPROVAL', label: 'Pending Approval' },
            { key: 'INACTIVE', label: 'Inactive' },
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

      {/* GATCs Table */}
      <div className="card" style={{ padding: '1.5rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--secondary-text)' }}>
            <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 0.75rem' }} />
            <p>Loading GATC test centres...</p>
          </div>
        ) : filteredGatcs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--secondary-text)' }}>
            <FlaskConical size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
            <p>No test centres match your search and filter criteria.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left', color: 'var(--secondary-text)' }}>
                  <th style={{ padding: '0.75rem 0.6rem' }}>GATC Details</th>
                  <th style={{ padding: '0.75rem 0.6rem' }}>Jurisdiction</th>
                  <th style={{ padding: '0.75rem 0.6rem' }}>Authorization No</th>
                  <th style={{ padding: '0.75rem 0.6rem' }}>Current Workload</th>
                  <th style={{ padding: '0.75rem 0.6rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 0.6rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGatcs.map((g) => (
                  <tr key={g.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem 0.6rem' }}>
                      <div style={{ fontWeight: 600, color: '#ffffff' }}>{g.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#38bdf8' }}>{g.gatcCode}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        Contact: {g.contactPerson} • {g.phone}
                      </div>
                    </td>

                    <td style={{ padding: '1rem 0.6rem' }}>
                      <div style={{ color: '#ffffff', fontWeight: 500 }}>{g.district}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{g.state}</div>
                    </td>

                    <td style={{ padding: '1rem 0.6rem' }}>
                      <div style={{ color: '#e2e8f0', fontFamily: 'monospace' }}>{g.authorizationNo}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Valid Till: {g.validTill ? new Date(g.validTill).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>

                    <td style={{ padding: '1rem 0.6rem' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <span style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: 4,
                          background: g.workload?.activeTotal > 0 ? 'rgba(14, 165, 233, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                          color: g.workload?.activeTotal > 0 ? '#38bdf8' : '#94a3b8',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}>
                          {g.workload?.activeTotal || 0} active
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          ({g.workload?.completed || 0} done)
                        </span>
                      </div>
                    </td>

                    <td style={{ padding: '1rem 0.6rem' }}>
                      <StatusBadge status={g.status} />
                    </td>

                    <td style={{ padding: '1rem 0.6rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedGatc(g)}
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                        >
                          <Eye size={13} style={{ marginRight: '0.25rem' }} />
                          <span>View</span>
                        </button>

                        {g.status === 'PENDING_APPROVAL' && (
                          <button
                            type="button"
                            onClick={() => handleStatusUpdate(g.id, 'ACTIVE')}
                            className="btn btn-sm"
                            style={{ background: '#10B981', color: '#ffffff', fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                            disabled={actionLoading}
                          >
                            Approve
                          </button>
                        )}

                        {g.status === 'ACTIVE' && (
                          <button
                            type="button"
                            onClick={() => handleStatusUpdate(g.id, 'INACTIVE')}
                            className="btn btn-outline btn-sm"
                            style={{ borderColor: 'rgba(239, 68, 68, 0.4)', color: '#f87171', fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                            disabled={actionLoading}
                          >
                            Deactivate
                          </button>
                        )}

                        {g.status === 'INACTIVE' && (
                          <button
                            type="button"
                            onClick={() => handleStatusUpdate(g.id, 'ACTIVE')}
                            className="btn btn-outline btn-sm"
                            style={{ borderColor: 'rgba(16, 185, 129, 0.4)', color: '#34d399', fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                            disabled={actionLoading}
                          >
                            Activate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* GATC Details Modal */}
      {selectedGatc && (
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
          <div className="card" style={{ maxWidth: 600, width: '100%', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600 }}>{selectedGatc.gatcCode}</span>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 600, color: '#ffffff', margin: '0.2rem 0 0' }}>
                  {selectedGatc.name}
                </h3>
              </div>
              <StatusBadge status={selectedGatc.status} size="lg" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'var(--secondary-text)', fontSize: '0.75rem' }}>Contact Person</span>
                <div style={{ color: '#ffffff', fontWeight: 500 }}>{selectedGatc.contactPerson}</div>
              </div>
              <div>
                <span style={{ color: 'var(--secondary-text)', fontSize: '0.75rem' }}>Official Phone / Email</span>
                <div style={{ color: '#ffffff' }}>{selectedGatc.phone}</div>
                <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{selectedGatc.email}</div>
              </div>
              <div>
                <span style={{ color: 'var(--secondary-text)', fontSize: '0.75rem' }}>Authorization Number</span>
                <div style={{ color: '#ffffff', fontFamily: 'monospace' }}>{selectedGatc.authorizationNo}</div>
              </div>
              <div>
                <span style={{ color: 'var(--secondary-text)', fontSize: '0.75rem' }}>Physical Facility Location</span>
                <div style={{ color: '#ffffff' }}>{selectedGatc.address}</div>
                <div style={{ color: '#94a3b8' }}>{selectedGatc.city}, {selectedGatc.district}, {selectedGatc.pincode}</div>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1.5rem', fontSize: '0.8rem' }}>
              <div style={{ color: 'var(--secondary-text)', marginBottom: '0.25rem', fontWeight: 600 }}>
                Authorized Testing Scope:
              </div>
              <div style={{ color: '#e2e8f0' }}>{selectedGatc.categories}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setSelectedGatc(null)}
                className="btn btn-outline btn-sm"
              >
                Close
              </button>
              {selectedGatc.status === 'PENDING_APPROVAL' && (
                <button
                  type="button"
                  onClick={() => handleStatusUpdate(selectedGatc.id, 'ACTIVE')}
                  className="btn btn-sm"
                  style={{ background: '#10B981', color: '#ffffff' }}
                  disabled={actionLoading}
                >
                  Approve Test Centre
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
