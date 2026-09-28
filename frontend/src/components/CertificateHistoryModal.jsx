import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  History,
  X,
  Award,
  Calendar,
  ShieldCheck,
  CheckCircle,
  Clock,
  ExternalLink,
  Printer,
  ChevronRight,
  Scale,
  Building,
  AlertCircle,
  FileCheck,
  Layers,
} from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function CertificateHistoryModal({
  instrumentId,
  certificateId,
  applicationId,
  isOpen,
  onClose,
  onOpenCertificate,
}) {
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'timeline'

  useEffect(() => {
    async function fetchHistory() {
      if (!isOpen) return;
      setLoading(true);
      setError('');
      try {
        let endpoint = '';
        if (instrumentId) {
          endpoint = `/instruments/${instrumentId}/certificates`;
        } else if (certificateId) {
          endpoint = `/certificates/${certificateId}/history`;
        } else if (applicationId) {
          endpoint = `/applications/${applicationId}/certificates`;
        } else {
          return;
        }

        const res = await api.get(endpoint);
        setHistoryData(res.data?.data);
      } catch (err) {
        console.error('Failed to load history:', err);
        setError(err.response?.data?.message || 'Failed to load certificate history.');
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [isOpen, instrumentId, certificateId, applicationId]);

  if (!isOpen) return null;

  const instrument = historyData?.instrument;
  const currentCert = historyData?.currentCertificate;
  const historicalCerts = historyData?.historicalCertificates || [];
  const allCerts = historyData?.certificates || [];
  const timeline = historyData?.timeline || [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 880, padding: 0 }}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid var(--glass-border)',
            background: 'linear-gradient(135deg, #064E3B 0%, #0F766E 100%)',
            color: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <History size={24} style={{ color: '#10B981' }} />
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                Certificate History & Verification Lifecycle
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(255,255,255,0.8)' }}>
                Permanent chronological ledger of initial verifications and periodic re-certifications
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-outline btn-sm"
            style={{ border: 'none', color: '#ffffff' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.75rem', maxHeight: '82vh', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
              <div className="brand-badge" style={{ margin: '0 auto 1rem', width: 44, height: 44 }}>
                M
              </div>
              <h4 style={{ fontSize: '1.1rem', color: '#0f172a' }}>Loading Certificate History...</h4>
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                Querying metrology ledger for instrument succession records
              </p>
            </div>
          ) : error ? (
            <div
              style={{
                padding: '1.25rem',
                background: '#fee2e2',
                borderRadius: '8px',
                color: '#b91c1c',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <AlertCircle size={20} />
              <div>{error}</div>
            </div>
          ) : !instrument ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: '#64748b' }}>No instrument records available.</p>
            </div>
          ) : (
            <>
              {/* Instrument Header Summary Card */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1.25rem 1.5rem',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <Scale size={18} color="#064E3B" />
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                      {instrument.customId}
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.6rem',
                        background: '#e0e7ff',
                        color: '#3730a3',
                        borderRadius: '999px',
                      }}
                    >
                      {instrument.type || 'Weighing Scale'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                    <strong>{instrument.manufacturer}</strong> {instrument.model} • S/N: {instrument.serialNumber} • Capacity: {instrument.capacity} (Class: {instrument.accuracyClass})
                  </div>
                  {instrument.business && (
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                      Establishment: <strong>{instrument.business.name}</strong> ({instrument.business.district || instrument.business.city})
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setActiveTab('list')}
                    className={`btn btn-sm ${activeTab === 'list' ? 'btn-primary' : 'btn-outline'}`}
                  >
                    <Layers size={14} /> Certificate Ledger ({allCerts.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('timeline')}
                    className={`btn btn-sm ${activeTab === 'timeline' ? 'btn-primary' : 'btn-outline'}`}
                  >
                    <History size={14} /> Lifecycle Timeline
                  </button>
                </div>
              </div>

              {/* TAB 1: CERTIFICATE LEDGER VIEW (CURRENT & HISTORICAL) */}
              {activeTab === 'list' && (
                <div>
                  {/* Current Active Certificate Card */}
                  {currentCert && (
                    <div style={{ marginBottom: '2rem' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginBottom: '0.75rem',
                        }}
                      >
                        <span
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            background: '#10B981',
                            display: 'inline-block',
                            boxShadow: '0 0 8px #10B981',
                          }}
                        />
                        <h4
                          style={{
                            fontSize: '0.9rem',
                            fontWeight: 800,
                            color: '#064E3B',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            margin: 0,
                          }}
                        >
                          Current Active Certificate
                        </h4>
                      </div>

                      <div
                        style={{
                          background: '#ffffff',
                          border: '2px solid #10B981',
                          borderRadius: '12px',
                          padding: '1.25rem 1.5rem',
                          boxShadow: '0 4px 16px rgba(16, 185, 129, 0.12)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '1rem',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#064E3B' }}>
                              {currentCert.certificateNumber}
                            </span>
                            <StatusBadge status={currentCert.status} />
                            <span
                              style={{
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                background: '#d1fae5',
                                color: '#065f46',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px',
                                textTransform: 'uppercase',
                              }}
                            >
                              Current
                            </span>
                          </div>

                          <div
                            style={{
                              display: 'flex',
                              gap: '1.5rem',
                              marginTop: '0.65rem',
                              fontSize: '0.85rem',
                              color: '#475569',
                              flexWrap: 'wrap',
                            }}
                          >
                            <div>
                              <span style={{ color: '#64748b' }}>Verification Type: </span>
                              <strong>{currentCert.application?.applicationType || 'Periodic Verification'}</strong>
                            </div>
                            <div>
                              <span style={{ color: '#64748b' }}>Issued: </span>
                              <strong>{new Date(currentCert.issueDate).toLocaleDateString()}</strong>
                            </div>
                            <div>
                              <span style={{ color: '#64748b' }}>Valid Until: </span>
                              <strong style={{ color: '#059669' }}>
                                {new Date(currentCert.expiryDate).toLocaleDateString()}
                              </strong>
                            </div>
                            <div>
                              <span style={{ color: '#64748b' }}>Authority: </span>
                              <strong style={{ color: '#064E3B' }}>{currentCert.authority}</strong>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <button
                            type="button"
                            onClick={() => onOpenCertificate && onOpenCertificate(currentCert)}
                            className="btn btn-primary btn-sm"
                          >
                            <Award size={14} /> View Certificate
                          </button>
                          <Link
                            to={`/verify/${currentCert.certificateNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline btn-sm"
                            title="Open Public QR Ledger Verification"
                          >
                            <ExternalLink size={14} /> Verify QR
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Historical Certificates Section */}
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.75rem',
                      }}
                    >
                      <span
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background: '#94a3b8',
                          display: 'inline-block',
                        }}
                      />
                      <h4
                        style={{
                          fontSize: '0.9rem',
                          fontWeight: 800,
                          color: '#475569',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          margin: 0,
                        }}
                      >
                        Historical Certificates ({historicalCerts.length})
                      </h4>
                    </div>

                    {historicalCerts.length === 0 ? (
                      <div
                        style={{
                          background: '#f8fafc',
                          padding: '2rem',
                          textAlign: 'center',
                          borderRadius: '8px',
                          border: '1px dashed #cbd5e1',
                          color: '#64748b',
                          fontSize: '0.9rem',
                        }}
                      >
                        No historical certificates yet. This is the initial verification for this instrument. Previous certificates will be preserved here when subsequent re-verifications occur.
                      </div>
                    ) : (
                      <div className="table-container" style={{ border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>Certificate ID</th>
                              <th>Verification Type</th>
                              <th>Issue Date</th>
                              <th>Valid Until</th>
                              <th>Authority</th>
                              <th>Status</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {historicalCerts.map((cert) => (
                              <tr key={cert.id} style={{ background: '#fafafa' }}>
                                <td>
                                  <strong style={{ color: '#334155' }}>{cert.certificateNumber}</strong>
                                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                                    App: {cert.application?.applicationNumber || 'N/A'}
                                  </div>
                                </td>
                                <td style={{ fontSize: '0.85rem' }}>
                                  {cert.application?.applicationType || 'Periodic Verification'}
                                </td>
                                <td style={{ fontSize: '0.85rem' }}>
                                  {new Date(cert.issueDate).toLocaleDateString()}
                                </td>
                                <td style={{ fontSize: '0.85rem' }}>
                                  {new Date(cert.expiryDate).toLocaleDateString()}
                                </td>
                                <td>
                                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#064E3B' }}>
                                    {cert.issuedByType === 'GATC' ? 'GATC' : 'LMO'}
                                  </div>
                                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                    {cert.authority}
                                  </div>
                                </td>
                                <td>
                                  <StatusBadge status={cert.status || 'SUPERSEDED'} />
                                </td>
                                <td>
                                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                                    <button
                                      type="button"
                                      onClick={() => onOpenCertificate && onOpenCertificate(cert)}
                                      className="btn btn-navy btn-sm"
                                      title="View Archival Certificate"
                                    >
                                      <Award size={13} /> View
                                    </button>
                                    <Link
                                      to={`/verify/${cert.certificateNumber}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="btn btn-outline btn-sm"
                                      title="Public Verification"
                                    >
                                      <ExternalLink size={13} />
                                    </Link>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: LIFECYCLE TIMELINE VIEW */}
              {activeTab === 'timeline' && (
                <div style={{ padding: '0.5rem 0' }}>
                  <div style={{ position: 'relative', marginLeft: '1.5rem', borderLeft: '2px solid #e2e8f0', paddingLeft: '1.75rem' }}>
                    {timeline.map((evt, idx) => (
                      <div key={evt.id || idx} style={{ marginBottom: '1.75rem', position: 'relative' }}>
                        {/* Timeline Bullet Node */}
                        <div
                          style={{
                            position: 'absolute',
                            left: '-2.45rem',
                            top: '0.15rem',
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            background:
                              evt.type === 'CERTIFICATE_ISSUED'
                                ? (evt.badge === 'CURRENT ACTIVE' ? '#10B981' : '#64748b')
                                : evt.type === 'VERIFICATION'
                                ? '#0F766E'
                                : evt.type === 'APPLICATION'
                                ? '#2563EB'
                                : '#EA580C',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 0 0 4px #ffffff, 0 2px 6px rgba(0,0,0,0.1)',
                          }}
                        >
                          {evt.type === 'CERTIFICATE_ISSUED' ? (
                            <Award size={12} />
                          ) : evt.type === 'VERIFICATION' ? (
                            <ShieldCheck size={12} />
                          ) : evt.type === 'APPLICATION' ? (
                            <FileCheck size={12} />
                          ) : (
                            <Scale size={12} />
                          )}
                        </div>

                        {/* Timeline Event Content Card */}
                        <div
                          style={{
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '10px',
                            padding: '1rem 1.25rem',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
                              {evt.title}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  padding: '0.15rem 0.5rem',
                                  borderRadius: '4px',
                                  background: '#f1f5f9',
                                  color: '#334155',
                                  textTransform: 'uppercase',
                                }}
                              >
                                {evt.badge || evt.type}
                              </span>
                              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                {new Date(evt.date).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                          </div>

                          <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
                            {evt.description}
                          </div>

                          {evt.certificateId && (
                            <div style={{ marginTop: '0.75rem' }}>
                              <button
                                type="button"
                                onClick={() => {
                                  const certMatch = allCerts.find((c) => c.id === evt.certificateId);
                                  if (certMatch && onOpenCertificate) {
                                    onOpenCertificate(certMatch);
                                  }
                                }}
                                className="btn btn-outline btn-sm"
                              >
                                <Award size={13} /> View {evt.certificateNumber}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <button type="button" onClick={onClose} className="btn btn-outline">
            Close History
          </button>
        </div>
      </div>
    </div>
  );
}
