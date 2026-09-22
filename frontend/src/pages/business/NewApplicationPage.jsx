import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { FileCheck, ArrowRight, AlertCircle, CheckCircle, Scale, Building } from 'lucide-react';

export default function NewApplicationPage() {
  const [instruments, setInstruments] = useState([]);
  const [businessProfile, setBusinessProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    instrumentId: '',
    applicationType: 'Periodic Verification',
    preferredDate: '',
    location: '',
    remarks: '',
  });

  useEffect(() => {
    async function loadInitial() {
      try {
        const [instRes, profRes] = await Promise.all([
          api.get('/instruments'),
          api.get('/business/profile'),
        ]);

        const instList = instRes.data?.data?.instruments || [];
        setInstruments(instList);

        const prof = profRes.data?.data?.business;
        setBusinessProfile(prof);

        // Preselect instrument from query params if given
        const qInstId = searchParams.get('instrumentId');
        let initialInstId = '';
        if (qInstId) {
          const match = instList.find((i) => i.id === qInstId || i.customId === qInstId);
          if (match) initialInstId = match.id;
        }
        if (!initialInstId && instList.length > 0) {
          initialInstId = instList[0].id;
        }

        // Pre-fill location from business address
        const defLocation = prof ? `${prof.address}, ${prof.city} - ${prof.pincode}` : '';

        // Default preferred date to 3 days from now
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 3);
        const dateStr = defaultDate.toISOString().split('T')[0];

        setFormData((prev) => ({
          ...prev,
          instrumentId: initialInstId,
          location: defLocation,
          preferredDate: dateStr,
        }));
      } catch (err) {
        setError('Failed to load application data.');
      } finally {
        setLoading(false);
      }
    }
    loadInitial();
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.instrumentId || !formData.location) {
      setError('Please select an instrument and specify the verification premises location.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await api.post('/applications', formData);
      const appNumber = res.data?.data?.application?.applicationNumber;
      navigate(`/business/applications?submitted=${appNumber || '1'}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-body" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <h3>Loading Application Form...</h3>
      </div>
    );
  }

  const selectedInst = instruments.find((i) => i.id === formData.instrumentId);

  return (
    <div className="page-body" style={{ maxWidth: 840 }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', color: '#0f172a' }}>
          Apply for Legal Metrology Verification
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Submit inspection request to schedule government verification for your measuring instruments
        </p>
      </div>

      {instruments.length === 0 ? (
        <div className="card empty-state">
          <Scale className="empty-icon" />
          <h3 style={{ fontSize: '1.2rem', color: '#0f172a' }}>No Registered Instruments</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem', marginBottom: '1.5rem' }}>
            You must first register a weighing machine, platform scale, or measuring device before applying for verification.
          </p>
          <Link to="/business/instruments" className="btn btn-primary">
            Register Instrument First
          </Link>
        </div>
      ) : (
        <div className="card">
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

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Select Instrument for Verification *</label>
              <select
                className="form-select"
                value={formData.instrumentId}
                onChange={(e) => setFormData({ ...formData, instrumentId: e.target.value })}
                required
              >
                {instruments.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.customId} — {i.instrumentType} ({i.manufacturer} {i.model} - {i.capacity} {i.capacityUnit})
                  </option>
                ))}
              </select>
            </div>

            {selectedInst && (
              <div
                style={{
                  background: 'var(--glass-subtle)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '10px',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                  fontSize: '0.85rem',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '0.75rem',
                }}
              >
                <div><strong>Make:</strong> {selectedInst.manufacturer} {selectedInst.model}</div>
                <div><strong>Serial:</strong> {selectedInst.serialNumber}</div>
                <div><strong>Capacity:</strong> {selectedInst.capacity} {selectedInst.capacityUnit}</div>
                <div><strong>Accuracy Class:</strong> Class {selectedInst.accuracyClass}</div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Application Type *</label>
                <select
                  className="form-select"
                  value={formData.applicationType}
                  onChange={(e) => setFormData({ ...formData, applicationType: e.target.value })}
                  required
                >
                  <option value="Initial Verification">Initial Verification (New Instrument)</option>
                  <option value="Periodic Verification">Periodic Verification (Annual Renewal)</option>
                  <option value="Re-verification">Re-verification</option>
                  <option value="Repair Verification">Repair Verification (Post Maintenance)</option>
                  <option value="Special Verification">Special Verification (On-Demand)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Preferred Verification Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.preferredDate}
                  onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Inspection Premises / Physical Location *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Full address where the instrument is installed and ready for testing"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Remarks / Special Instructions (Optional)</label>
              <textarea
                className="form-textarea"
                rows="3"
                placeholder="e.g. Standard 5kg, 10kg, 20kg reference weights needed; trade hours 9am - 8pm..."
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
              <Link to="/business/instruments" className="btn btn-outline">
                Cancel
              </Link>
              <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
                {submitting ? 'Submitting Application...' : 'Submit Verification Request'} <ArrowRight size={16} />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
