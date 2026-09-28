import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  ShieldAlert,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Scale,
  MapPin,
  Send,
  Lock,
} from 'lucide-react';

export default function PublicReportConcernPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialCert = searchParams.get('cert') || '';

  const [formData, setFormData] = useState({
    reporterName: '',
    reporterEmail: '',
    reporterPhone: '',
    category: 'INCORRECT_MEASUREMENT',
    certificateNumber: initialCert,
    instrumentId: '',
    location: '',
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [successResult, setSuccessResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/complaints', formData);
      setSuccessResult(res.data?.data?.complaint);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '3rem 1.5rem 6rem' }}>
      <Link
        to="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          color: '#06b6d4',
          fontWeight: 600,
          fontSize: '0.85rem',
          marginBottom: '1.5rem',
        }}
      >
        <ArrowLeft size={16} /> Back to MESUREGX Home
      </Link>

      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            padding: '0.35rem 1rem',
            borderRadius: '999px',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '1rem',
          }}
        >
          <ShieldAlert size={16} /> Citizen & Consumer Metrology Vigilance
        </div>
        <h1 style={{ fontSize: '2rem', color: '#ffffff', marginBottom: '0.5rem' }}>
          Report a Measurement Concern
        </h1>
        <p style={{ color: 'var(--secondary-text)', fontSize: '0.95rem', maxWidth: 580, margin: '0 auto' }}>
          File an official report regarding scale inaccuracy, expired verification seals, or suspected tampering.
          Department of Legal Metrology assigns qualified field inspectors to investigate each concern.
        </p>
      </div>

      {successResult ? (
        <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(34, 197, 94, 0.15)',
              color: '#4ade80',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}
          >
            <CheckCircle size={36} />
          </div>
          <h2 style={{ fontSize: '1.5rem', color: '#ffffff', marginBottom: '0.5rem' }}>
            Report Successfully Registered
          </h2>
          <p style={{ color: 'var(--secondary-text)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Your grievance reference number is:
          </p>
          <div
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              background: 'rgba(6, 182, 212, 0.15)',
              border: '1px solid rgba(6, 182, 212, 0.35)',
              borderRadius: '8px',
              color: '#06b6d4',
              fontWeight: 800,
              fontSize: '1.25rem',
              letterSpacing: '0.05em',
              marginBottom: '2rem',
            }}
          >
            {successResult.complaintNumber}
          </div>

          <p style={{ color: '#cbd5e1', fontSize: '0.85rem', maxWidth: 480, margin: '0 auto 2rem', lineHeight: 1.6 }}>
            A Legal Metrology Officer will review the premises location ({successResult.location || 'Reported Location'}) and schedule a physical inspection.
            Save this reference number for follow-up.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <Link to="/" className="btn btn-outline">
              Return Home
            </Link>
            <Link to={`/verify/${successResult.certificateNumber || ''}`} className="btn btn-primary">
              Verify Digital Certificate
            </Link>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: '2rem' }}>
          {error && (
            <div
              style={{
                padding: '0.85rem 1rem',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.3)',
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Your Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. S. Meenakshi"
                  value={formData.reporterName}
                  onChange={(e) => setFormData({ ...formData, reporterName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  className="form-input"
                  required
                  placeholder="name@domain.com"
                  value={formData.reporterEmail}
                  onChange={(e) => setFormData({ ...formData, reporterEmail: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Contact Phone (Optional)</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+91 98421 XXXXX"
                  value={formData.reporterPhone}
                  onChange={(e) => setFormData({ ...formData, reporterPhone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nature of Metrology Issue *</label>
                <select
                  className="form-select"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="INCORRECT_MEASUREMENT">Inaccurate Weighing / Discrepancy</option>
                  <option value="EXPIRED_CERTIFICATE">Expired Seal / No Active Certificate</option>
                  <option value="SUSPECTED_TAMPERING">Suspected Lead Seal Tampering</option>
                  <option value="INSTRUMENT_ISSUE">Display Sensor Issue / Faulty Scale</option>
                  <option value="OTHER">Other Metrological Non-Compliance</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Certificate Number (if available)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. CERT-2026-000001"
                  value={formData.certificateNumber}
                  onChange={(e) => setFormData({ ...formData, certificateNumber: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Establishment / Instrument ID</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. WX-1001 or Shop Name"
                  value={formData.instrumentId}
                  onChange={(e) => setFormData({ ...formData, instrumentId: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">Shop / Premises Location *</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="Market address, landmark, district, or city where the scale is deployed"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Incident Description & Measurement Details *</label>
              <textarea
                className="form-textarea"
                required
                rows={4}
                placeholder="Detail what item was weighed, the observed discrepancy vs standard, or any refusal to provide verification seal details..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--secondary-text)', fontSize: '0.8rem' }}>
                <Lock size={14} /> Identity handled per Legal Metrology consumer privacy protocols
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{ minWidth: 180 }}>
                {loading ? 'Submitting Report...' : 'Submit Official Report'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
