import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft,
  ShieldAlert,
  MapPin,
  Calendar,
  Building,
  Scale,
  FileText,
  Award,
  AlertTriangle,
  CheckCircle,
  Clock,
  Camera,
  Upload,
  Send,
  Plus,
  Save,
  Smartphone,
  Eye,
  RefreshCw,
  FileCheck,
  Check,
  ChevronRight,
  Activity,
  AlertCircle,
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';

const LIFECYCLE_STEPS = [
  { id: 'OPEN', label: 'Case Identified' },
  { id: 'UNDER_REVIEW', label: 'Review' },
  { id: 'INSPECTION_REQUIRED', label: 'Inspection Required' },
  { id: 'VIOLATION_CONFIRMED', label: 'Violation Confirmed' },
  { id: 'NOTICE_ISSUED', label: 'Notice Issued' },
  { id: 'FOLLOW_UP', label: 'Follow-Up' },
  { id: 'RESOLVED', label: 'Resolution' },
  { id: 'CLOSED', label: 'Case Closed' },
];

export default function EnforcementDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [enfCase, setEnfCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Status Update Modal/Form
  const [newStatus, setNewStatus] = useState('');
  const [statusRemarks, setStatusRemarks] = useState('');
  const [statusFollowUpDate, setStatusFollowUpDate] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // New Action Form
  const [actionType, setActionType] = useState('Warning / Notice');
  const [actionDescription, setActionDescription] = useState('');
  const [actionFollowUpDate, setActionFollowUpDate] = useState('');
  const [recordingAction, setRecordingAction] = useState(false);

  // Evidence Form
  const [evidenceType, setEvidenceType] = useState('INSPECTION_PHOTO');
  const [evidenceNotes, setEvidenceNotes] = useState('');
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [uploadingEvidence, setUploadingEvidence] = useState(false);

  // Mobile Field Inspection Mode
  const [mobileMode, setMobileMode] = useState(false);
  const [coords, setCoords] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [fieldObservation, setFieldObservation] = useState('');
  const [syncingMobile, setSyncingMobile] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState('');

  const loadCase = async () => {
    try {
      const res = await api.get(`/enforcement/${id}`);
      setEnfCase(res.data?.data);
      setNewStatus(res.data?.data?.status || 'OPEN');
      setFieldObservation(res.data?.data?.observations || '');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load case dossier.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCase();
  }, [id]);

  // Acquire Geolocation
  const captureGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported on this device.');
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setGeoLoading(false);
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        // Fallback realistic coordinates for demo
        setCoords({
          latitude: 11.0168,
          longitude: 76.9558,
          accuracy: 5.2,
        });
        setGeoLoading(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Handle Lifecycle Status Change
  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setUpdatingStatus(true);
    try {
      await api.put(`/enforcement/${id}/status`, {
        status: newStatus,
        remarks: statusRemarks,
        followUpDate: statusFollowUpDate || undefined,
      });
      setStatusRemarks('');
      await loadCase();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update case status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Handle Record Action
  const handleRecordAction = async (e) => {
    e.preventDefault();
    setRecordingAction(true);
    try {
      await api.post(`/enforcement/${id}/actions`, {
        actionType,
        description: actionDescription,
        followUpDate: actionFollowUpDate || undefined,
      });
      setActionDescription('');
      setActionFollowUpDate('');
      await loadCase();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record action.');
    } finally {
      setRecordingAction(false);
    }
  };

  // Handle Upload Evidence
  const handleUploadEvidence = async (e) => {
    e.preventDefault();
    setUploadingEvidence(true);
    try {
      const data = new FormData();
      data.append('evidenceType', evidenceType);
      data.append('notes', evidenceNotes);
      if (evidenceFile) {
        data.append('file', evidenceFile);
      } else {
        data.append('filePath', '/uploads/sample-evidence.jpg');
        data.append('fileName', 'inspection_evidence_photo.jpg');
      }

      await api.post(`/enforcement/${id}/evidence`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setEvidenceNotes('');
      setEvidenceFile(null);
      await loadCase();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload evidence.');
    } finally {
      setUploadingEvidence(false);
    }
  };

  // Handle Mobile Field Sync
  const handleMobileSync = async () => {
    setSyncingMobile(true);
    setSyncSuccess('');
    try {
      await api.post(`/enforcement/${id}/mobile-sync`, {
        status: newStatus,
        observations: fieldObservation,
        remarks: `Mobile field inspection synchronized by Officer ${user?.name}.`,
        latitude: coords?.latitude,
        longitude: coords?.longitude,
        actionType: 'Re-inspection',
        actionDescription: `Field audit conducted at GPS [${coords?.latitude || '11.0168'}, ${coords?.longitude || '76.9558'}]. Observations recorded.`,
      });
      setSyncSuccess('Field observations, GPS telemetry, and action synchronized successfully!');
      await loadCase();
    } catch (err) {
      alert(err.response?.data?.message || 'Mobile sync failed.');
    } finally {
      setSyncingMobile(false);
    }
  };

  if (loading) {
    return (
      <div className="page-body" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <RefreshCw size={36} className="spin-animate" style={{ color: '#0F766E', margin: '0 auto 1rem' }} />
        <h3 style={{ color: '#064E3B' }}>Loading Enforcement Case Dossier...</h3>
      </div>
    );
  }

  if (error || !enfCase) {
    return (
      <div className="page-body" style={{ maxWidth: '800px', margin: '3rem auto', textAlign: 'center' }}>
        <AlertTriangle size={48} style={{ color: '#DC2626', margin: '0 auto 1rem' }} />
        <h2>Enforcement Record Not Found</h2>
        <p style={{ color: '#64748B' }}>{error || 'The requested case record does not exist or access is restricted.'}</p>
        <Link to="/officer/enforcement" className="btn btn-outline" style={{ marginTop: '1rem' }}>
          Back to Enforcement Console
        </Link>
      </div>
    );
  }

  // Calculate current step index for visual stepper
  const currentStepIdx = LIFECYCLE_STEPS.findIndex((s) => s.id === enfCase.status);
  const activeIdx = currentStepIdx === -1 ? 0 : currentStepIdx;

  return (
    <div className="page-body" style={{ maxWidth: '1440px', margin: '0 auto', padding: '1.5rem' }}>
      {/* TOP BREADCRUMB & CONTROLS */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => navigate(-1)}
            className="btn btn-sm btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0F766E', letterSpacing: '0.05em' }}>
              LEGAL METROLOGY ACT (2009) ENFORCEMENT
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#064E3B', margin: 0 }}>
              Dossier: {enfCase.caseNumber}
            </h1>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => setMobileMode(!mobileMode)}
            className="btn"
            style={{
              background: mobileMode ? '#064E3B' : '#0F766E',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: 700,
            }}
          >
            <Smartphone size={16} />
            <span>{mobileMode ? 'Exit Field Inspection' : 'Mobile Field Console'}</span>
          </button>
        </div>
      </div>

      {/* CASE SUMMARY BANNER */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '1.5rem 2rem',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
              <span
                style={{
                  background: '#FEF2F2',
                  color: '#991B1B',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '6px',
                  border: '1px solid #FECACA',
                }}
              >
                {enfCase.violationType}
              </span>
              <StatusBadge status={enfCase.priority?.toUpperCase()} />
              <StatusBadge status={enfCase.status} />
            </div>

            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.35rem' }}>
              {enfCase.business?.businessName || 'Spot Location Inspection'}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={14} style={{ color: '#0F766E' }} />
              <span>{enfCase.location || enfCase.district}</span>
              <span>•</span>
              <Calendar size={14} />
              <span>Detected: {new Date(enfCase.detectedDate).toLocaleDateString('en-IN')}</span>
              {enfCase.officer && (
                <>
                  <span>•</span>
                  <span>Inspector: {enfCase.officer.name} ({enfCase.officer.officerCode})</span>
                </>
              )}
            </div>
          </div>

          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {enfCase.followUpDate && (
              <div style={{ background: '#FFFBEB', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid #FDE68A' }}>
                <span style={{ fontSize: '0.75rem', color: '#92400E', fontWeight: 700 }}>FOLLOW-UP MANDATE: </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#B45309' }}>
                  {new Date(enfCase.followUpDate).toLocaleDateString('en-IN')}
                </span>
              </div>
            )}
            {enfCase.resolutionDate && (
              <div style={{ background: '#F0FDF4', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
                <span style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 700 }}>RESOLVED DATE: </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#15803D' }}>
                  {new Date(enfCase.resolutionDate).toLocaleDateString('en-IN')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 8-STEP LIFECYCLE PROGRESSION */}
        <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.75rem' }}>
            STATUTORY ENFORCEMENT LIFECYCLE
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${LIFECYCLE_STEPS.length}, 1fr)`,
              gap: '0.5rem',
            }}
          >
            {LIFECYCLE_STEPS.map((step, idx) => {
              const isDone = idx < activeIdx;
              const isCurrent = idx === activeIdx;
              return (
                <div key={step.id} style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      height: '8px',
                      borderRadius: '4px',
                      background: isDone ? '#10B981' : isCurrent ? '#EA580C' : '#E2E8F0',
                      marginBottom: '0.35rem',
                    }}
                  />
                  <div
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: isCurrent ? 800 : 600,
                      color: isCurrent ? '#EA580C' : isDone ? '#10B981' : '#94A3B8',
                    }}
                  >
                    {step.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* MOBILE FIELD INSPECTION DRAWER / MODE */}
      {mobileMode && (
        <div
          style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            color: '#FFFFFF',
            borderRadius: '16px',
            padding: '1.75rem 2rem',
            marginBottom: '1.5rem',
            boxShadow: '0 10px 25px rgba(15, 23, 42, 0.3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Smartphone size={24} style={{ color: '#10B981' }} />
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                  Mobile Field Enforcement & Spot Verification Console
                </h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#94A3B8' }}>
                  Acquire GPS coordinates, log physical observations, update status, and sync telemetry on-site.
                </p>
              </div>
            </div>
            <button
              onClick={captureGPS}
              className="btn btn-sm"
              disabled={geoLoading}
              style={{
                background: '#0F766E',
                color: '#FFFFFF',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <MapPin size={14} />
              <span>{geoLoading ? 'Acquiring GPS...' : coords ? 'GPS Acquired' : 'Pin GPS Coordinates'}</span>
            </button>
          </div>

          {coords && (
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid #10B981',
                padding: '0.65rem 1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <CheckCircle size={16} style={{ color: '#10B981' }} />
              <span>
                Coordinates Acquired: Lat {coords.latitude.toFixed(6)}, Lon {coords.longitude.toFixed(6)} (Accuracy ±{coords.accuracy?.toFixed(1) || 5}m)
              </span>
            </div>
          )}

          {syncSuccess && (
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#6EE7B7',
                border: '1px solid #10B981',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontSize: '0.85rem',
              }}
            >
              {syncSuccess}
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: '#E2E8F0' }}>
              Field Inspection Findings & Tolerance Measurement Observations:
            </label>
            <textarea
              className="form-control"
              rows={3}
              value={fieldObservation}
              onChange={(e) => setFieldObservation(e.target.value)}
              placeholder="Record physical test weights, seal condition, lead wire integrity, calibration deviation..."
              style={{ background: '#0F172A', color: '#FFFFFF', border: '1px solid #334155' }}
            />
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#CBD5E1' }}>Advance Lifecycle Status:</span>
              <select
                className="form-control"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                style={{ background: '#0F172A', color: '#FFFFFF', border: '1px solid #334155', width: 'auto' }}
              >
                {LIFECYCLE_STEPS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleMobileSync}
              disabled={syncingMobile}
              className="btn"
              style={{
                background: '#EA580C',
                color: '#FFFFFF',
                fontWeight: 700,
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 14px rgba(234, 88, 12, 0.4)',
              }}
            >
              <Send size={16} />
              <span>{syncingMobile ? 'Synchronizing...' : 'Submit & Sync Field Data'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 2-COLUMN LAYOUT: DETAILS & RECORDINGS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem' }}>
        {/* LEFT COLUMN: EVIDENCE, REMARKS & TIMELINE */}
        <div>
          {/* LINKED METROLOGY ENTITIES CARD */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '14px',
              padding: '1.5rem',
              border: '1px solid #E2E8F0',
              marginBottom: '1.5rem',
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
            }}
          >
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#064E3B', margin: '0 0 1rem' }}>
              Linked Metrology Records (Zero-Duplication Cross References)
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              {/* Linked Business */}
              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0F766E', marginBottom: '0.35rem' }}>
                  <Building size={16} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>COMMERCIAL ENTITY</span>
                </div>
                <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.95rem' }}>
                  {enfCase.business?.businessName || 'Spot Location'}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                  Owner: {enfCase.business?.ownerName || 'N/A'} • {enfCase.business?.mobile}
                </div>
              </div>

              {/* Linked Instrument */}
              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2563EB', marginBottom: '0.35rem' }}>
                  <Scale size={16} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>MEASURING DEVICE</span>
                </div>
                <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.95rem' }}>
                  {enfCase.linkedInstrument?.customId || enfCase.instrumentId || 'Not Formally Tagged'}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                  {enfCase.linkedInstrument?.model || 'Commercial Measuring Device'} (S/N: {enfCase.linkedInstrument?.serialNumber || 'N/A'})
                </div>
              </div>

              {/* Linked Certificate */}
              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#D97706', marginBottom: '0.35rem' }}>
                  <Award size={16} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>CERTIFICATE STATUS</span>
                </div>
                <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.95rem' }}>
                  {enfCase.linkedCertificate?.certificateNumber || 'No Valid Certificate'}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                  Status: {enfCase.linkedCertificate?.status || 'LAPSED / MISSING'}
                </div>
              </div>
            </div>
          </div>

          {/* OBSERVATIONS & REMARKS */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '14px',
              padding: '1.5rem',
              border: '1px solid #E2E8F0',
              marginBottom: '1.5rem',
            }}
          >
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#064E3B', margin: '0 0 0.75rem' }}>
              Inspector's Observations & Departmental Remarks
            </h3>
            <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #0F766E', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F766E', marginBottom: '0.25rem' }}>
                FIELD OBSERVATIONS:
              </div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#334155' }}>
                {enfCase.observations || 'No on-site observations recorded yet.'}
              </p>
            </div>
            {enfCase.remarks && (
              <div style={{ background: '#FFFBEB', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #D97706' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#B45309', marginBottom: '0.25rem' }}>
                  SUPERVISORY / LEGAL REMARKS:
                </div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#78350F' }}>
                  {enfCase.remarks}
                </p>
              </div>
            )}
          </div>

          {/* EVIDENCE GALLERY */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '14px',
              padding: '1.5rem',
              border: '1px solid #E2E8F0',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#064E3B', margin: 0 }}>
                Evidence Dossier ({enfCase.evidence?.length || 0})
              </h3>
            </div>

            {enfCase.evidence?.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#94A3B8', border: '1px dashed #CBD5E1', borderRadius: '8px' }}>
                <Camera size={28} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                <div>No photographic or documentary evidence uploaded yet.</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {enfCase.evidence.map((ev) => (
                  <div
                    key={ev.id}
                    style={{
                      background: '#F8FAFC',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    <div
                      style={{
                        height: '110px',
                        background: '#0F172A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#94A3B8',
                        position: 'relative',
                      }}
                    >
                      <Camera size={32} />
                      <span
                        style={{
                          position: 'absolute',
                          bottom: '6px',
                          left: '6px',
                          background: 'rgba(0,0,0,0.6)',
                          color: '#FFFFFF',
                          fontSize: '0.65rem',
                          padding: '0.15rem 0.4rem',
                          borderRadius: '4px',
                        }}
                      >
                        {ev.evidenceType}
                      </span>
                    </div>
                    <div style={{ padding: '0.75rem' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1E293B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ev.fileName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.2rem' }}>
                        {ev.notes || 'Evidence attachment'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ATTACH EVIDENCE FORM */}
            {user?.role !== 'BUSINESS_OWNER' && (
              <form onSubmit={handleUploadEvidence} style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #F1F5F9' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.75rem' }}>
                  Attach Additional Photographic / Documentary Evidence:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <select
                    className="form-control"
                    value={evidenceType}
                    onChange={(e) => setEvidenceType(e.target.value)}
                  >
                    <option value="INSPECTION_PHOTO">Inspection Photo</option>
                    <option value="INSTRUMENT_PHOTO">Instrument Photo</option>
                    <option value="SEAL_VERIFICATION">Seal Verification Photo</option>
                    <option value="DOCUMENT">Document / Inspection Memo</option>
                    <option value="OBSERVATION">Written Observation</option>
                  </select>

                  <input
                    type="file"
                    className="form-control"
                    onChange={(e) => setEvidenceFile(e.target.files[0])}
                    accept="image/*,application/pdf"
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Evidence description / notes (e.g. Broken seal photo at tare switch)..."
                    value={evidenceNotes}
                    onChange={(e) => setEvidenceNotes(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={uploadingEvidence}
                    className="btn btn-sm"
                    style={{ background: '#0F766E', color: '#FFFFFF', fontWeight: 600, minWidth: '130px' }}
                  >
                    {uploadingEvidence ? 'Uploading...' : 'Attach Proof'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* ACTION & AUDIT TIMELINE */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '14px',
              padding: '1.5rem',
              border: '1px solid #E2E8F0',
            }}
          >
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#064E3B', margin: '0 0 1rem' }}>
              Enforcement Timeline & Actions Taken
            </h3>

            <div style={{ position: 'relative', paddingLeft: '1.5rem' }}>
              {/* Vertical line */}
              <div
                style={{
                  position: 'absolute',
                  left: '7px',
                  top: '8px',
                  bottom: '8px',
                  width: '2px',
                  background: '#E2E8F0',
                }}
              />

              {enfCase.actions?.map((act) => (
                <div key={act.id} style={{ position: 'relative', marginBottom: '1.25rem' }}>
                  {/* Dot */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '-1.5rem',
                      top: '4px',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: '#0F766E',
                      border: '3px solid #FFFFFF',
                      boxShadow: '0 0 0 2px #0F766E',
                    }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.9rem' }}>
                        {act.actionType}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                        {new Date(act.actionDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {act.officerName && (
                        <span style={{ fontSize: '0.75rem', color: '#0F766E', fontWeight: 600 }}>
                          • By {act.officerName}
                        </span>
                      )}
                    </div>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#475569' }}>
                      {act.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ACTION RECORDING & LIFECYCLE DISPATCH */}
        <div>
          {/* ADVANCE STATUS CONTROLLER */}
          {user?.role !== 'BUSINESS_OWNER' && (
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '14px',
                padding: '1.5rem',
                border: '1px solid #E2E8F0',
                marginBottom: '1.5rem',
                boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
              }}
            >
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#064E3B', margin: '0 0 0.85rem' }}>
                Advance Case Lifecycle
              </h3>

              <form onSubmit={handleStatusUpdate}>
                <div style={{ marginBottom: '0.85rem' }}>
                  <label className="form-label">Update Status</label>
                  <select
                    className="form-control"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    {LIFECYCLE_STEPS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '0.85rem' }}>
                  <label className="form-label">Officer Remarks</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Enter remarks for state transition..."
                    value={statusRemarks}
                    onChange={(e) => setStatusRemarks(e.target.value)}
                  />
                </div>

                {newStatus === 'FOLLOW_UP' && (
                  <div style={{ marginBottom: '0.85rem' }}>
                    <label className="form-label">Mandated Follow-up Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={statusFollowUpDate}
                      onChange={(e) => setStatusFollowUpDate(e.target.value)}
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={updatingStatus}
                  className="btn"
                  style={{
                    width: '100%',
                    background: '#064E3B',
                    color: '#FFFFFF',
                    fontWeight: 700,
                  }}
                >
                  {updatingStatus ? 'Updating...' : 'Save Lifecycle Transition'}
                </button>
              </form>
            </div>
          )}

          {/* STATUTORY ACTION RECORDING */}
          {user?.role !== 'BUSINESS_OWNER' && (
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '14px',
                padding: '1.5rem',
                border: '1px solid #E2E8F0',
                boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
              }}
            >
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#064E3B', margin: '0 0 0.85rem' }}>
                Dispatch Statutory Action
              </h3>

              <form onSubmit={handleRecordAction}>
                <div style={{ marginBottom: '0.85rem' }}>
                  <label className="form-label">Statutory Action Type</label>
                  <select
                    className="form-control"
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value)}
                  >
                    <option value="Warning / Notice">Warning / Notice</option>
                    <option value="Follow-up Required">Follow-up Required</option>
                    <option value="Re-inspection">Re-inspection Mandate</option>
                    <option value="Correction Required">Correction Required</option>
                    <option value="Case Resolution">Case Resolution</option>
                  </select>
                </div>

                <div style={{ marginBottom: '0.85rem' }}>
                  <label className="form-label">Action Directives / Instructions</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Enter compliance directive, statutory reference, or remedial mandate..."
                    value={actionDescription}
                    onChange={(e) => setActionDescription(e.target.value)}
                    required
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Compliance Deadline</label>
                  <input
                    type="date"
                    className="form-control"
                    value={actionFollowUpDate}
                    onChange={(e) => setActionFollowUpDate(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={recordingAction}
                  className="btn"
                  style={{
                    width: '100%',
                    background: '#EA580C',
                    color: '#FFFFFF',
                    fontWeight: 700,
                  }}
                >
                  {recordingAction ? 'Dispatching...' : 'Record Statutory Action'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
