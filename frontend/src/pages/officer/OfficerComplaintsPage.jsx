import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  ShieldAlert,
  Search,
  CheckCircle,
  Clock,
  UserCheck,
  FileText,
  X,
  MapPin,
  Send,
  AlertTriangle,
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';

export default function OfficerComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [updateData, setUpdateData] = useState({
    status: 'INVESTIGATION',
    officerNotes: '',
    resolutionSummary: '',
  });

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await api.get('/complaints', {
        params: {
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          search: search || undefined,
        },
      });
      setComplaints(res.data?.data?.complaints || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchComplaints();
  };

  const openActionModal = (c) => {
    setSelectedComplaint(c);
    setUpdateData({
      status: c.status === 'SUBMITTED' ? 'INVESTIGATION' : c.status,
      officerNotes: c.officerNotes || '',
      resolutionSummary: c.resolutionSummary || '',
    });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put(`/complaints/${selectedComplaint.id}/status`, updateData);
      alert('Grievance investigation record updated successfully.');
      setSelectedComplaint(null);
      fetchComplaints();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update grievance record.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-body">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', color: '#ffffff' }}>Metrology Grievances & Inquiries</h1>
          <p style={{ color: 'var(--secondary-text)', fontSize: '0.9rem' }}>
            Investigate public and consumer complaints, verify on-site scale discrepancies, and enforce compliance
          </p>
        </div>
      </div>

      {/* Filter / Search */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <form onSubmit={handleSearch} style={{ flex: 1, minWidth: 260, position: 'relative' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by Complaint #, Reporter, Certificate #, or Keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
          <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
        </form>

        <select
          className="form-select"
          style={{ width: 180 }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="INVESTIGATION">Investigation</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <h3>Loading Inquiries...</h3>
        </div>
      ) : complaints.length === 0 ? (
        <div className="card empty-state">
          <CheckCircle className="empty-icon" />
          <h3 style={{ fontSize: '1.2rem', color: '#ffffff' }}>No grievances requiring action</h3>
          <p style={{ color: 'var(--secondary-text)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            All reported consumer and commercial concerns are currently reconciled.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Complaint #</th>
                <th>Category</th>
                <th>Target Reference</th>
                <th>Reporter Info</th>
                <th>Location</th>
                <th>Date Filed</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong style={{ color: '#06b6d4' }}>{c.complaintNumber}</strong>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', color: '#ffffff' }}>
                      {c.category.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td>
                    <div style={{ color: '#ffffff', fontWeight: 600 }}>
                      {c.certificateNumber || c.instrumentId || 'General Report'}
                    </div>
                  </td>
                  <td>
                    <div style={{ color: '#ffffff', fontWeight: 600 }}>{c.reporterName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)' }}>{c.reporterEmail}</div>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--secondary-text)' }}>
                    {c.location || 'Not Specified'}
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--secondary-text)' }}>
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <StatusBadge status={c.status} />
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => openActionModal(c)}
                      className="btn btn-outline btn-sm"
                    >
                      Investigate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Investigation Action Modal */}
      {selectedComplaint && (
        <div className="modal-overlay" onClick={() => setSelectedComplaint(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 580 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', margin: 0, color: '#ffffff' }}>
                Investigate Grievance {selectedComplaint.complaintNumber}
              </h3>
              <button onClick={() => setSelectedComplaint(null)} className="btn btn-outline btn-sm" style={{ border: 'none' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit}>
              <div className="modal-body" style={{ padding: '1.25rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.8rem', color: '#06b6d4', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.25rem' }}>
                    Reported Allegation ({selectedComplaint.category.replace(/_/g, ' ')})
                  </div>
                  <div style={{ color: '#ffffff', fontSize: '0.95rem', lineHeight: 1.5 }}>
                    "{selectedComplaint.description}"
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--secondary-text)', marginTop: '0.5rem' }}>
                    Premises: <strong>{selectedComplaint.location || 'N/A'}</strong> | Target: <strong>{selectedComplaint.certificateNumber || selectedComplaint.instrumentId || 'N/A'}</strong>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Investigation Status *</label>
                  <select
                    className="form-select"
                    value={updateData.status}
                    onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                  >
                    <option value="UNDER_REVIEW">Under Review</option>
                    <option value="INVESTIGATION">Field Inspection / Investigation Dispatched</option>
                    <option value="RESOLVED">Resolved (Verification Enforced / Rectified)</option>
                    <option value="REJECTED">Rejected (Unsubstantiated / Inaccurate Claim)</option>
                    <option value="CLOSED">Closed Official Record</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Officer Field Inspection Findings</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Log test weights verified on-site, zero-shift error results, lead seal status..."
                    value={updateData.officerNotes}
                    onChange={(e) => setUpdateData({ ...updateData, officerNotes: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Official Resolution Summary</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Summary of enforcement action taken (e.g. scale re-calibrated and re-stamped, penalty issued, or complaint resolved)..."
                    value={updateData.resolutionSummary}
                    onChange={(e) => setUpdateData({ ...updateData, resolutionSummary: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setSelectedComplaint(null)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Saving...' : 'Save Findings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
