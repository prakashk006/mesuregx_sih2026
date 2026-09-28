import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';
import {
  FileCheck,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Scale,
  Building,
  CreditCard,
  X,
  ShieldCheck,
  DollarSign,
} from 'lucide-react';

export default function NewApplicationPage() {
  const [instruments, setInstruments] = useState([]);
  const [businessProfile, setBusinessProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Rule 16 Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI_DEMO'); // 'UPI_DEMO' | 'NETBANKING' | 'CARD' | 'TREASURY_CHALLAN'
  const [challanRef, setChallanRef] = useState('');

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

        const qInstId = searchParams.get('instrumentId');
        const qType = searchParams.get('applicationType') || searchParams.get('type');
        const qPrevCert = searchParams.get('prevCert');

        let initialInstId = '';
        if (qInstId) {
          const match = instList.find((i) => i.id === qInstId || i.customId === qInstId);
          if (match) initialInstId = match.id;
        }
        if (!initialInstId && instList.length > 0) {
          initialInstId = instList[0].id;
        }

        const defLocation = prof ? `${prof.address}, ${prof.city} - ${prof.pincode}` : '';

        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 3);
        const dateStr = defaultDate.toISOString().split('T')[0];

        setFormData((prev) => ({
          ...prev,
          instrumentId: initialInstId,
          applicationType: qType === 'REVERIFICATION' ? 'Periodic Verification' : (qType || prev.applicationType),
          location: defLocation,
          preferredDate: dateStr,
          remarks: qPrevCert ? `Re-verification application linked to previous certificate #${qPrevCert}` : prev.remarks,
        }));
      } catch (err) {
        setError('Failed to load application data.');
      } finally {
        setLoading(false);
      }
    }
    loadInitial();
  }, [searchParams]);

  const handleOpenPaymentCheckout = (e) => {
    e.preventDefault();
    if (!formData.instrumentId || !formData.location) {
      setError('Please select an instrument and specify the verification premises location.');
      return;
    }
    setError('');
    setShowPaymentModal(true);
  };

  const handleFinalSubmitWithPayment = async () => {
    setSubmitting(true);
    setError('');

    try {
      // 1. Submit Verification Application
      const appRes = await api.post('/applications', formData);
      const application = appRes.data?.data?.application;
      const appId = application?.id || application?.applicationNumber;

      // 2. Process Rule 16 Statutory Treasury Fee Payment
      await api.post('/payments/pay-demo', {
        applicationId: appId,
        amount: 350.0,
        paymentMethod: paymentMethod === 'TREASURY_CHALLAN' ? `CHALLAN:${challanRef || 'e-Treasury-TN'}` : paymentMethod,
        feeType: 'Rule 16 Verification Fee',
      });

      setShowPaymentModal(false);
      navigate(`/business/applications?submitted=${application?.applicationNumber || '1'}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application and process payment.');
      setShowPaymentModal(false);
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
          Submit inspection request and complete Rule 16 statutory fee deposit
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

          <form onSubmit={handleOpenPaymentCheckout}>
            {searchParams.get('prevCert') && (
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid #10b981',
                  borderRadius: '10px',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <CheckCircle size={24} style={{ color: '#10b981', flexShrink: 0 }} />
                <div>
                  <strong style={{ color: '#047857', display: 'block', fontSize: '0.95rem' }}>
                    Re-verification Lifecycle Renewal
                  </strong>
                  <span style={{ fontSize: '0.82rem', color: '#065f46' }}>
                    Pre-filled from previous certificate <strong>{searchParams.get('prevCert')}</strong>. Submitting this application will initiate statutory periodic re-verification.
                  </span>
                </div>
              </div>
            )}

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
              <button type="submit" className="btn btn-primary btn-lg">
                Proceed to Rule 16 Fee Payment <ArrowRight size={16} />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Rule 16 Treasury Payment Checkout Modal */}
      {showPaymentModal && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={20} style={{ color: '#06b6d4' }} />
                <h3 style={{ fontSize: '1.2rem', margin: 0, color: '#ffffff' }}>Rule 16 Treasury Fee Checkout</h3>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="btn btn-outline btn-sm"
                style={{ border: 'none' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: '1.25rem' }}>
              <div style={{ background: 'var(--glass-subtle)', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                  STATUTORY FEE ASSESSMENT (SCHEDULE IX)
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
                    {selectedInst?.customId} — {selectedInst?.manufacturer}
                  </span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#4ade80' }}>
                    ₹350.00
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                  Includes Legal Metrology Stamping & Digital Certificate Ledger Registration
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Select Payment Method *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI_DEMO')}
                    style={{
                      padding: '0.85rem',
                      borderRadius: '8px',
                      border: paymentMethod === 'UPI_DEMO' ? '2px solid #06b6d4' : '1px solid var(--glass-border)',
                      background: paymentMethod === 'UPI_DEMO' ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                      color: '#ffffff',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                    }}
                  >
                    ⚡ Instant UPI (Demo)
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CARD')}
                    style={{
                      padding: '0.85rem',
                      borderRadius: '8px',
                      border: paymentMethod === 'CARD' ? '2px solid #06b6d4' : '1px solid var(--glass-border)',
                      background: paymentMethod === 'CARD' ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                      color: '#ffffff',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                    }}
                  >
                    💳 NetBanking / Card
                  </button>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="btn btn-outline"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleFinalSubmitWithPayment}
                  className="btn btn-primary btn-lg"
                  disabled={submitting}
                >
                  {submitting ? 'Processing Payment...' : 'Pay ₹350.00 & Complete Submission'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
