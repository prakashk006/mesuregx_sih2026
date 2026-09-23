import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import {
  FlaskConical,
  Scale,
  Camera,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Upload,
  Trash2,
  ArrowLeft,
  Save,
  Send,
  Building2,
  Calendar,
  FileText,
  Sparkles,
  Award,
} from 'lucide-react';

export default function GatcTestWorkflowPage() {
  const { applicationId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [application, setApplication] = useState(null);
  const [verification, setVerification] = useState(null);
  const [evidenceList, setEvidenceList] = useState([]);

  // Measurement Entry Table
  const [measurements, setMeasurements] = useState([
    { reference: 0.0, observed: 0.0, testIndex: 1, remarks: 'Zero-load test' },
    { reference: 5.0, observed: 5.0, testIndex: 2, remarks: 'Quarter capacity' },
    { reference: 10.0, observed: 10.0, testIndex: 3, remarks: 'Half capacity' },
    { reference: 20.0, observed: 20.0, testIndex: 4, remarks: 'Three-quarter capacity' },
    { reference: 30.0, observed: 30.0, testIndex: 5, remarks: 'Full maximum capacity' },
  ]);

  const [evaluation, setEvaluation] = useState(null);
  const [notes, setNotes] = useState('');
  const [temperature, setTemperature] = useState('23.5');
  const [humidity, setHumidity] = useState('52');
  const [standardWeightsUsed, setStandardWeightsUsed] = useState('NTH-STD-M1-042 (Valid till 2027)');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [evidenceType, setEvidenceType] = useState('TEST_WEIGHT');

  useEffect(() => {
    fetchApplicationDetails();
  }, [applicationId]);

  const fetchApplicationDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/verifications/application/${applicationId}`);
      if (res.data?.success && res.data.data.verification) {
        const v = res.data.data.verification;
        setVerification(v);
        setApplication(v.application);
        setEvidenceList(v.evidence || []);
        if (v.notes) setNotes(v.notes);
        if (v.measurements && v.measurements.length > 0) {
          setMeasurements(
            v.measurements.map((m, idx) => ({
              reference: m.referenceValue,
              observed: m.observedValue,
              testIndex: m.testNumber || idx + 1,
              remarks: m.remarks || '',
            }))
          );
        }
      } else {
        // Fallback: fetch application directly
        const appRes = await api.get(`/applications/${applicationId}`);
        if (appRes.data?.success) {
          const app = appRes.data.data.application;
          setApplication(app);
          // Set sample default measurement steps based on instrument capacity
          const cap = app.instrument?.capacity || 30;
          setMeasurements([
            { reference: 0.0, observed: 0.0, testIndex: 1, remarks: 'Zero-load verification' },
            { reference: Number((cap * 0.25).toFixed(2)), observed: Number((cap * 0.25).toFixed(2)), testIndex: 2, remarks: '25% load' },
            { reference: Number((cap * 0.5).toFixed(2)), observed: Number((cap * 0.5).toFixed(2)), testIndex: 3, remarks: '50% load' },
            { reference: Number((cap * 0.75).toFixed(2)), observed: Number((cap * 0.75).toFixed(2)), testIndex: 4, remarks: '75% load' },
            { reference: Number(cap.toFixed(2)), observed: Number(cap.toFixed(2)), testIndex: 5, remarks: 'Max capacity' },
          ]);
        }
      }
    } catch (err) {
      console.error('Failed to load application:', err);
      setMessage({ text: 'Failed to load application data.', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const handleMeasurementChange = (index, field, value) => {
    const updated = [...measurements];
    updated[index][field] = field === 'remarks' ? value : parseFloat(value) || 0;
    setMeasurements(updated);
    setEvaluation(null); // Reset until re-evaluated
  };

  const addMeasurementRow = () => {
    setMeasurements([
      ...measurements,
      { reference: 0, observed: 0, testIndex: measurements.length + 1, remarks: '' },
    ]);
  };

  const removeMeasurementRow = (index) => {
    if (measurements.length <= 1) return;
    const updated = measurements.filter((_, i) => i !== index);
    setMeasurements(updated.map((m, idx) => ({ ...m, testIndex: idx + 1 })));
    setEvaluation(null);
  };

  const handleLiveEvaluate = async () => {
    if (!application?.instrument) return;
    try {
      const res = await api.post('/verifications/evaluate-live', {
        instrumentType: application.instrument.instrumentType?.code || 'WEIGHING_SCALE',
        capacity: application.instrument.capacity,
        unit: application.instrument.capacityUnit,
        accuracyClass: application.instrument.accuracyClass,
        measurements,
      });

      if (res.data?.success) {
        setEvaluation(res.data.data.evaluation);
        setMessage({ text: `OIML Evaluation complete: ${res.data.data.evaluation.overallResult}`, type: res.data.data.evaluation.overallResult === 'PASS' ? 'success' : 'danger' });
      }
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Evaluation failed.', type: 'danger' });
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('photo', file);
    formData.append('applicationId', application.id);
    formData.append('evidenceType', evidenceType);

    setUploadingPhoto(true);
    try {
      const res = await api.post('/verifications/evidence/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.success) {
        setEvidenceList([res.data.data.evidence, ...evidenceList]);
        setMessage({ text: 'Evidence photo uploaded successfully.', type: 'success' });
      }
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to upload photo.', type: 'danger' });
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const handleDeleteEvidence = async (evidenceId) => {
    try {
      await api.delete(`/verifications/evidence/${evidenceId}`);
      setEvidenceList(evidenceList.filter((e) => e.id !== evidenceId));
    } catch (err) {
      setMessage({ text: 'Failed to delete evidence.', type: 'danger' });
    }
  };

  const handleSubmitResult = async (isDraft = false) => {
    if (measurements.length === 0) {
      setMessage({ text: 'Please add at least one measurement record.', type: 'danger' });
      return;
    }

    setSubmitting(true);
    try {
      const formattedNotes = `Env: Temp ${temperature}°C, RH ${humidity}%. Standard Weights: ${standardWeightsUsed}. ${notes}`;

      const res = await api.post('/verifications/submit', {
        applicationId: application.id,
        measurements,
        notes: formattedNotes,
        isDraft,
      });

      if (res.data?.success) {
        if (isDraft) {
          setMessage({ text: 'Test draft saved successfully.', type: 'info' });
        } else {
          setMessage({ text: res.data.message || 'Test submitted successfully!', type: 'success' });
          setTimeout(() => {
            navigate('/gatc/applications');
          }, 1500);
        }
      }
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to submit test results.', type: 'danger' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--secondary-text)' }}>
        Loading laboratory test console...
      </div>
    );
  }

  if (!application) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h2>Application Not Found</h2>
        <Link to="/gatc/applications" className="btn btn-outline" style={{ marginTop: '1rem' }}>
          Back to Queue
        </Link>
      </div>
    );
  }

  const inst = application.instrument;
  const isCompleted = application.status === 'CERTIFICATE_ISSUED';

  return (
    <div style={{ padding: '1.5rem', maxWidth: 1300, margin: '0 auto' }}>
      {/* Top Breadcrumb & Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => navigate('/gatc/applications')}
            className="btn btn-outline btn-sm"
            style={{ padding: '0.4rem 0.6rem' }}
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#0F766E', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Government Approved Test Centre Console
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', margin: '0.1rem 0 0' }}>
              Laboratory Verification: {application.applicationNumber}
            </h1>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <StatusBadge status={application.status} size="lg" />
          {!isCompleted && (
            <>
              <button
                type="button"
                onClick={() => handleSubmitResult(true)}
                className="btn btn-outline btn-sm"
                disabled={submitting}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Save size={14} />
                <span>Save Draft</span>
              </button>
              <button
                type="button"
                onClick={() => handleSubmitResult(false)}
                className="btn btn-primary btn-sm"
                disabled={submitting}
                style={{ background: '#10B981', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Send size={14} />
                <span>Submit Final Result</span>
              </button>
            </>
          )}
        </div>
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
        }}>
          {message.text}
        </div>
      )}

      {/* Instrument & Business Summary Card */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.75rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)', textTransform: 'uppercase', fontWeight: 600 }}>
              Business Establishment
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff', marginTop: '0.25rem' }}>
              {application.business?.businessName}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              {application.business?.ownerName} • {application.business?.district}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)', textTransform: 'uppercase', fontWeight: 600 }}>
              Instrument Specification
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#38bdf8', marginTop: '0.25rem' }}>
              {inst?.model} ({inst?.customId})
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              S/N: {inst?.serialNumber} • Mfr: {inst?.manufacturer}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)', textTransform: 'uppercase', fontWeight: 600 }}>
              Metrological Parameters
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff', marginTop: '0.25rem' }}>
              Max: {inst?.capacity} {inst?.capacityUnit}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Accuracy Class: {inst?.accuracyClass} • Type: {inst?.instrumentType?.name}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)', textTransform: 'uppercase', fontWeight: 600 }}>
              Verification Rule Standard
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#10B981', marginTop: '0.25rem' }}>
              OIML R 76-1
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Non-Automatic Weighing Instruments
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Measurements & Observations */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.75rem', marginBottom: '2rem' }}>
        {/* Left Column: Measurement Entry Table */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Scale size={18} color="#0F766E" />
                <span>Standard Test Load Measurements</span>
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--secondary-text)', margin: '0.2rem 0 0' }}>
                Enter reference standard weights and indicated observed readings
              </p>
            </div>

            <button
              type="button"
              onClick={handleLiveEvaluate}
              className="btn btn-outline btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', borderColor: '#0ea5e9', color: '#38bdf8' }}
            >
              <Sparkles size={14} />
              <span>Evaluate OIML MPE</span>
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left', color: 'var(--secondary-text)' }}>
                  <th style={{ padding: '0.6rem 0.4rem', width: 40 }}>#</th>
                  <th style={{ padding: '0.6rem 0.4rem' }}>Reference ({inst?.capacityUnit || 'kg'})</th>
                  <th style={{ padding: '0.6rem 0.4rem' }}>Observed ({inst?.capacityUnit || 'kg'})</th>
                  <th style={{ padding: '0.6rem 0.4rem' }}>Error</th>
                  <th style={{ padding: '0.6rem 0.4rem' }}>Remarks / Test Type</th>
                  <th style={{ padding: '0.6rem 0.4rem', width: 50, textAlign: 'center' }}></th>
                </tr>
              </thead>
              <tbody>
                {measurements.map((m, idx) => {
                  const error = Number((m.observed - m.reference).toFixed(4));
                  const evalRow = evaluation?.tests?.[idx];

                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.6rem 0.4rem', color: 'var(--secondary-text)' }}>
                        {idx + 1}
                      </td>
                      <td style={{ padding: '0.6rem 0.4rem' }}>
                        <input
                          type="number"
                          step="any"
                          className="form-input"
                          value={m.reference}
                          onChange={(e) => handleMeasurementChange(idx, 'reference', e.target.value)}
                          disabled={isCompleted}
                          style={{ padding: '0.35rem 0.5rem', fontSize: '0.85rem', width: '100%' }}
                        />
                      </td>
                      <td style={{ padding: '0.6rem 0.4rem' }}>
                        <input
                          type="number"
                          step="any"
                          className="form-input"
                          value={m.observed}
                          onChange={(e) => handleMeasurementChange(idx, 'observed', e.target.value)}
                          disabled={isCompleted}
                          style={{ padding: '0.35rem 0.5rem', fontSize: '0.85rem', width: '100%' }}
                        />
                      </td>
                      <td style={{ padding: '0.6rem 0.4rem' }}>
                        <span style={{
                          fontWeight: 600,
                          color: error === 0 ? '#10B981' : Math.abs(error) <= 0.005 ? '#38bdf8' : '#f87171',
                        }}>
                          {error > 0 ? `+${error}` : error}
                        </span>
                        {evalRow && (
                          <span style={{
                            marginLeft: '0.4rem',
                            fontSize: '0.7rem',
                            padding: '0.15rem 0.35rem',
                            borderRadius: 4,
                            background: evalRow.result === 'PASS' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                            color: evalRow.result === 'PASS' ? '#34d399' : '#f87171',
                          }}>
                            {evalRow.result}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.6rem 0.4rem' }}>
                        <input
                          type="text"
                          className="form-input"
                          value={m.remarks}
                          onChange={(e) => handleMeasurementChange(idx, 'remarks', e.target.value)}
                          placeholder="e.g. Center, Corner load"
                          disabled={isCompleted}
                          style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem', width: '100%' }}
                        />
                      </td>
                      <td style={{ padding: '0.6rem 0.4rem', textAlign: 'center' }}>
                        {!isCompleted && measurements.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMeasurementRow(idx)}
                            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                            title="Remove test step"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {!isCompleted && (
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                onClick={addMeasurementRow}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.75rem' }}
              >
                + Add Test Step
              </button>

              {evaluation && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <span>Evaluation Result:</span>
                  <span style={{
                    fontWeight: 700,
                    color: evaluation.overallResult === 'PASS' ? '#10B981' : '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}>
                    {evaluation.overallResult === 'PASS' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                    {evaluation.overallResult}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Lab Environmental Conditions & Notes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FlaskConical size={16} color="#0F766E" />
              <span>Laboratory Conditions</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Temperature (°C)</label>
                <input
                  type="text"
                  className="form-input"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  disabled={isCompleted}
                  style={{ fontSize: '0.85rem' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Rel. Humidity (%)</label>
                <input
                  type="text"
                  className="form-input"
                  value={humidity}
                  onChange={(e) => setHumidity(e.target.value)}
                  disabled={isCompleted}
                  style={{ fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Standard Weights Certificate Reference</label>
              <input
                type="text"
                className="form-input"
                value={standardWeightsUsed}
                onChange={(e) => setStandardWeightsUsed(e.target.value)}
                disabled={isCompleted}
                style={{ fontSize: '0.85rem' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Technical Remarks & Observations</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Observation on repeatability, eccentricity, zero return..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isCompleted}
                style={{ fontSize: '0.85rem', width: '100%' }}
              />
            </div>
          </div>

          {/* Photo Evidence Panel */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Camera size={16} color="#0F766E" />
                <span>Test Evidence Photos</span>
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--secondary-text)' }}>
                {evidenceList.length} photo(s)
              </span>
            </div>

            {!isCompleted && (
              <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
                <select
                  className="form-input"
                  value={evidenceType}
                  onChange={(e) => setEvidenceType(e.target.value)}
                  style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem', flex: 1 }}
                >
                  <option value="TEST_WEIGHT">Standard Weight Loaded</option>
                  <option value="DISPLAY_READING">Scale Display Reading</option>
                  <option value="SERIAL_NUMBER">Serial Number Plate</option>
                  <option value="INSTRUMENT_FRONT">Instrument Overview</option>
                </select>

                <label
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  <Upload size={13} />
                  <span>{uploadingPhoto ? '...' : 'Upload'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={uploadingPhoto}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            )}

            {evidenceList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b', fontSize: '0.8rem' }}>
                No photos attached yet. Attach standard weight or display photo.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', maxHeight: 220, overflowY: 'auto' }}>
                {evidenceList.map((ev) => (
                  <div key={ev.id} style={{ position: 'relative', borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <img
                      src={`http://localhost:5000${ev.filePath}`}
                      alt={ev.evidenceType}
                      style={{ width: '100%', height: 75, objectFit: 'cover', display: 'block' }}
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'rgba(0,0,0,0.7)',
                      fontSize: '0.65rem',
                      padding: '0.2rem 0.4rem',
                      color: '#ffffff',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                    }}>
                      {ev.evidenceType}
                    </div>
                    {!isCompleted && (
                      <button
                        type="button"
                        onClick={() => handleDeleteEvidence(ev.id)}
                        style={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          background: 'rgba(0,0,0,0.6)',
                          border: 'none',
                          color: '#f87171',
                          borderRadius: '50%',
                          width: 20,
                          height: 20,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
