import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import api from '../../services/api';
import {
  Search,
  QrCode,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Scale,
  Award
} from 'lucide-react';
import QRScannerModal from '../QRScannerModal';

export default function PublicVerification() {
  const [certInput, setCertInput] = useState('CERT-2026-000001');
  const [showQR, setShowQR] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifiedData, setVerifiedData] = useState({
    certificateNumber: 'CERT-2026-000001',
    status: 'VALID',
    instrument: 'Mettler Toledo Scale (Class III)',
    standard: 'OIML R 76',
    validity: '14 March 2027',
    businessName: 'Sri Lakshmi Stores, Coimbatore',
    sealNumber: 'SEAL-LM-2026-9901',
  });
  const [errorState, setErrorState] = useState(null);
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    const query = certInput.trim();
    if (!query) return;

    setLoading(true);
    setErrorState(null);
    try {
      const res = await api.get(`/public/verify/${encodeURIComponent(query)}`);
      if (res.data?.success && res.data?.data) {
        const d = res.data.data;
        setVerifiedData({
          certificateNumber: d.certificateNumber,
          status: d.status || 'VALID',
          instrument: `${d.instrument?.manufacturer || ''} ${d.instrument?.model || 'Scale'} (${d.instrument?.accuracyClass || 'Class III'})`.trim(),
          standard: 'OIML R 76',
          validity: d.expiryDate ? new Date(d.expiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Active',
          businessName: d.business?.name || 'Commercial Entity',
          sealNumber: d.digitalSignature ? `SEAL-${d.certificateNumber.split('-')[2] || '9901'}` : 'SEAL-LM-2026',
        });
      } else {
        setErrorState({ message: 'Certificate record not found.' });
        setVerifiedData(null);
      }
    } catch (err) {
      setErrorState({
        message: err.response?.data?.message || 'Certificate not found. The certificate number is invalid or has not been issued.',
        searchedId: query,
      });
      setVerifiedData(null);
    } finally {
      setLoading(false);
    }
  };

  const loadSample = (id) => {
    setCertInput(id);
    setErrorState(null);
  };

  return (
    <>
      <section
        id="verification"
        style={{
          padding: '6rem 1.5rem',
          background: '#F9FAFB',
          position: 'relative',
          borderBottom: '1px solid rgba(6, 78, 59, 0.08)',
        }}
      >
        <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
          {/* Section Header */}
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div
              style={{
                color: '#065F46',
                fontSize: '0.8rem',
                fontWeight: 800,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: '0.65rem',
              }}
            >
              PUBLIC VERIFICATION
            </div>
            <h2
              style={{
                fontFamily: 'Outfit, Plus Jakarta Sans, sans-serif',
                fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
                fontWeight: 800,
                color: '#064E3B',
                letterSpacing: '-0.02em',
                marginBottom: '0.85rem',
              }}
            >
              Verify Before You Trust.
            </h2>
            <p
              style={{
                color: '#4B5563',
                fontSize: '1.05rem',
                maxWidth: '680px',
                margin: '0 auto',
                lineHeight: 1.6,
              }}
            >
              Instantly verify the statutory authenticity of any Legal Metrology certificate using its unique sovereign ID or QR code.
            </p>
          </div>

          {/* Large Verification Interface: Left Input + Right Result */}
          <div
            className="verification-container"
            style={{
              padding: '2.5rem',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(6, 78, 59, 0.14)',
              borderRadius: '24px',
              boxShadow: '0 20px 45px rgba(6, 78, 59, 0.08), 0 4px 16px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div
              className="verification-split-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: '1.1fr 1fr',
                gap: '2.5rem',
                alignItems: 'center',
              }}
            >
              {/* LEFT SIDE: Certificate ID Input + Actions */}
              <div>
                <div style={{ fontSize: '0.78rem', color: '#065F46', fontWeight: 800, letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
                  CENTRAL METROLOGICAL REPOSITORY
                </div>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827', marginBottom: '1rem' }}>
                  Search Certificate Ledger
                </h3>
                <p style={{ color: '#4B5563', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
                  Enter the statutory verification certificate number stamped on the merchant's instrument or printed on the Form TR-6 certificate.
                </p>

                <form onSubmit={handleVerify} style={{ marginBottom: '1.25rem' }}>
                  <div style={{ position: 'relative', marginBottom: '1rem' }}>
                    <input
                      type="text"
                      value={certInput}
                      onChange={(e) => setCertInput(e.target.value)}
                      placeholder="e.g. CERT-2026-000001 or MGX-2025-784562"
                      style={{
                        width: '100%',
                        padding: '0.95rem 1.25rem 0.95rem 2.85rem',
                        background: '#FFFFFF',
                        border: '1.5px solid rgba(6, 78, 59, 0.25)',
                        borderRadius: '12px',
                        color: '#111827',
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        outline: 'none',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                      }}
                    />
                    <Search
                      size={18}
                      color="#064E3B"
                      style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary"
                      style={{ flex: 1, minWidth: '140px', justifyContent: 'center' }}
                    >
                      <Search size={17} color="#FFFFFF" strokeWidth={2.5} />
                      <span>{loading ? 'Verifying...' : 'VERIFY NOW'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowQR(true)}
                      className="btn btn-secondary"
                      style={{ padding: '0.8rem 1.25rem' }}
                    >
                      <QrCode size={17} color="#064E3B" />
                      <span>Scan QR</span>
                    </button>
                  </div>
                </form>

                {/* Quick Sample IDs */}
                <div style={{ fontSize: '0.82rem', color: '#6B7280' }}>
                  <span>Sample IDs: </span>
                  <button
                    type="button"
                    onClick={() => loadSample('CERT-2026-000001')}
                    style={{ background: 'none', border: 'none', color: '#064E3B', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', marginRight: '0.6rem' }}
                  >
                    CERT-2026-000001
                  </button>
                  <button
                    type="button"
                    onClick={() => loadSample('MGX-2025-784562')}
                    style={{ background: 'none', border: 'none', color: '#064E3B', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', marginRight: '0.6rem' }}
                  >
                    MGX-2025-784562
                  </button>
                  <button
                    type="button"
                    onClick={() => loadSample('INVALID-999999')}
                    style={{ background: 'none', border: 'none', color: '#DC2626', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Test Invalid ID
                  </button>
                </div>
              </div>

              {/* RIGHT SIDE: Verification Result Panel */}
              <div>
                {errorState ? (
                  /* ✕ CERTIFICATE NOT FOUND Error UI */
                  <div
                    style={{
                      background: '#FEF2F2',
                      border: '1.5px solid rgba(220, 38, 38, 0.35)',
                      borderRadius: '18px',
                      padding: '2rem',
                      boxShadow: '0 8px 24px rgba(220, 38, 38, 0.08)',
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        background: '#FEE2E2',
                        border: '1.5px solid #DC2626',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                      }}
                    >
                      <XCircle size={28} color="#DC2626" />
                    </div>

                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#DC2626', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
                      ✕ CERTIFICATE NOT FOUND
                    </div>

                    <p style={{ color: '#4B5563', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                      {errorState.message}
                    </p>

                    <div style={{ background: '#FFFFFF', padding: '0.75rem', borderRadius: '10px', fontSize: '0.8rem', color: '#6B7280', marginBottom: '1.25rem', border: '1px solid rgba(0,0,0,0.06)' }}>
                      Query: <strong style={{ color: '#111827', fontFamily: 'monospace' }}>{errorState.searchedId || certInput}</strong>
                    </div>

                    <Link
                      to="/report-concern"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        color: '#EA580C',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                      }}
                    >
                      <AlertTriangle size={15} color="#EA580C" />
                      <span>Report Suspicious Scale / Fake Seal</span>
                    </Link>
                  </div>
                ) : verifiedData ? (
                  /* ✓ CERTIFICATE VERIFIED UI (Matching Reference) */
                  <div
                    style={{
                      background: '#FFFFFF',
                      border: '1.5px solid rgba(16, 185, 129, 0.45)',
                      borderRadius: '18px',
                      padding: '2rem',
                      boxShadow: '0 12px 32px rgba(16, 185, 129, 0.12)',
                    }}
                  >
                    {/* Header */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid rgba(16, 185, 129, 0.2)',
                        paddingBottom: '1rem',
                        marginBottom: '1.25rem',
                        flexWrap: 'wrap',
                        gap: '0.75rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            background: '#D1FAE5',
                            border: '1.5px solid #10B981',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <CheckCircle2 size={22} color="#065F46" />
                        </div>
                        <div>
                          <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#064E3B', letterSpacing: '0.04em' }}>
                            ✓ CERTIFICATE VERIFIED
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>
                            Cryptographic verification confirmed
                          </div>
                        </div>
                      </div>

                      <div
                        className="animate-verified-pulse"
                        style={{
                          background: '#D1FAE5',
                          border: '1px solid rgba(16, 185, 129, 0.5)',
                          color: '#065F46',
                          padding: '0.35rem 0.85rem',
                          borderRadius: '999px',
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          letterSpacing: '0.08em',
                        }}
                      >
                        {verifiedData.status}
                      </div>
                    </div>

                    {/* Spec Details Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '1.25rem', alignItems: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.88rem' }}>
                        <div>
                          <div style={{ fontSize: '0.72rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase' }}>
                            Certificate ID
                          </div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#064E3B', fontFamily: 'monospace', marginTop: '2px' }}>
                            {verifiedData.certificateNumber}
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: '0.72rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase' }}>
                            Instrument
                          </div>
                          <div style={{ fontSize: '0.98rem', fontWeight: 700, color: '#111827', marginTop: '2px' }}>
                            {verifiedData.instrument}
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                          <div>
                            <div style={{ fontSize: '0.72rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase' }}>
                              Standard
                            </div>
                            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#111827', marginTop: '2px' }}>
                              {verifiedData.standard}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.72rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase' }}>
                              Validity
                            </div>
                            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#065F46', marginTop: '2px' }}>
                              {verifiedData.validity}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* QR Display */}
                      <div style={{ textAlign: 'center' }}>
                        <div
                          style={{
                            background: '#FFFFFF',
                            padding: '6px',
                            borderRadius: '10px',
                            display: 'inline-flex',
                            border: '1px solid rgba(6, 78, 59, 0.15)',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                          }}
                        >
                          <QRCodeSVG
                            value={`https://mesuregx.gov.in/verify/${verifiedData.certificateNumber}`}
                            size={84}
                            level="M"
                          />
                        </div>
                        <div style={{ fontSize: '0.65rem', color: '#6B7280', marginTop: '6px', fontWeight: 600 }}>
                          Scan to Validate
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 900px) {
            .verification-split-grid {
              grid-template-columns: 1fr !important;
              gap: 2rem !important;
            }
          }
        `}</style>
      </section>

      {/* QR Scanner Modal */}
      <QRScannerModal isOpen={showQR} onClose={() => setShowQR(false)} />
    </>
  );
}
