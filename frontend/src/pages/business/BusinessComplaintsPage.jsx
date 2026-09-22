import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  AlertTriangle,
  Plus,
  Search,
  CheckCircle,
  Clock,
  ShieldAlert,
  FileText,
  X,
  ChevronRight,
  MessageSquare,
  MapPin,
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';

export default function BusinessComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const [formData, setFormData] = useState({
    reporterName: '',
    reporterEmail: '',
    reporterPhone: '',
    category: 'INCORRECT_MEASUREMENT',
    certificateNumber: '',
    instrumentId: '',
    description: '',
    location: '',
  });

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await api.get('/complaints', {
        params: { search: search || undefined },
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
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/complaints', formData);
      setShowModal(false);
      setFormData({
        reporterName: '',
        reporterEmail: '',
        reporterPhone: '',
        category: 'INCORRECT_MEASUREMENT',
        certificateNumber: '',
        instrumentId: '',
        description: '',
        location: '',
      });
      alert('Grievance filed successfully. Reference number generated.');
      fetchComplaints();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to file grievance.');
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
          <h1 style={{ fontSize: '1.75rem', color: '#ffffff' }}>Grievances & Complaints</h1>
          <p style={{ color: 'var(--secondary-text)', fontSize: '0.9rem' }}>
            Report measurement discrepancies, suspected tampering, or calibration anomalies to Legal Metrology authorities
          </p>
        </div>

        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={16} /> File New Grievance
        </button>
      </div>

      {/* Complaints Table */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <h3>Loading Grievances...</h3>
        </div>
      ) : complaints.length === 0 ? (
        <div className="card empty-state">
          <ShieldAlert className="empty-icon" />
          <h3 style={{ fontSize: '1.2rem', color: '#ffffff' }}>No grievances recorded</h3>
          <p style={{ color: 'var(--secondary-text)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            You haven't filed any complaints. Click "File New Grievance" above if you encounter any weighing scale issues.
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
                <th>Description</th>
                <th>Assigned Officer</th>
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
                  <td style={{ fontSize: '0.85rem', color: 'var(--secondary-text)', maxWidth: 260 }}>
                    {c.description.length > 60 ? c.description.slice(0, 60) + '...' : c.description}
                  </td>
                  <td>
                    {c.assignedOfficer ? (
                      <span style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.85rem' }}>{c.assignedOfficer.name}</span>
                    ) : (
                      <span style={{ color: 'var(--secondary-text)', fontSize: '0.8rem' }}>Pending Assignment</span>
                    )}
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
                      onClick={() => setSelectedComplaint(c)}
                      className="btn btn-outline btn-sm"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Grievance Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', margin: 0, color: '#ffffff' }}>File Metrology Grievance</h3>
              <button onClick={() => setShowModal(false)} className="btn btn-outline btn-sm" style={{ border: 'none' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Reporter Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.reporterName}
                    onChange={(e) => setFormData({ ...formData, reporterName: e.target.value })}
                    required
                    placeholder="Full Name"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input
                      type="email"
                      className="form-input"
                      value={formData.reporterEmail}
                      onChange={(e) => setFormData({ ...formData, reporterEmail: e.target.value })}
                      required
                      placeholder="reporter@example.com"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={formData.reporterPhone}
                      onChange={(e) => setFormData({ ...formData, reporterPhone: e.target.value })}
                      placeholder="+91 98421 XXXXX"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Grievance Category *</label>
                  <select
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="INCORRECT_MEASUREMENT">Incorrect Measurement / Weight Drift</option>
                    <option value="EXPIRED_CERTIFICATE">Expired Certificate in Active Use</option>
                    <option value="SUSPECTED_TAMPERING">Suspected Calibration Seal Tampering</option>
                    <option value="INSTRUMENT_ISSUE">Instrument Display / Sensor Malfunction</option>
                    <option value="OTHER">Other Metrological Concern</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Certificate No (if known)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.certificateNumber}
                      onChange={(e) => setFormData({ ...formData, certificateNumber: e.target.value })}
                      placeholder="e.g. CERT-2026-000001"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Instrument ID (if known)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.instrumentId}
                      onChange={(e) => setFormData({ ...formData, instrumentId: e.target.value })}
                      placeholder="e.g. WX-1001"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Location / Premises</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Shop address or inspection site"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Specific Details / Description *</label>
                  <textarea
                    className="form-textarea"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    placeholder="Describe the discrepancy observed, standard test weights used, or operational circumstances..."
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Submitting Grievance...' : 'Submit Grievance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {selectedComplaint && (
        <div className="modal-overlay" onClick={() => setSelectedComplaint(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', margin: 0, color: '#ffffff' }}>
                Grievance {selectedComplaint.complaintNumber}
              </h3>
              <button onClick={() => setSelectedComplaint(null)} className="btn btn-outline btn-sm" style={{ border: 'none' }}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#06b6d4', fontWeight: 700 }}>
                  {selectedComplaint.category.replace(/_/g, ' ')}
                </span>
                <StatusBadge status={selectedComplaint.status} />
              </div>

              <p style={{ fontSize: '0.95rem', color: '#ffffff', lineHeight: 1.6, background: 'rgba(255,255,255,0.04)', padding: '1rem', borderRadius: '8px' }}>
                "{selectedComplaint.description}"
              </p>

              <div style={{ marginTop: '1rem', fontSize: '0.85rem', lineHeight: 1.8 }}>
                <div><strong style={{ color: 'var(--secondary-text)' }}>Reporter:</strong> <span style={{ color: '#ffffff' }}>{selectedComplaint.reporterName} ({selectedComplaint.reporterEmail})</span></div>
                {selectedComplaint.certificateNumber && (
                  <div><strong style={{ color: 'var(--secondary-text)' }}>Referenced Certificate:</strong> <span style={{ color: '#06b6d4' }}>{selectedComplaint.certificateNumber}</span></div>
                )}
                {selectedComplaint.location && (
                  <div><strong style={{ color: 'var(--secondary-text)' }}>Location:</strong> <span style={{ color: '#ffffff' }}>{selectedComplaint.location}</span></div>
                )}
                <div><strong style={{ color: 'var(--secondary-text)' }}>Assigned Officer:</strong> <span style={{ color: '#ffffff' }}>{selectedComplaint.assignedOfficer?.name || 'Under Department Dispatch'}</span></div>
                {selectedComplaint.officerNotes && (
                  <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '8px' }}>
                    <div style={{ fontWeight: 700, color: '#06b6d4' }}>Inspector Notes</div>
                    <div style={{ color: '#ffffff' }}>{selectedComplaint.officerNotes}</div>
                  </div>
                )}
                {selectedComplaint.resolutionSummary && (
                  <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '8px' }}>
                    <div style={{ fontWeight: 700, color: '#4ade80' }}>Resolution Summary</div>
                    <div style={{ color: '#ffffff' }}>{selectedComplaint.resolutionSummary}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedComplaint(null)} className="btn btn-primary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
