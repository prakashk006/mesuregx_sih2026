import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Scale,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Camera,
  MapPin,
  Save,
  Send,
  Plus,
  Trash2,
  RefreshCw,
  Award,
  ArrowLeft,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import DigitalCertificateModal from '../../components/DigitalCertificateModal';

export default function FieldVerificationPage() {
  const { id: routeAppId } = useParams();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [selectedAppId, setSelectedAppId] = useState(routeAppId || '');
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  // Measurements State
  const [measurements, setMeasurements] = useState([
    { reference: 5, observed: 5.01 },
    { reference: 10, observed: 9.99 },
    { reference: 20, observed: 20.01 },
  ]);

  // Rule Evaluation State
  const [evaluation, setEvaluation] = useState(null);
  const [evaluating, setEvaluating] = useState(false);

  // Geolocation State
  const [locationData, setLocationData] = useState({
    latitude: null,
    longitude: null,
    accuracy: null,
    timestamp: null,
    address: '',
  });
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');

  // Evidence Photos State
  const [evidenceList, setEvidenceList] = useState([]);
  const [evidenceType, setEvidenceType] = useState('INSTRUMENT_FRONT');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Draft / Offline Status
  const [isOfflineDraft, setIsOfflineDraft] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [decisionAction, setDecisionAction] = useState(null); // 'APPROVE', 'REJECT', 'RETEST'
  const [rejectionReason, setRejectionReason] = useState('');
  const [retestDate, setRetestDate] = useState('');
  const [notes, setNotes] = useState('All scale intervals verified. Calibration switch lead-sealed.');

  // Result Certificate Modal
  const [issuedCert, setIssuedCert] = useState(null);
  const [showCertModal, setShowCertModal] = useState(false);

  // Sync route param when URL changes
  useEffect(() => {
    if (routeAppId) {
      setSelectedAppId(routeAppId);
    }
  }, [routeAppId]);

  // Load applications list
  useEffect(() => {
    async function loadApps() {
      try {
        const res = await api.get('/applications');
        const apps = res.data?.data?.applications || [];
        setApplications(apps);
        if (apps.length > 0) {
          if (routeAppId && apps.some((a) => a.id === routeAppId)) {
            setSelectedAppId(routeAppId);
          } else if (!selectedAppId) {
            const preferred =
              apps.find((a) => a.status === 'ASSIGNED' || a.status === 'FIELD_VERIFICATION' || a.status === 'SUBMITTED') ||
              apps[0];
            setSelectedAppId(preferred.id);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadApps();
  }, []);

  // Load specific application details and verification data
  useEffect(() => {
    async function loadAppDetails() {
      if (!selectedAppId) return;
      try {
        const [appRes, verifRes] = await Promise.allSettled([
          api.get(`/applications/${selectedAppId}`),
          api.get(`/verifications/application/${selectedAppId}`),
        ]);

        const app = appRes.status === 'fulfilled' ? appRes.value?.data?.data?.application : null;
        if (app) {
          setApplication(app);
          setApplications((prev) => (prev.some((a) => a.id === app.id) ? prev : [app, ...prev]));
        }

        const verif = verifRes.status === 'fulfilled' ? verifRes.value?.data?.data?.verification : null;
        if (verif) {
          if (verif.measurements && verif.measurements.length > 0) {
            setMeasurements(
              verif.measurements.map((m) => ({
                reference: m.referenceValue,
                observed: m.observedValue,
              }))
            );
          }
          if (verif.latitude && verif.longitude) {
            setLocationData({
              latitude: verif.latitude,
              longitude: verif.longitude,
              accuracy: verif.locationAccuracy,
              timestamp: verif.verificationDate,
              address: verif.locationAddress || app?.location || '',
            });
          } else {
            setLocationData((prev) => ({ ...prev, address: app?.location || '' }));
          }
          if (verif.evidence) {
            setEvidenceList(verif.evidence);
          }
          if (verif.notes) {
            setNotes(verif.notes);
          }
        } else {
          // Restore local draft if exists
          const localDraft = localStorage.getItem(`mesuregx_draft_${selectedAppId}`);
          if (localDraft) {
            try {
              const parsed = JSON.parse(localDraft);
              if (parsed.measurements) setMeasurements(parsed.measurements);
              if (parsed.locationData) setLocationData(parsed.locationData);
              if (parsed.notes) setNotes(parsed.notes);
              setIsOfflineDraft(true);
            } catch (e) {
              // ignore
            }
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadAppDetails();
  }, [selectedAppId]);

  // Handle Measurement input changes
  const updateMeasurement = (index, field, value) => {
    const updated = [...measurements];
    updated[index][field] = parseFloat(value) || 0;
    setMeasurements(updated);
    setEvaluation(null); // reset evaluation when inputs change
    saveLocalDraft(updated, locationData, notes);
  };

  const addMeasurementRow = () => {
    const updated = [...measurements, { reference: 10, observed: 10.0 }];
    setMeasurements(updated);
    saveLocalDraft(updated, locationData, notes);
  };

  const removeMeasurementRow = (index) => {
    if (measurements.length <= 1) return;
    const updated = measurements.filter((_, i) => i !== index);
    setMeasurements(updated);
    setEvaluation(null);
    saveLocalDraft(updated, locationData, notes);
  };

  // Quick Demo Presets
  const loadPassPreset = () => {
    const passTests = [
      { reference: 5, observed: 5.01 },
      { reference: 10, observed: 9.99 },
      { reference: 20, observed: 20.01 },
    ];
    setMeasurements(passTests);
    setEvaluation(null);
    saveLocalDraft(passTests, locationData, notes);
  };

  const loadFailPreset = () => {
    const failTests = [
      { reference: 5, observed: 5.01 },
      { reference: 10, observed: 10.45 }, // Exceeds tolerance!
      { reference: 20, observed: 20.8 },  // Exceeds tolerance!
    ];
    setMeasurements(failTests);
    setEvaluation(null);
    saveLocalDraft(failTests, locationData, notes);
  };

  // Run FastAPI Verification Rule Engine
  const runVerificationRuleEngine = async () => {
    if (!application) return;
    setEvaluating(true);

    try {
      const res = await api.post('/verifications/evaluate-live', {
        instrumentType: application.instrument?.instrumentType?.code || 'WEIGHING_SCALE',
        capacity: application.instrument?.capacity || 30,
        unit: application.instrument?.capacityUnit || 'kg',
        accuracyClass: application.instrument?.accuracyClass || 'III',
        measurements,
      });

      setEvaluation(res.data?.data?.evaluation);
    } catch (err) {
      alert(err.response?.data?.message || 'Verification evaluation failed.');
    } finally {
      setEvaluating(false);
    }
  };

  // Save Local Draft
  const saveLocalDraft = (curMeasurements, curLocation, curNotes) => {
    if (!selectedAppId) return;
    localStorage.setItem(
      `mesuregx_draft_${selectedAppId}`,
      JSON.stringify({
        measurements: curMeasurements,
        locationData: curLocation,
        notes: curNotes,
        savedAt: new Date().toISOString(),
      })
    );
    setIsOfflineDraft(true);
  };

  // Geolocation Capture
  const captureLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setGeoLoading(true);
    setGeoError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLoc = {
          latitude: parseFloat(position.coords.latitude.toFixed(6)),
          longitude: parseFloat(position.coords.longitude.toFixed(6)),
          accuracy: parseFloat(position.coords.accuracy.toFixed(1)),
          timestamp: new Date().toISOString(),
          address: locationData.address || application?.location || 'Captured via GPS Sensor',
        };
        setLocationData(newLoc);
        setGeoLoading(false);
        saveLocalDraft(measurements, newLoc, notes);
      },
      (err) => {
        setGeoLoading(false);
        setGeoError('Location permission unavailable. You can enter location manually.');
        // Set sample fallback GPS coordinates for demo if permission blocked
        const fallbackLoc = {
          latitude: 11.016844,
          longitude: 76.955832,
          accuracy: 12.0,
          timestamp: new Date().toISOString(),
          address: application?.location || 'Coimbatore Legal Metrology Testing Zone',
        };
        setLocationData(fallbackLoc);
        saveLocalDraft(measurements, fallbackLoc, notes);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Photo Upload via Multer
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedAppId) return;

    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('applicationId', application?.id || selectedAppId);
    formData.append('evidenceType', evidenceType);

    try {
      const res = await api.post('/verifications/evidence/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setEvidenceList((prev) => [res.data?.data?.evidence, ...prev]);
    } catch (err) {
      alert(err.response?.data?.message || 'Photo upload failed.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const deleteEvidencePhoto = async (evidenceId) => {
    try {
      await api.delete(`/verifications/evidence/${evidenceId}`);
      setEvidenceList((prev) => prev.filter((item) => item.id !== evidenceId));
    } catch (err) {
      alert('Failed to delete photo.');
    }
  };

  // Submit Field Verification to Backend
  const submitFieldVerification = async (isDraft = false) => {
    if (!evaluation && !isDraft) {
      alert('Please click "Run Verification" to evaluate standard errors before final submission.');
      return;
    }

    setSubmitting(true);
    const appIdToUse = application?.id || selectedAppId;
    try {
      const res = await api.post('/verifications/submit', {
        applicationId: appIdToUse,
        measurements,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        locationAccuracy: locationData.accuracy,
        locationAddress: locationData.address,
        notes,
        isDraft,
      });

      // Clear draft
      localStorage.removeItem(`mesuregx_draft_${selectedAppId}`);
      setIsOfflineDraft(false);

      if (isDraft) {
        alert('Verification draft saved successfully.');
      } else {
        alert('Field verification submitted successfully. Proceed with officer approval/decision.');
        // Refresh application status
        const appRes = await api.get(`/applications/${appIdToUse}`);
        setApplication(appRes.data?.data?.application);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // Officer Decision (Approve / Reject / Request Retest)
  const handleDecisionSubmit = async (decision) => {
    if (decision === 'REJECT' && !rejectionReason.trim()) {
      alert('Rejection reason is mandatory when rejecting an instrument verification.');
      return;
    }

    setSubmitting(true);
    const appIdToUse = application?.id || selectedAppId;
    try {
      const res = await api.post(`/verifications/decision/${appIdToUse}`, {
        decision,
        rejectionReason,
        retestDate,
        notes,
      });

      if (decision === 'APPROVE') {
        const cert = res.data?.data?.certificate;
        setIssuedCert(cert);
        setShowCertModal(true);
      } else {
        alert(res.data?.message || 'Decision recorded successfully.');
      }

      // Refresh application details
      const appRes = await api.get(`/applications/${appIdToUse}`);
      setApplication(appRes.data?.data?.application);
      setDecisionAction(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record decision.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-body" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <h3>Loading Field Verification Engine...</h3>
      </div>
    );
  }

  return (
    <div className="page-body" style={{ maxWidth: 960 }}>
      {/* Top Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to="/officer/dashboard"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#06b6d4', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.75rem' }}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', color: '#ffffff' }}>
              Field Verification & Rule Engine
            </h1>
            <p style={{ color: 'var(--secondary-text)', fontSize: '0.9rem' }}>
              Mobile on-site test measurement entry, FastAPI Legal Metrology evaluation, and instant certification
            </p>
          </div>

          <div style={{ minWidth: 260 }}>
            <select
              className="form-select"
              value={selectedAppId}
              onChange={(e) => {
                setSelectedAppId(e.target.value);
                setEvaluation(null);
                navigate(`/officer/verification/${e.target.value}`);
              }}
            >
              {applications.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.applicationNumber} — {a.business?.businessName} ({a.instrument?.customId})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Offline Draft Banner */}
      {isOfflineDraft && (
        <div className="offline-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Smartphone size={18} />
            <span>
              <strong>Offline Draft Mode Active:</strong> Field measurements and location coordinates are securely
              persisted in local cache.
            </span>
          </div>
          <button
            onClick={() => submitFieldVerification(true)}
            className="btn btn-sm btn-outline"
            style={{ background: 'white' }}
          >
            Sync Draft
          </button>
        </div>
      )}

      {/* Mobile-Friendly Inspection Summary Card with Complete Details */}
      {application && (
        <div className="field-header" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', borderRadius: '4px', fontWeight: 700 }}>
                  APP: {application.applicationNumber}
                </span>
                <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc', borderRadius: '4px', fontWeight: 600 }}>
                  {application.applicationType}
                </span>
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'Outfit', marginTop: '0.35rem', color: '#ffffff' }}>
                {application.instrument?.customId} — {application.instrument?.instrumentType?.name}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#cbd5e1', marginTop: '0.25rem' }}>
                <strong>Establishment:</strong> {application.business?.businessName} ({application.business?.ownerName})
              </div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                <MapPin size={13} style={{ display: 'inline', marginRight: 4 }} /> {application.location}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Application Status</div>
              <div style={{ marginTop: '0.25rem' }}>
                <StatusBadge status={application.status} size="lg" />
              </div>
              <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '0.5rem' }}>
                Assigned: <strong style={{ color: '#ffffff' }}>{application.assignment?.officer?.name || 'Legal Metrology Officer'}</strong>
              </div>
            </div>
          </div>

          {/* Instrument Technical Specifications Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: '0.75rem',
              paddingTop: '0.85rem',
              borderTop: '1px solid var(--glass-border)',
              fontSize: '0.8rem',
            }}
          >
            <div>
              <div style={{ color: 'var(--secondary-text)' }}>Manufacturer / Make</div>
              <div style={{ fontWeight: 700, color: '#ffffff' }}>{application.instrument?.manufacturer || 'Standard'}</div>
            </div>
            <div>
              <div style={{ color: 'var(--secondary-text)' }}>Model</div>
              <div style={{ fontWeight: 700, color: '#ffffff' }}>{application.instrument?.model || 'N/A'}</div>
            </div>
            <div>
              <div style={{ color: 'var(--secondary-text)' }}>Serial Number</div>
              <div style={{ fontWeight: 700, color: '#06b6d4' }}>{application.instrument?.serialNumber || 'N/A'}</div>
            </div>
            <div>
              <div style={{ color: 'var(--secondary-text)' }}>Capacity / Accuracy</div>
              <div style={{ fontWeight: 700, color: '#ffffff' }}>
                {application.instrument?.capacity} {application.instrument?.capacityUnit} (Class {application.instrument?.accuracyClass})
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 1: Measurement Entry Table */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: '#ffffff', margin: 0 }}>
              Physical Test Measurements
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--secondary-text)', marginTop: '0.2rem' }}>
              Log standard test loads against observed scale readings
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={loadPassPreset}
              className="btn btn-outline btn-sm"
              title="Loads 5kg, 10kg, 20kg compliant readings"
            >
              <Sparkles size={14} style={{ color: '#10b981' }} /> Load PASS Demo
            </button>
            <button
              type="button"
              onClick={loadFailPreset}
              className="btn btn-outline btn-sm"
              title="Loads excessive error readings exceeding MPE"
            >
              <AlertTriangle size={14} style={{ color: '#ef4444' }} /> Load FAIL Demo
            </button>
            <button type="button" onClick={addMeasurementRow} className="btn btn-navy btn-sm">
              <Plus size={14} /> Add Load Test
            </button>
          </div>
        </div>

        {/* Responsive Measurement Table */}
        <div className="table-container" style={{ marginBottom: '1.25rem' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 60 }}>#</th>
                <th>Reference Standard Value ({application?.instrument?.capacityUnit || 'kg'})</th>
                <th>Observed Scale Reading ({application?.instrument?.capacityUnit || 'kg'})</th>
                <th>Calculated Error</th>
                <th>Allowed Error (MPE)</th>
                <th>Test Result</th>
                <th style={{ width: 60 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {measurements.map((m, idx) => {
                const evalItem = evaluation?.tests?.[idx];
                const rawError = (m.observed - m.reference).toFixed(4);

                return (
                  <tr key={idx}>
                    <td style={{ fontWeight: 700, color: '#64748b' }}>{idx + 1}</td>
                    <td>
                      <input
                        type="number"
                        step="0.001"
                        className="form-input"
                        style={{ maxWidth: 160, fontWeight: 700 }}
                        value={m.reference}
                        onChange={(e) => updateMeasurement(idx, 'reference', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.001"
                        className="form-input"
                        style={{ maxWidth: 160, fontWeight: 700 }}
                        value={m.observed}
                        onChange={(e) => updateMeasurement(idx, 'observed', e.target.value)}
                      />
                    </td>
                    <td>
                      <strong style={{ color: Math.abs(rawError) > 0.05 ? '#dc2626' : '#0f172a' }}>
                        {rawError > 0 ? `+${rawError}` : rawError}
                      </strong>
                    </td>
                    <td>
                      {evalItem ? (
                        <span>±{evalItem.allowedError}</span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Awaiting check</span>
                      )}
                    </td>
                    <td>
                      {evalItem ? (
                        <StatusBadge status={evalItem.result} />
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Pending</span>
                      )}
                    </td>
                    <td>
                      {measurements.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMeasurementRow(idx)}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '0.35rem', color: '#ef4444' }}
                          title="Remove test"
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

        {/* Verification Engine Trigger Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Accuracy Standard: <strong>OIML R 76-1 Class {application?.instrument?.accuracyClass || 'III'}</strong>
          </div>

          <button
            type="button"
            onClick={runVerificationRuleEngine}
            className="btn btn-primary btn-lg"
            disabled={evaluating}
          >
            {evaluating ? (
              <>Evaluating Tolerances...</>
            ) : (
              <>
                <Scale size={18} /> Run Verification Rule Engine
              </>
            )}
          </button>
        </div>

        {/* FastAPI Evaluation Result Card */}
        {evaluation && (
          <div
            style={{
              marginTop: '1.5rem',
              padding: '1.25rem 1.5rem',
              borderRadius: '14px',
              border: `1px solid ${evaluation.overallResult === 'PASS' ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
              background: evaluation.overallResult === 'PASS' ? 'rgba(34, 197, 94, 0.16)' : 'rgba(239, 68, 68, 0.16)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {evaluation.overallResult === 'PASS' ? (
                  <CheckCircle size={36} color="#4ade80" />
                ) : (
                  <XCircle size={36} color="#f87171" />
                )}
                <div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'Outfit', color: evaluation.overallResult === 'PASS' ? '#4ade80' : '#f87171' }}>
                    OVERALL RESULT: {evaluation.overallResult}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: evaluation.overallResult === 'PASS' ? '#86efac' : '#fca5a5' }}>
                    {evaluation.summary?.passed} of {evaluation.summary?.totalTests} tests within Maximum Permissible Error (MPE).
                    Pass Rate: {evaluation.summary?.passRate}%.
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--secondary-text)' }}>
                  Engine: {evaluation.engineSource || 'Python FastAPI'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)' }}>
                  Calculated: {new Date(evaluation.calculatedAt || Date.now()).toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: Evidence Photos & Geolocation */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Photo Upload Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Camera size={20} color="#1e3a8a" />
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Inspection Evidence Photos</h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
            Capture instrument front view, serial plate, display reading, and verification seal
          </p>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <select
              className="form-select"
              value={evidenceType}
              onChange={(e) => setEvidenceType(e.target.value)}
              style={{ flex: 1 }}
            >
              <option value="INSTRUMENT_FRONT">Instrument Front</option>
              <option value="SERIAL_NUMBER">Serial Number Plate</option>
              <option value="DISPLAY_READING">Display Reading Under Load</option>
              <option value="TEST_WEIGHT">Reference Test Weights</option>
              <option value="LOCATION">Premises Overview</option>
            </select>

            <label className="btn btn-outline" style={{ cursor: 'pointer', margin: 0 }}>
              <Camera size={16} /> {uploadingPhoto ? 'Uploading...' : 'Take / Upload Photo'}
              <input
                type="file"
                accept="image/*,application/pdf"
                capture="environment"
                onChange={handlePhotoUpload}
                disabled={uploadingPhoto}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          {/* Uploaded Evidence Thumbnails */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.75rem' }}>
            {evidenceList.map((ev) => (
              <div
                key={ev.id}
                style={{
                  position: 'relative',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  background: 'rgba(255, 255, 255, 0.05)',
                  textAlign: 'center',
                }}
              >
                <img
                  src={ev.filePath}
                  alt={ev.evidenceType}
                  style={{ width: '100%', height: 75, objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <div style={{ fontSize: '0.65rem', padding: '0.2rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.85)', truncate: true }}>
                  {ev.evidenceType.replace('_', ' ')}
                </div>
                <button
                  type="button"
                  onClick={() => deleteEvidencePhoto(ev.id)}
                  style={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    background: 'rgba(239, 68, 68, 0.85)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: 20,
                    height: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  ×
                </button>
              </div>
            ))}

            {evidenceList.length === 0 && (
              <div style={{ gridColumn: '1 / -1', padding: '1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                No evidence photos uploaded yet.
              </div>
            )}
          </div>
        </div>

        {/* Geolocation Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <MapPin size={20} color="#06b6d4" />
            <h3 style={{ fontSize: '1.1rem', margin: 0, color: '#ffffff' }}>On-Site GPS Geolocation</h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--secondary-text)', marginBottom: '1rem' }}>
            Capture real-time inspection coordinates to prove physical on-site presence
          </p>

          <div
            style={{
              background: 'var(--glass-subtle)',
              border: '1px solid var(--glass-border)',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1rem',
            }}
          >
            {locationData.latitude ? (
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
                  GPS: {locationData.latitude}°, {locationData.longitude}°
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--secondary-text)', marginTop: '0.2rem' }}>
                  Accuracy: ±{locationData.accuracy?.toFixed(1) || '12'}m • Captured: {new Date().toLocaleTimeString()}
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '0.85rem', color: 'var(--secondary-text)' }}>
                GPS coordinates have not been locked. Click below to acquire on-site geolocation.
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={fetchCurrentLocation}
            className="btn btn-navy btn-sm"
            disabled={locating}
            style={{ width: '100%' }}
          >
            <Compass size={16} /> {locating ? 'Acquiring GPS Fix...' : 'Capture Inspection Coordinates'}
          </button>
        </div>
      </div>

      {/* Decision Panel (PASS / REJECT / RETEST) */}
      <div className="card">
        <h3 style={{ fontSize: '1.15rem', color: '#ffffff', marginBottom: '0.5rem' }}>
          Final Metrological Determination & Action
        </h3>
        <p style={{ color: 'var(--secondary-text)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          Select the legal outcome based on FastAPI tolerance test results and physical security sealing
        </p>

        <div className="form-group">
          <label className="form-label">General Inspector Notes & Remarks</label>
          <textarea
            className="form-textarea"
            rows="2"
            placeholder="e.g. Verified with standard weights. Holographic security seal MESURE-2026-X8 applied on calibration pot."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Conditional Rejection Form */}
        {decisionAction === 'REJECT' && (
          <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.16)', border: '1px solid rgba(239, 68, 68, 0.35)', borderRadius: '12px', marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ color: '#f87171' }}>
              Mandatory Rejection Reason *
            </label>
            <textarea
              className="form-textarea"
              rows="2"
              placeholder="e.g. Test load error exceeds Maximum Permissible Error (MPE) limit of ±0.03 kg. Non-repeatable zero drift observed."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              required
            />
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
              <button
                type="button"
                onClick={() => handleDecisionSubmit('REJECT')}
                className="btn btn-danger"
                disabled={submitting}
              >
                Confirm Rejection
              </button>
              <button type="button" onClick={() => setDecisionAction(null)} className="btn btn-outline">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Conditional Re-test Form */}
        {decisionAction === 'RETEST' && (
          <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.16)', border: '1px solid rgba(245, 158, 11, 0.35)', borderRadius: '12px', marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ color: '#fbbf24' }}>
              Recommended Re-Test Date & Calibration Correction Notice
            </label>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              <input
                type="date"
                className="form-input"
                value={retestDate}
                onChange={(e) => setRetestDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                style={{ maxWidth: 220 }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
              <button
                type="button"
                onClick={() => handleDecisionSubmit('REQUEST_RETEST')}
                className="btn btn-primary"
                disabled={submitting}
              >
                Schedule Re-Test
              </button>
              <button type="button" onClick={() => setDecisionAction(null)} className="btn btn-outline">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {!decisionAction && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => submitFieldVerification(true)}
              className="btn btn-outline"
              disabled={submitting}
            >
              <Save size={16} /> Save Offline Draft
            </button>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setDecisionAction('RETEST')}
                className="btn btn-outline"
                style={{ color: '#d97706', borderColor: '#f59e0b' }}
                disabled={submitting}
              >
                Request Re-Test
              </button>

              <button
                type="button"
                onClick={() => setDecisionAction('REJECT')}
                className="btn btn-danger"
                disabled={submitting}
              >
                <XCircle size={16} /> Reject Application
              </button>

              <button
                type="button"
                onClick={() => handleDecisionSubmit('APPROVE')}
                className="btn btn-success btn-lg"
                disabled={submitting || (evaluation && evaluation.overallResult === 'FAIL')}
                title={evaluation?.overallResult === 'FAIL' ? 'Cannot approve failing test readings' : 'Approve and generate certificate'}
              >
                <CheckCircle size={18} /> Approve & Issue Certificate
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Result Certificate Modal */}
      <DigitalCertificateModal
        certificate={issuedCert}
        isOpen={showCertModal}
        onClose={() => setShowCertModal(false)}
      />
    </div>
  );
}
