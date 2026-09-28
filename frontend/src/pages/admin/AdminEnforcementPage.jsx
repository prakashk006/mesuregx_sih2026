import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  ShieldAlert,
  Search,
  Plus,
  Filter,
  CheckCircle,
  AlertTriangle,
  FileText,
  Camera,
  Calendar,
  Building2,
  Clock,
  Send,
  X,
  ChevronRight,
  Gavel,
  Eye,
  ExternalLink,
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';

export default function AdminEnforcementPage() {
  const [cases, setCases] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [violationFilter, setViolationFilter] = useState('ALL');

  // Selected case for detail modal
  const [selectedCase, setSelectedCase] = useState(null);
  const [activeTab, setActiveTab] = useState('timeline'); // 'timeline' | 'evidence' | 'actions'

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);

  // Form states
  const [createForm, setCreateForm] = useState({
    title: '',
    businessId: '',
    violationType: 'Expired Verification',
    priority: 'High',
    district: 'Coimbatore',
    location: '',
    remarks: '',
    observations: '',
    initialActionDescription: '',
  });

  const [actionForm, setActionForm] = useState({
    actionType: 'Notice Issued',
    description: '',
    nextStatus: 'NOTICE_ISSUED',
  });

  const [evidenceForm, setEvidenceForm] = useState({
    evidenceType: 'INSPECTION_PHOTO',
    fileName: '',
    filePath: '',
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const res = await api.get('/enforcement', { params });
      setCases(res.data?.data?.cases || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch statutory enforcement cases.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinesses = async () => {
    try {
      const res = await api.get('/enforcement/businesses');
      setBusinesses(res.data?.data?.businesses || []);
    } catch (err) {
      console.error('Failed to fetch businesses:', err);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [statusFilter]);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const refreshSelectedCase = async (id) => {
    try {
      const res = await api.get(`/enforcement/${id}`);
      setSelectedCase(res.data?.data?.case || null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCase = async (e) => {
    e.preventDefault();
    if (!createForm.businessId || !createForm.title) {
      setError('Please select a business establishment and provide a case title.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await api.post('/enforcement', createForm);
      setSuccessMsg(res.data?.message || 'Enforcement case registered successfully.');
      setShowCreateModal(false);
      setCreateForm({
        title: '',
        businessId: '',
        violationType: 'Expired Verification',
        priority: 'High',
        district: 'Coimbatore',
        location: '',
        remarks: '',
        observations: '',
        initialActionDescription: '',
      });
      fetchCases();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create enforcement case.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddAction = async (e) => {
    e.preventDefault();
    if (!actionForm.description) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await api.post(`/enforcement/${selectedCase.id}/actions`, actionForm);
      setSuccessMsg(res.data?.message || 'Statutory action logged.');
      setShowActionModal(false);
      setActionForm({
        actionType: 'Notice Issued',
        description: '',
        nextStatus: 'NOTICE_ISSUED',
      });
      await refreshSelectedCase(selectedCase.id);
      fetchCases();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record enforcement action.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddEvidence = async (e) => {
    e.preventDefault();
    if (!evidenceForm.fileName || !evidenceForm.filePath) {
      setError('File name and photo/file URL are required.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await api.post(`/enforcement/${selectedCase.id}/evidence`, evidenceForm);
      setSuccessMsg(res.data?.message || 'Evidence record attached.');
      setShowEvidenceModal(false);
      setEvidenceForm({
        evidenceType: 'INSPECTION_PHOTO',
        fileName: '',
        filePath: '',
        notes: '',
      });
      await refreshSelectedCase(selectedCase.id);
      fetchCases();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload evidence.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedCase) return;
    try {
      await api.put(`/enforcement/${selectedCase.id}/status`, { status: newStatus });
      setSuccessMsg(`Status updated to ${newStatus}.`);
      await refreshSelectedCase(selectedCase.id);
      fetchCases();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update case status.');
    }
  };

  // KPIs
  const totalCount = cases.length;
  const activeCount = cases.filter((c) => ['OPEN', 'INSPECTION_REQUIRED', 'UNDER_REVIEW'].includes(c.status)).length;
  const noticeCount = cases.filter((c) => ['NOTICE_ISSUED', 'FOLLOW_UP'].includes(c.status)).length;
  const resolvedCount = cases.filter((c) => ['RESOLVED', 'CLOSED'].includes(c.status)).length;

  const filteredCases = cases.filter((c) => {
    if (violationFilter !== 'ALL' && c.violationType !== violationFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchNo = c.caseNumber?.toLowerCase().includes(q);
      const matchTitle = c.title?.toLowerCase().includes(q);
      const matchBiz = c.business?.businessName?.toLowerCase().includes(q);
      return matchNo || matchTitle || matchBiz;
    }
    return true;
  });

  return (
    <div className="page-container" style={{ padding: '2rem 1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Title & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '0.6rem', borderRadius: '10px' }}>
              <Gavel size={26} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                Legal Metrology Statutory Enforcement
              </h1>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                Enforcement under Legal Metrology Act, 2009 & Tamil Nadu Enforcement Rules
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: '#fff',
            border: 'none',
            padding: '0.75rem 1.25rem',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
          }}
        >
          <Plus size={18} />
          Register Enforcement Case
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#fca5a5', padding: '0.85rem 1.25rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{error}</span>
          <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer' }}><X size={16} /></button>
        </div>
      )}
      {successMsg && (
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', color: '#6ee7b7', padding: '0.85rem 1.25rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} style={{ background: 'none', border: 'none', color: '#6ee7b7', cursor: 'pointer' }}><X size={16} /></button>
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'var(--card-bg, #1e293b)', border: '1px solid var(--border-color, #334155)', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Inquiries</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.25rem' }}>{totalCount}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>Recorded under Act 2009</div>
        </div>

        <div style={{ background: 'var(--card-bg, #1e293b)', border: '1px solid #3b82f6', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Inquiry</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#60a5fa', marginTop: '0.25rem' }}>{activeCount}</div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>Inspection / Audit Required</div>
        </div>

        <div style={{ background: 'var(--card-bg, #1e293b)', border: '1px solid #f59e0b', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#fcd34d', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notices Served</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fbbf24', marginTop: '0.25rem' }}>{noticeCount}</div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>Show Cause / Summons Active</div>
        </div>

        <div style={{ background: 'var(--card-bg, #1e293b)', border: '1px solid #10b981', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#6ee7b7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resolved / Rectified</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#34d399', marginTop: '0.25rem' }}>{resolvedCount}</div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>Compounded or Closed</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ background: 'var(--card-bg, #1e293b)', border: '1px solid var(--border-color, #334155)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: '1 1 250px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            placeholder="Search by case #, establishment, violation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '0.65rem 1rem 0.65rem 2.4rem', color: '#f8fafc', fontSize: '0.9rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '0.65rem 1rem', color: '#f8fafc', fontSize: '0.9rem' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="INSPECTION_REQUIRED">Inspection Required</option>
            <option value="NOTICE_ISSUED">Notice Issued</option>
            <option value="FOLLOW_UP">Follow Up</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>

          <select
            value={violationFilter}
            onChange={(e) => setViolationFilter(e.target.value)}
            style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '0.65rem 1rem', color: '#f8fafc', fontSize: '0.9rem' }}
          >
            <option value="ALL">All Violation Types</option>
            <option value="Expired Verification">Expired Verification</option>
            <option value="Failed Verification">Failed Verification</option>
            <option value="Non-Compliant Instrument">Non-Compliant Instrument</option>
            <option value="Missing Certificate">Missing Certificate</option>
            <option value="Tampering/Irregularity">Tampering / Irregularity</option>
            <option value="Incorrect Display">Incorrect Display</option>
            <option value="Other">Other Infraction</option>
          </select>
        </div>
      </div>

      {/* Case List Table */}
      <div style={{ background: 'var(--card-bg, #1e293b)', border: '1px solid var(--border-color, #334155)', borderRadius: '12px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading enforcement cases...</div>
        ) : filteredCases.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            <ShieldAlert size={48} style={{ margin: '0 auto 1rem', opacity: 0.4, color: '#ef4444' }} />
            <p>No statutory enforcement cases found matching current filters.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#0f172a', borderBottom: '1px solid #334155', color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '1rem' }}>Case #</th>
                  <th style={{ padding: '1rem' }}>Establishment</th>
                  <th style={{ padding: '1rem' }}>Violation</th>
                  <th style={{ padding: '1rem' }}>Priority</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem' }}>Actions / Evidence</th>
                  <th style={{ padding: '1rem' }}>Detected Date</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCases.map((c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '1rem', fontFamily: 'monospace', fontWeight: 600, color: '#38bdf8' }}>
                      {c.caseNumber}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600, color: '#f8fafc' }}>
                        {c.business?.businessName || 'N/A'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {c.business?.district || c.district || 'Coimbatore'}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: '#fca5a5', fontWeight: 500 }}>
                      {c.violationType}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span
                        style={{
                          padding: '0.2rem 0.6rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background:
                            c.priority === 'Critical'
                              ? 'rgba(239, 68, 68, 0.2)'
                              : c.priority === 'High'
                              ? 'rgba(249, 115, 22, 0.2)'
                              : c.priority === 'Medium'
                              ? 'rgba(234, 179, 8, 0.2)'
                              : 'rgba(16, 185, 129, 0.2)',
                          color:
                            c.priority === 'Critical'
                              ? '#f87171'
                              : c.priority === 'High'
                              ? '#fb923c'
                              : c.priority === 'Medium'
                              ? '#facc15'
                              : '#34d399',
                        }}
                      >
                        {c.priority}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <StatusBadge status={c.status} />
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                      <div>{c.actions?.length || 0} Actions</div>
                      <div>{c.evidence?.length || 0} Evidence Files</div>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                      {new Date(c.detectedDate || c.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button
                        onClick={() => {
                          setSelectedCase(c);
                          setActiveTab('timeline');
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          background: 'rgba(56, 189, 248, 0.1)',
                          border: '1px solid #0284c7',
                          color: '#38bdf8',
                          padding: '0.4rem 0.8rem',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        <Eye size={14} />
                        View / Enforce
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Case Details Drawer / Modal */}
      {selectedCase && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '16px', width: '100%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', position: 'relative' }}>
            <button
              onClick={() => setSelectedCase(null)}
              style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div style={{ borderBottom: '1px solid #334155', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', fontFamily: 'monospace' }}>
                  {selectedCase.caseNumber}
                </span>
                <StatusBadge status={selectedCase.status} />
                <span style={{ background: 'rgba(239,68,68,0.2)', color: '#fca5a5', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                  {selectedCase.violationType}
                </span>
              </div>
              <h2 style={{ fontSize: '1.1rem', color: '#e2e8f0', margin: '0.5rem 0' }}>{selectedCase.title}</h2>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <span>Establishment: <strong style={{ color: '#f8fafc' }}>{selectedCase.business?.businessName}</strong></span>
                <span>District: <strong style={{ color: '#f8fafc' }}>{selectedCase.district || selectedCase.business?.district}</strong></span>
                <span>Date: <strong style={{ color: '#f8fafc' }}>{new Date(selectedCase.detectedDate || selectedCase.createdAt).toLocaleString()}</strong></span>
              </div>
            </div>

            {/* Observations / Remarks */}
            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
              <strong style={{ color: '#f8fafc', display: 'block', marginBottom: '0.35rem' }}>Field Observations & Statutory Grounds:</strong>
              <p style={{ margin: 0 }}>{selectedCase.observations || selectedCase.remarks || 'No detailed observations recorded at registration.'}</p>
            </div>

            {/* Quick Status Bar & Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', background: '#1e293b', padding: '0.75rem 1rem', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Lifecycle Stage:</span>
                <select
                  value={selectedCase.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', padding: '0.4rem 0.8rem', color: '#f8fafc', fontSize: '0.85rem', fontWeight: 600 }}
                >
                  <option value="OPEN">OPEN</option>
                  <option value="INSPECTION_REQUIRED">INSPECTION_REQUIRED</option>
                  <option value="NOTICE_ISSUED">NOTICE_ISSUED</option>
                  <option value="FOLLOW_UP">FOLLOW_UP</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => setShowActionModal(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#dc2626', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  <Gavel size={14} />
                  Record Action / Notice
                </button>
                <button
                  onClick={() => setShowEvidenceModal(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#0284c7', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  <Camera size={14} />
                  Attach Evidence
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #334155', marginBottom: '1.5rem', gap: '1rem' }}>
              <button
                onClick={() => setActiveTab('timeline')}
                style={{ background: 'none', border: 'none', padding: '0.75rem 0.5rem', borderBottom: activeTab === 'timeline' ? '2px solid #ef4444' : '2px solid transparent', color: activeTab === 'timeline' ? '#ef4444' : '#94a3b8', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <FileText size={16} />
                Action History ({selectedCase.actions?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('evidence')}
                style={{ background: 'none', border: 'none', padding: '0.75rem 0.5rem', borderBottom: activeTab === 'evidence' ? '2px solid #0284c7' : '2px solid transparent', color: activeTab === 'evidence' ? '#38bdf8' : '#94a3b8', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Camera size={16} />
                Photographic & Document Evidence ({selectedCase.evidence?.length || 0})
              </button>
            </div>

            {/* Tab Contents */}
            {activeTab === 'timeline' && (
              <div>
                {selectedCase.actions && selectedCase.actions.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {selectedCase.actions.map((act) => (
                      <div key={act.id} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '1rem', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.95rem' }}>{act.actionType}</span>
                            <span style={{ fontSize: '0.75rem', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                              {act.status}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {new Date(act.actionDate || act.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p style={{ margin: '0 0 0.5rem 0', color: '#cbd5e1', fontSize: '0.85rem' }}>{act.description}</p>
                        {act.officerName && (
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                            Executing Officer: <strong style={{ color: '#e2e8f0' }}>{act.officerName}</strong>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No recorded actions on this case yet.</div>
                )}
              </div>
            )}

            {activeTab === 'evidence' && (
              <div>
                {selectedCase.evidence && selectedCase.evidence.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                    {selectedCase.evidence.map((ev) => (
                      <div key={ev.id} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', overflow: 'hidden' }}>
                        <div style={{ height: '140px', background: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                          {ev.filePath?.startsWith('http') || ev.filePath?.startsWith('/uploads') ? (
                            <img src={ev.filePath} alt={ev.fileName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                          ) : (
                            <Camera size={36} style={{ color: '#475569' }} />
                          )}
                        </div>
                        <div style={{ padding: '0.75rem' }}>
                          <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 600 }}>
                            {ev.evidenceType}
                          </span>
                          <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.85rem', marginTop: '0.35rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {ev.fileName}
                          </div>
                          {ev.notes && <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>{ev.notes}</div>}
                          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.5rem' }}>
                            Uploaded: {new Date(ev.uploadedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                    No photographic or document evidence attached yet.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Register New Enforcement Case */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100, padding: '1rem' }}>
          <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '16px', width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', position: 'relative' }}>
            <button
              onClick={() => setShowCreateModal(false)}
              style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.25rem' }}>
              Register Statutory Enforcement Case
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
              Initiate an official Legal Metrology Act inspection or non-compliance inquiry.
            </p>

            <form onSubmit={handleCreateCase} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: 500 }}>
                  Target Establishment *
                </label>
                <select
                  required
                  value={createForm.businessId}
                  onChange={(e) => setCreateForm({ ...createForm, businessId: e.target.value })}
                  style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '0.65rem 1rem', color: '#f8fafc', fontSize: '0.9rem' }}
                >
                  <option value="">-- Select Business / Establishment --</option>
                  {businesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.businessName} ({b.district || 'Coimbatore'}) - {b.registrationNumber || 'Registered'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: 500 }}>
                  Case Title / Subject *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unverified Platform Scale in Commercial Operation"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '0.65rem 1rem', color: '#f8fafc', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: 500 }}>
                    Violation Type *
                  </label>
                  <select
                    value={createForm.violationType}
                    onChange={(e) => setCreateForm({ ...createForm, violationType: e.target.value })}
                    style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '0.65rem 1rem', color: '#f8fafc', fontSize: '0.9rem' }}
                  >
                    <option value="Expired Verification">Expired Verification</option>
                    <option value="Failed Verification">Failed Verification</option>
                    <option value="Non-Compliant Instrument">Non-Compliant Instrument</option>
                    <option value="Missing Certificate">Missing Certificate</option>
                    <option value="Tampering/Irregularity">Tampering / Irregularity</option>
                    <option value="Incorrect Display">Incorrect Display</option>
                    <option value="Other">Other Infraction</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: 500 }}>
                    Priority
                  </label>
                  <select
                    value={createForm.priority}
                    onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })}
                    style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '0.65rem 1rem', color: '#f8fafc', fontSize: '0.9rem' }}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: 500 }}>
                    District
                  </label>
                  <input
                    type="text"
                    value={createForm.district}
                    onChange={(e) => setCreateForm({ ...createForm, district: e.target.value })}
                    style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '0.65rem 1rem', color: '#f8fafc', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: 500 }}>
                    Specific Location / Premises
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Weighbridge Bay 2"
                    value={createForm.location}
                    onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                    style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '0.65rem 1rem', color: '#f8fafc', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: 500 }}>
                  Observations & Grounds
                </label>
                <textarea
                  rows={3}
                  placeholder="Details of the non-compliance observed during survey or complaint receipt..."
                  value={createForm.observations}
                  onChange={(e) => setCreateForm({ ...createForm, observations: e.target.value })}
                  style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '0.65rem 1rem', color: '#f8fafc', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: 500 }}>
                  Initial Enforcement Action Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Initial inquiry opened, inspection scheduled for field team"
                  value={createForm.initialActionDescription}
                  onChange={(e) => setCreateForm({ ...createForm, initialActionDescription: e.target.value })}
                  style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '0.65rem 1rem', color: '#f8fafc', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{ background: 'transparent', border: '1px solid #334155', color: '#cbd5e1', padding: '0.65rem 1.25rem', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: '#fff', border: 'none', padding: '0.65rem 1.5rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                >
                  {submitting ? 'Registering...' : 'Register Case'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Record Enforcement Action */}
      {showActionModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1200, padding: '1rem' }}>
          <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '16px', width: '100%', maxWidth: '500px', padding: '2rem', position: 'relative' }}>
            <button
              onClick={() => setShowActionModal(false)}
              style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>
              Record Statutory Action
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
              Add a statutory step to case {selectedCase?.caseNumber}.
            </p>

            <form onSubmit={handleAddAction} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: 500 }}>
                  Action Type *
                </label>
                <select
                  value={actionForm.actionType}
                  onChange={(e) => setActionForm({ ...actionForm, actionType: e.target.value })}
                  style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '0.65rem 1rem', color: '#f8fafc', fontSize: '0.9rem' }}
                >
                  <option value="Notice Issued">Show Cause Notice Issued</option>
                  <option value="Field Inspection Conducted">Field Inspection Conducted</option>
                  <option value="Instrument Seizure">Instrument Seizure / Tagged Out of Service</option>
                  <option value="Statutory Hearing">Statutory Hearing Conducted</option>
                  <option value="Compounding Fee Imposed">Compounding Fee Imposed</option>
                  <option value="Compliance Verified">Compliance Verified / Rectified</option>
                  <option value="Case Closed">Case Closed / Dismissed</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: 500 }}>
                  Advance Case Status To
                </label>
                <select
                  value={actionForm.nextStatus}
                  onChange={(e) => setActionForm({ ...actionForm, nextStatus: e.target.value })}
                  style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '0.65rem 1rem', color: '#f8fafc', fontSize: '0.9rem' }}
                >
                  <option value="INSPECTION_REQUIRED">INSPECTION_REQUIRED</option>
                  <option value="NOTICE_ISSUED">NOTICE_ISSUED</option>
                  <option value="FOLLOW_UP">FOLLOW_UP</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: 500 }}>
                  Action Description & Details *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Specify legal section, notice reference, or terms of resolution..."
                  value={actionForm.description}
                  onChange={(e) => setActionForm({ ...actionForm, description: e.target.value })}
                  style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '0.65rem 1rem', color: '#f8fafc', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowActionModal(false)}
                  style={{ background: 'transparent', border: '1px solid #334155', color: '#cbd5e1', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                >
                  {submitting ? 'Recording...' : 'Record Action'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Attach Evidence */}
      {showEvidenceModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1200, padding: '1rem' }}>
          <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '16px', width: '100%', maxWidth: '500px', padding: '2rem', position: 'relative' }}>
            <button
              onClick={() => setShowEvidenceModal(false)}
              style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>
              Attach Statutory Evidence
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
              Attach photographic or documentary proof to {selectedCase?.caseNumber}.
            </p>

            <form onSubmit={handleAddEvidence} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: 500 }}>
                  Evidence Type
                </label>
                <select
                  value={evidenceForm.evidenceType}
                  onChange={(e) => setEvidenceForm({ ...evidenceForm, evidenceType: e.target.value })}
                  style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '0.65rem 1rem', color: '#f8fafc', fontSize: '0.9rem' }}
                >
                  <option value="INSPECTION_PHOTO">Inspection Photo</option>
                  <option value="INSTRUMENT_PHOTO">Instrument Photo / Serial Plate</option>
                  <option value="SEAL_VERIFICATION">Broken or Tampered Seal</option>
                  <option value="DOCUMENT">Statutory Notice Copy / Seizure Memo</option>
                  <option value="OBSERVATION">Field Calibration Discrepancy Note</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: 500 }}>
                  Evidence Title / File Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. unverified_scale_front_display.jpg"
                  value={evidenceForm.fileName}
                  onChange={(e) => setEvidenceForm({ ...evidenceForm, fileName: e.target.value })}
                  style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '0.65rem 1rem', color: '#f8fafc', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: 500 }}>
                  Photo / Document URL or Path *
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://example.com/evidence1.jpg or /uploads/evidence1.jpg"
                  value={evidenceForm.filePath}
                  onChange={(e) => setEvidenceForm({ ...evidenceForm, filePath: e.target.value })}
                  style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '0.65rem 1rem', color: '#f8fafc', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: 500 }}>
                  Notes & Findings
                </label>
                <textarea
                  rows={2}
                  placeholder="Observations visible in photograph or memorandum..."
                  value={evidenceForm.notes}
                  onChange={(e) => setEvidenceForm({ ...evidenceForm, notes: e.target.value })}
                  style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '0.65rem 1rem', color: '#f8fafc', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowEvidenceModal(false)}
                  style={{ background: 'transparent', border: '1px solid #334155', color: '#cbd5e1', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                >
                  {submitting ? 'Attaching...' : 'Attach Evidence'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
