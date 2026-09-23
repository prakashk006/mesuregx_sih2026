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
  FlaskConical,
  RotateCcw,
  History,
  ShieldCheck,
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [officers, setOfficers] = useState([]);
  const [gatcs, setGatcs] = useState([]);
  const [assignmentHistory, setAssignmentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Assign Modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignLoading, setAssignLoading] = useState(false);
  const [authorityType, setAuthorityType] = useState('LMO'); // 'LMO' or 'GATC'
  const [assignData, setAssignData] = useState({
    officerId: '',
    gatcId: '',
    scheduledDate: '',
    scheduledTime: '10:30 AM',
    location: '',
    instructions: 'Standard verification per Legal Metrology rules.',
    reason: '',
  });

  const navigate = useNavigate();

  const fetchDetails = async () => {
    try {
      const [appRes, offRes, gatcRes, histRes] = await Promise.allSettled([
        api.get(`/applications/${id}`),
        api.get('/admin/officers'),
        api.get('/gatc/active'),
        api.get(`/assignments/history/${id}`),
      ]);

      if (appRes.status === 'fulfilled') {
        const app = appRes.value.data?.data?.application;
        setApplication(app);
        const officersList = offRes.status === 'fulfilled' ? offRes.value.data?.data?.officers || [] : [];
        setOfficers(officersList);
        const gatcsList = gatcRes.status === 'fulfilled' ? gatcRes.value.data?.data?.gatcs || [] : [];
        setGatcs(gatcsList);

        if (histRes.status === 'fulfilled') {
          setAssignmentHistory(histRes.value.data?.data?.history || []);
        }

        if (app) {
          const isCurrentGatc = app.assignment?.assignedAuthority === 'GATC';
          setAuthorityType(isCurrentGatc ? 'GATC' : 'LMO');

          setAssignData((prev) => ({
            ...prev,
            officerId: app.assignment?.officerId || officersList?.[0]?.id || '',
            gatcId: app.assignment?.gatcId || gatcsList?.[0]?.id || '',
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
      const isReassign = application?.assignment && application?.assignment?.status !== 'REJECTED';
      const endpoint = isReassign ? '/assignments/reassign' : '/assignments/assign';

      await api.post(endpoint, {
        applicationId: id,
        authorityType,
        officerId: authorityType === 'LMO' ? assignData.officerId : undefined,
        gatcId: authorityType === 'GATC' ? assignData.gatcId : undefined,
        scheduledDate: assignData.scheduledDate,
        scheduledTime: assignData.scheduledTime,
        location: assignData.location,
        instructions: assignData.instructions,
        reason: assignData.reason || (authorityType === 'GATC' ? 'Allocated to GATC test house' : 'Assigned to LMO jurisdiction'),
      });

      setShowAssignModal(false);
      setSuccessMsg(`Verification successfully ${isReassign ? 'reassigned' : 'allocated'} to ${authorityType === 'GATC' ? 'GATC Test Centre' : 'Legal Metrology Officer'}!`);
      await fetchDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to allocate verification authority.');
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

  const assignment = application.assignment;
  const isGatc = assignment?.assignedAuthority === 'GATC';

  return (
    <div className="page-body" style={{ maxWidth: 1050 }}>
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
            <h1 style={{ fontSize: '1.75rem', color: '#ffffff', margin: 0 }}>
              Application {application.applicationNumber}
            </h1>
            <p style={{ color: 'var(--secondary-text)', fontSize: '0.9rem', margin: '0.2rem 0 0' }}>
              Submitted on {new Date(application.createdAt).toLocaleDateString()} • {application.applicationType}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <StatusBadge status={application.status} size="lg" />
            <button onClick={() => setShowAssignModal(true)} className="btn btn-navy" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={16} />
              <span>{assignment ? 'Reassign Authority' : 'Assign Authority'}</span>
            </button>
            {isGatc ? (
              <Link to={`/gatc/verification/${application.id}`} className="btn btn-primary" style={{ background: '#0F766E', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FlaskConical size={16} />
                <span>GATC Test Console</span>
              </Link>
            ) : (
              <Link to={`/officer/verification/${application.id}`} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ClipboardCheck size={16} />
                <span>Field Verification</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {successMsg && (
        <div style={{ background: 'rgba(34, 197, 94, 0.16)', padding: '0.85rem 1.25rem', borderRadius: 8, color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.35)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.16)', padding: '0.85rem 1.25rem', borderRadius: 8, color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.35)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* 2-Column Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Business Establishment */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', color: '#ffffff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building size={18} color="#06b6d4" /> Business Establishment
          </h3>
          <div style={{ display: 'grid', gap: '0.75rem', fontSize: '0.85rem' }}>
            <div>
              <span style={{ color: 'var(--secondary-text)' }}>Establishment Name:</span>
              <div style={{ fontWeight: 600, color: '#ffffff' }}>{application.business?.businessName}</div>
            </div>
            <div>
              <span style={{ color: 'var(--secondary-text)' }}>Proprietor / Contact:</span>
              <div style={{ color: '#ffffff' }}>{application.business?.ownerName} • {application.business?.mobile}</div>
            </div>
            <div>
              <span style={{ color: 'var(--secondary-text)' }}>Premises Address:</span>
              <div style={{ color: '#ffffff' }}>{application.location || application.business?.address}</div>
              <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                {application.business?.city}, {application.business?.district}, {application.business?.state} - {application.business?.pincode}
              </div>
            </div>
          </div>
        </div>

        {/* Measuring Instrument Details */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', color: '#ffffff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Scale size={18} color="#06b6d4" /> Instrument Under Verification
          </h3>
          <div style={{ display: 'grid', gap: '0.75rem', fontSize: '0.85rem' }}>
            <div>
              <span style={{ color: 'var(--secondary-text)' }}>Model & Serial Number:</span>
              <div style={{ fontWeight: 600, color: '#ffffff' }}>
                {application.instrument?.model} <span style={{ color: '#06b6d4' }}>({application.instrument?.customId})</span>
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>S/N: {application.instrument?.serialNumber}</div>
            </div>
            <div>
              <span style={{ color: 'var(--secondary-text)' }}>Metrological Classification:</span>
              <div style={{ color: '#ffffff' }}>
                Accuracy Class {application.instrument?.accuracyClass} • Max Capacity: {application.instrument?.capacity} {application.instrument?.capacityUnit}
              </div>
            </div>
            <div>
              <span style={{ color: 'var(--secondary-text)' }}>Instrument Type:</span>
              <div style={{ color: '#ffffff' }}>{application.instrument?.instrumentType?.name}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Authority Assignment Card */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem', borderLeft: `4px solid ${isGatc ? '#0F766E' : '#2563EB'}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {isGatc ? <FlaskConical size={20} color="#0F766E" /> : <UserCheck size={20} color="#2563EB" />}
            <span>Assigned Verification Authority</span>
          </h3>
          {assignment && (
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.2rem 0.6rem',
              borderRadius: 4,
              background: isGatc ? 'rgba(15, 118, 110, 0.25)' : 'rgba(37, 99, 235, 0.25)',
              color: isGatc ? '#2dd4bf' : '#38bdf8',
            }}>
              {isGatc ? 'GOVERNMENT APPROVED TEST CENTRE (GATC)' : 'LEGAL METROLOGY OFFICER (LMO)'}
            </span>
          )}
        </div>

        {assignment ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)' }}>Designated Authority</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
                {isGatc ? assignment.gatc?.name : assignment.officer?.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)' }}>
                {isGatc
                  ? `${assignment.gatc?.gatcCode} • Auth No: ${assignment.gatc?.authorizationNo}`
                  : `${assignment.officer?.officerCode} (${assignment.officer?.designation})`}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)' }}>Scheduled Date & Time</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#06b6d4' }}>
                {new Date(assignment.scheduledDate).toLocaleDateString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)' }}>
                Time: {assignment.scheduledTime || '10:30 AM'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)' }}>Assignment Status</div>
              <div style={{ marginTop: '0.2rem' }}>
                <StatusBadge status={assignment.status} />
              </div>
              {assignment.rejectionReason && (
                <div style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '0.25rem' }}>
                  Rejection Reason: {assignment.rejectionReason}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ background: 'rgba(245, 158, 11, 0.16)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.35)', color: '#fbbf24', fontSize: '0.9rem' }}>
            No verification authority assigned yet. Click "Assign Authority" above to allocate to an LMO or GATC.
          </div>
        )}
      </div>

      {/* Assignment & Reassignment Audit Timeline */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.05rem', color: '#ffffff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <History size={18} color="#06b6d4" />
          <span>Allocation & Reassignment History Timeline</span>
        </h3>

        {assignmentHistory.length === 0 ? (
          <div style={{ color: 'var(--secondary-text)', fontSize: '0.85rem' }}>
            No reassignment events recorded. Application is in initial allocation state.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
            {assignmentHistory.map((item, idx) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  gap: '1rem',
                  paddingLeft: '1.5rem',
                  position: 'relative',
                  borderLeft: '2px solid rgba(255, 255, 255, 0.15)',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: -7,
                    top: 2,
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: item.authorityType === 'GATC' ? '#0F766E' : '#2563EB',
                    boxShadow: `0 0 8px ${item.authorityType === 'GATC' ? '#0F766E' : '#2563EB'}`,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.45rem',
                        borderRadius: 4,
                        background: item.action === 'REASSIGNED' ? 'rgba(234, 88, 12, 0.2)' : item.action === 'ACCEPTED' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(14, 165, 233, 0.2)',
                        color: item.action === 'REASSIGNED' ? '#fb923c' : item.action === 'ACCEPTED' ? '#34d399' : '#38bdf8',
                        marginRight: '0.5rem',
                      }}>
                        {item.action}
                      </span>
                      <span style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.85rem' }}>
                        {item.authorityType === 'GATC' ? (item.gatcName || 'GATC Test Centre') : (item.officerName || 'Inspector')}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {new Date(item.assignedAt).toLocaleString()}
                    </div>
                  </div>

                  {item.reason && (
                    <div style={{ fontSize: '0.8rem', color: '#e2e8f0', marginTop: '0.35rem', background: 'rgba(255,255,255,0.03)', padding: '0.4rem 0.6rem', borderRadius: 4 }}>
                      <span style={{ color: 'var(--secondary-text)' }}>Remarks:</span> {item.reason}
                    </div>
                  )}

                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem' }}>
                    Logged by: {item.assignedBy}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dual Authority Allocation Modal */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 580 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={18} color="#06b6d4" />
                <span>Assign Verification Authority</span>
              </h3>
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
                {/* Authority Type Toggle */}
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label" style={{ fontWeight: 600 }}>
                    Select Verification Authority Type:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.35rem' }}>
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.75rem',
                        borderRadius: 8,
                        background: authorityType === 'LMO' ? 'rgba(37, 99, 235, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                        border: `1px solid ${authorityType === 'LMO' ? '#2563EB' : 'rgba(255, 255, 255, 0.1)'}`,
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="radio"
                        name="authType"
                        checked={authorityType === 'LMO'}
                        onChange={() => setAuthorityType('LMO')}
                      />
                      <div>
                        <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.85rem' }}>LMO (Inspector)</div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Legal Metrology Officer</div>
                      </div>
                    </label>

                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.75rem',
                        borderRadius: 8,
                        background: authorityType === 'GATC' ? 'rgba(15, 118, 110, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                        border: `1px solid ${authorityType === 'GATC' ? '#0F766E' : 'rgba(255, 255, 255, 0.1)'}`,
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="radio"
                        name="authType"
                        checked={authorityType === 'GATC'}
                        onChange={() => setAuthorityType('GATC')}
                      />
                      <div>
                        <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.85rem' }}>GATC Test Centre</div>
                        <div style={{ fontSize: '0.7rem', color: '#2dd4bf' }}>Approved Laboratory</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Authority Dropdown */}
                {authorityType === 'LMO' ? (
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
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
                ) : (
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label">Select Approved GATC Test Centre *</label>
                    {gatcs.length === 0 ? (
                      <div style={{ color: '#f87171', fontSize: '0.8rem', padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 6 }}>
                        No active GATC centres available. Please approve a registered GATC first in GATC Management.
                      </div>
                    ) : (
                      <select
                        className="form-select"
                        value={assignData.gatcId}
                        onChange={(e) => setAssignData({ ...assignData, gatcId: e.target.value })}
                        required
                      >
                        {gatcs.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.name} ({g.gatcCode} • {g.district}) [Active Workload: {g.activeWorkload || 0} cases]
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Scheduled Date *</label>
                    <input
                      type="date"
                      className="form-input"
                      value={assignData.scheduledDate}
                      onChange={(e) => setAssignData({ ...assignData, scheduledDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Scheduled Time</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 10:30 AM"
                      value={assignData.scheduledTime}
                      onChange={(e) => setAssignData({ ...assignData, scheduledTime: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Reason / Remarks for Allocation</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Laboratory testing requested; jurisdiction allocation; expedited re-verification..."
                    value={assignData.reason}
                    onChange={(e) => setAssignData({ ...assignData, reason: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                  <label className="form-label">Instructions</label>
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
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={assignLoading || (authorityType === 'GATC' && gatcs.length === 0)}
                  style={{ background: authorityType === 'GATC' ? '#0F766E' : '#2563EB' }}
                >
                  {assignLoading ? 'Saving...' : `Confirm ${authorityType === 'GATC' ? 'GATC' : 'LMO'} Allocation`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
