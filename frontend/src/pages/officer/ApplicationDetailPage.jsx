import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  FileText,
  Building,
  Scale,
  Calendar,
  UserCheck,
  ClipboardCheck,
  AlertCircle,
  CheckCircle,
  X,
  Clock,
  ArrowLeft,
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Assign Modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignData, setAssignData] = useState({
    officerId: '',
    scheduledDate: '',
    scheduledTime: '10:30 AM',
    location: '',
    instructions: 'Standard field test with 5kg, 10kg, 20kg standards. Verify zero repeatability.',
  });

  const navigate = useNavigate();

  const fetchDetails = async () => {
    try {
      const [appRes, offRes] = await Promise.allSettled([
        api.get(`/applications/${id}`),
        api.get('/admin/officers'),
      ]);

      if (appRes.status === 'fulfilled') {
        const app = appRes.value.data?.data?.application;
        setApplication(app);
        const officersList = offRes.status === 'fulfilled' ? offRes.value.data?.data?.officers || [] : [];
        setOfficers(officersList);

        if (app) {
          setAssignData((prev) => ({
            ...prev,
            officerId: app.assignment?.officerId || officersList?.[0]?.id || '',
            location: app.location,
            scheduledDate: app.preferredDate ? app.preferredDate.slice(0, 10) : new Date().toISOString().split('T')[0],
          }));
        }
      } else {
        setError('Failed to load application details.');
      }
    } catch (err) {
      setError('Failed to load application details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setAssignLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      await api.post('/assignments', {
        applicationId: id,
        ...assignData,
      });
      setShowAssignModal(false);
      setSuccessMsg('Officer assigned and inspection scheduled successfully!');
      fetchDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign officer.');
    } finally {
      setAssignLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-body" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <h3>Loading Application Details...</h3>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="page-body">
        <div className="card empty-state">
          <h3>Application Not Found</h3>
          <Link to="/officer/applications" className="btn btn-outline" style={{ marginTop: '1rem' }}>
            Back to Application Queue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-body" style={{ maxWidth: 1000 }}>
      {/* Back button & Title */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to="/officer/applications"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#06b6d4', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.75rem' }}
        >
          <ArrowLeft size={16} /> Back to Applications
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', color: '#ffffff' }}>
              Application {application.applicationNumber}
            </h1>
            <p style={{ color: 'var(--secondary-text)', fontSize: '0.9rem' }}>
              Submitted on {new Date(application.createdAt).toLocaleDateString()} • {application.applicationType}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <StatusBadge status={application.status} size="lg" />
            <button onClick={() => setShowAssignModal(true)} className="btn btn-navy">
              <Calendar size={16} /> Assign / Schedule
            </button>
            <Link to={`/officer/verification/${application.id}`} className="btn btn-primary">
              <ClipboardCheck size={16} /> Start Field Verification
            </Link>
          </div>
        </div>
      </div>

      {successMsg && (
        <div
          style={{
            padding: '0.85rem 1rem',
            background: 'rgba(34, 197, 94, 0.16)',
            color: '#4ade80',
            border: '1px solid rgba(34, 197, 94, 0.35)',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <CheckCircle size={18} /> {successMsg}
        </div>
      )}

      {error && (
        <div
          style={{
            padding: '0.85rem 1rem',
            background: 'rgba(239, 68, 68, 0.16)',
            color: '#f87171',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Grid: Business & Instrument Info */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Business Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#06b6d4', marginBottom: '1rem' }}>
            <Building size={20} />
            <h3 style={{ fontSize: '1.1rem', margin: 0, color: '#ffffff' }}>Business Establishment</h3>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
            {application.business?.businessName}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#cbd5e1', marginTop: '0.25rem' }}>
            <strong>Owner:</strong> {application.business?.ownerName}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.5rem', lineHeight: 1.6 }}>
            <div><strong style={{ color: '#cbd5e1' }}>Contact:</strong> {application.business?.mobile} | {application.business?.email}</div>
            <div><strong style={{ color: '#cbd5e1' }}>Address:</strong> {application.business?.address}</div>
            <div><strong style={{ color: '#cbd5e1' }}>District / City:</strong> {application.business?.city}, {application.business?.district} ({application.business?.state}) - {application.business?.pincode}</div>
            <div><strong style={{ color: '#cbd5e1' }}>Trade Type:</strong> {application.business?.businessType}</div>
          </div>
        </div>

        {/* Instrument Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#06b6d4', marginBottom: '1rem' }}>
            <Scale size={20} />
            <h3 style={{ fontSize: '1.1rem', margin: 0, color: '#ffffff' }}>Instrument To Verify</h3>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
            {application.instrument?.customId} — {application.instrument?.instrumentType?.name}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#cbd5e1', marginTop: '0.25rem' }}>
            <strong>Make / Model:</strong> {application.instrument?.manufacturer} {application.instrument?.model}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.5rem', lineHeight: 1.6 }}>
            <div><strong style={{ color: '#cbd5e1' }}>Serial Number:</strong> {application.instrument?.serialNumber}</div>
            <div><strong style={{ color: '#cbd5e1' }}>Capacity:</strong> {application.instrument?.capacity} {application.instrument?.capacityUnit} (Accuracy Class: {application.instrument?.accuracyClass})</div>
            <div><strong style={{ color: '#cbd5e1' }}>Premises Location:</strong> {application.location}</div>
            {application.remarks && <div><strong style={{ color: '#cbd5e1' }}>Remarks:</strong> {application.remarks}</div>}
          </div>
        </div>
      </div>

      {/* Assignment Status Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', color: '#ffffff', marginBottom: '0.75rem' }}>
          Inspection Schedule & Assignment
        </h3>

        {application.assignment ? (
          <div
            style={{
              background: 'var(--glass-subtle)',
              borderRadius: '12px',
              padding: '1.25rem',
              border: '1px solid var(--glass-border)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--secondary-text)' }}>Assigned Inspector</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
                {application.assignment.officer?.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)' }}>
                {application.assignment.officer?.officerCode} ({application.assignment.officer?.designation})
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--secondary-text)' }}>Scheduled Inspection Date</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#06b6d4' }}>
                {new Date(application.assignment.scheduledDate).toLocaleDateString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)' }}>
                Time: {application.assignment.scheduledTime || '10:30 AM'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--secondary-text)' }}>Instructions</div>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>
                {application.assignment.instructions || 'Standard verification tests'}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ background: 'rgba(245, 158, 11, 0.16)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.35)', color: '#fbbf24', fontSize: '0.9rem' }}>
            No inspection officer has been assigned yet. Click "Assign / Schedule" above to dispatch an inspector.
          </div>
        )}
      </div>

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Assign Inspection Officer</h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="btn btn-outline btn-sm"
                style={{ border: 'none' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Select Legal Metrology Officer *</label>
                  <select
                    className="form-select"
                    value={assignData.officerId}
                    onChange={(e) => setAssignData({ ...assignData, officerId: e.target.value })}
                    required
                  >
                    {officers.map((off) => (
                      <option key={off.id} value={off.id}>
                        {off.name} ({off.officerCode} — {off.district})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Verification Date *</label>
                    <input
                      type="date"
                      className="form-input"
                      value={assignData.scheduledDate}
                      onChange={(e) => setAssignData({ ...assignData, scheduledDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Verification Time</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 10:30 AM"
                      value={assignData.scheduledTime}
                      onChange={(e) => setAssignData({ ...assignData, scheduledTime: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Site Verification Location</label>
                  <input
                    type="text"
                    className="form-input"
                    value={assignData.location}
                    onChange={(e) => setAssignData({ ...assignData, location: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Inspection Instructions</label>
                  <textarea
                    className="form-textarea"
                    rows="2"
                    value={assignData.instructions}
                    onChange={(e) => setAssignData({ ...assignData, instructions: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={assignLoading}>
                  {assignLoading ? 'Saving...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
