import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  ShieldAlert,
  Search,
  UserCheck,
  CheckCircle,
  Clock,
  X,
  MapPin,
  Filter,
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    status: '',
    officerId: '',
    officerNotes: '',
    resolutionSummary: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cmpRes, offRes] = await Promise.all([
        api.get('/complaints', {
          params: {
            status: statusFilter !== 'ALL' ? statusFilter : undefined,
            search: search || undefined,
          },
        }),
        api.get('/admin/officers'),
      ]);
      setComplaints(cmpRes.data?.data?.complaints || []);
      setOfficers(offRes.data?.data?.officers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData();
  };

  const openActionModal = (c) => {
    setSelectedComplaint(c);
    setFormData({
      status: c.status,
      officerId: c.officerId || (officers.length > 0 ? officers[0].id : ''),
      officerNotes: c.officerNotes || '',
      resolutionSummary: c.resolutionSummary || '',
    });
  };

  const handleActionSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put(`/complaints/${selectedComplaint.id}/status`, formData);
      alert('Grievance record updated successfully.');
      setSelectedComplaint(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update grievance.');
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
          <h1 style={{ fontSize: '1.75rem', color: '#ffffff' }}>Grievance & Enforcement Oversight</h1>
          <p style={{ color: 'var(--secondary-text)', fontSize: '0.9rem' }}>
            Statewide consumer reports, inspection officer dispatch, and calibration compliance tracking
          </p>
        </div>
      </div>

      {/* Filter / Search Bar */}
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
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="INVESTIGATION">Investigation</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <h3>Loading Grievances...</h3>
        </div>
      ) : complaints.length === 0 ? (
        <div className="card empty-state">
          <ShieldAlert className="empty-icon" />
          <h3 style={{ fontSize: '1.2rem', color: '#ffffff' }}>No active grievances</h3>
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
                <th>Assigned Inspector</th>
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
                    <div style={{ color: '#ffffff', fontWeight: 600 }}>{c.certificateNumber || c.instrumentId || 'General Report'}</div>
                  </td>
                  <td>
                    <div style={{ color: '#ffffff', fontWeight: 600 }}>{c.reporterName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)' }}>{c.reporterEmail}</div>
                  </td>
                  <td>
                    {c.assignedOfficer ? (
                      <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.85rem' }}>{c.assignedOfficer.name}</div>
                    ) : (
                      <span style={{ color: '#f87171', fontSize: '0.8rem', fontWeight: 600 }}>Unassigned</span>
                    )}
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
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Admin Grievance Management Modal */}
      {selectedComplaint && (
        <div className="modal-overlay" onClick={() => setSelectedComplaint(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 580 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', margin: 0, color: '#ffffff' }}>
                Manage Grievance {selectedComplaint.complaintNumber}
              </h3>
              <button onClick={() => setSelectedComplaint(null)} className="btn btn-outline btn-sm" style={{ border: 'none' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleActionSubmit}>
              <div className="modal-body" style={{ padding: '1.25rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.8rem', color: '#06b6d4', textTransform: 'uppercase', fontWeight: 700 }}>
                    {selectedComplaint.category.replace(/_/g, ' ')}
                  </div>
                  <div style={{ color: '#ffffff', fontSize: '0.95rem', margin: '0.35rem 0' }}>
                    "{selectedComplaint.description}"
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--secondary-text)' }}>
                    Reporter: {selectedComplaint.reporterName} ({selectedComplaint.reporterEmail}) | Location: {selectedComplaint.location || 'N/A'}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Assign Legal Metrology Officer</label>
                  <select
                    className="form-select"
                    value={formData.officerId}
                    onChange={(e) => setFormData({ ...formData, officerId: e.target.value })}
                  >
                    <option value="">-- No Officer Assigned --</option>
                    {officers.map((off) => (
                      <option key={off.id} value={off.id}>
                        {off.name} ({off.officerCode} - {off.district})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Grievance Status *</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="SUBMITTED">Submitted</option>
                    <option value="UNDER_REVIEW">Under Review</option>
                    <option value="ASSIGNED">Assigned to Officer</option>
                    <option value="INVESTIGATION">Investigation in Progress</option>
                    <option value="RESOLVED">Resolved (Action Taken)</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Investigation Notes</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    value={formData.officerNotes}
                    onChange={(e) => setFormData({ ...formData, officerNotes: e.target.value })}
                    placeholder="Log field inspection observations or officer comments..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Resolution Summary</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    value={formData.resolutionSummary}
                    onChange={(e) => setFormData({ ...formData, resolutionSummary: e.target.value })}
                    placeholder="Record final resolution provided to the reporter / business..."
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setSelectedComplaint(null)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Updating...' : 'Save Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
