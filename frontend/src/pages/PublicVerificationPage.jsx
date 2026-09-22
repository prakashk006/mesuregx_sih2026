import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  Award,
  Search,
  Building,
  Scale,
  Calendar,
  UserCheck,
  Clock,
  ExternalLink,
  QrCode,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import QRScannerModal from '../components/QRScannerModal';

export default function PublicVerificationPage() {
  const { certificateNumber } = useParams();
  const [certData, setCertData] = useState(null);
  const [loading, setLoading] = useState(!!certificateNumber);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [showQR, setShowQR] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchPublicCert() {
      if (!certificateNumber) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/public/verify/${certificateNumber.trim()}`);
        setCertData(res.data?.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Certificate record not found.');
        setCertData(null);
      } finally {
        setLoading(false);
      }
    }
    fetchPublicCert();
  }, [certificateNumber]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/verify/${searchInput.trim().toUpperCase()}`);
      setSearchInput('');
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 68px)', background: 'transparent', padding: '2.5rem 1.5rem' }}>
      <div style={{ maxWidth: 840, margin: '0 auto' }}>
        {/* Top Search bar for public user convenience */}
        <div style={{ marginBottom: '2rem' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search another Certificate Number (e.g. CERT-2026-000001)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit" className="btn btn-navy">
              <Search size={16} /> Verify
            </button>
          </form>
        </div>

        {loading ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <div className="brand-badge" style={{ margin: '0 auto 1rem', width: 48, height: 48 }}>
              M
            </div>
            <h3 style={{ fontSize: '1.25rem', color: '#ffffff' }}>Verifying Certificate Ledger...</h3>
            <p style={{ color: 'var(--secondary-text)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
              Validating cryptographic signatures against Legal Metrology authority
            </p>
          </div>
        ) : !certificateNumber ? (
          <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'rgba(6, 182, 212, 0.15)',
                color: '#06b6d4',
                border: '1px solid rgba(6, 182, 212, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}
            >
              <ShieldCheck size={36} />
            </div>
            <h2 style={{ fontSize: '1.75rem', color: '#ffffff', marginBottom: '0.5rem' }}>
              Public Certificate Verification Portal
            </h2>
            <p style={{ color: 'var(--secondary-text)', maxWidth: 540, margin: '0 auto 2rem', fontSize: '0.95rem' }}>
              Enter any Legal Metrology Certificate Number or scan the physical scale's tamper-evident QR seal to verify its validity, accuracy class, and calibration expiry.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
              <button
                type="button"
                onClick={() => setShowQR(true)}
                className="btn btn-primary btn-lg"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <QrCode size={18} /> Scan Certificate QR Seal
              </button>
            </div>

            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem', maxWidth: 460, margin: '0 auto' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--secondary-text)', marginBottom: '0.75rem' }}>
                Or test with verified demo certificates:
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/verify/CERT-2026-000007" className="btn btn-outline btn-sm">
                  CERT-2026-000007 (Valid)
                </Link>
                <Link to="/verify/CERT-2026-000008" className="btn btn-outline btn-sm">
                  CERT-2026-000008 (Verified)
                </Link>
              </div>
            </div>
          </div>
        ) : error || !certData ? (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem', borderTop: '4px solid #ef4444' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.16)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}
            >
              <XCircle size={36} />
            </div>
            <h2 style={{ fontSize: '1.6rem', color: '#ffffff' }}>Certificate Not Found</h2>
            <p style={{ color: 'var(--secondary-text)', maxWidth: 480, margin: '0.5rem auto 1.5rem', fontSize: '0.95rem' }}>
              The certificate ID <strong>{certificateNumber}</strong> does not exist or has not been issued by the Legal Metrology authority.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button onClick={() => setShowQR(true)} className="btn btn-primary">
                Scan QR Instead
              </button>
              <Link to="/" className="btn btn-outline">
                Return Home
              </Link>
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding: '2.5rem', position: 'relative', overflow: 'hidden' }}>
            {/* Status Banner */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderRadius: '12px',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                background:
                  certData.status === 'VALID'
                    ? 'linear-gradient(135deg, #059669, #10b981)'
                    : certData.status === 'EXPIRING_SOON'
                    ? 'linear-gradient(135deg, #d97706, #f59e0b)'
                    : 'linear-gradient(135deg, #b91c1c, #ef4444)',
                color: 'white',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                {certData.status === 'VALID' ? (
                  <CheckCircle size={36} />
                ) : certData.status === 'EXPIRING_SOON' ? (
                  <AlertTriangle size={36} />
                ) : (
                  <XCircle size={36} />
                )}
                <div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'Outfit' }}>
                    {certData.status === 'VALID' && '✓ CERTIFICATE VALID'}
                    {certData.status === 'EXPIRING_SOON' && '⚠ CERTIFICATE EXPIRING SOON'}
                    {certData.status === 'EXPIRED' && '✕ CERTIFICATE EXPIRED'}
                    {certData.status === 'REVOKED' && '✕ CERTIFICATE REVOKED'}
                  </div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                    {certData.status === 'VALID' && `Digitally authenticated. ${certData.daysRemaining} days remaining.`}
                    {certData.status === 'EXPIRING_SOON' && `Attention: Expires in ${certData.daysRemaining} days.`}
                    {certData.status === 'EXPIRED' && `Expired on ${new Date(certData.expiryDate).toLocaleDateString()}. Periodic re-verification overdue.`}
                    {certData.status === 'REVOKED' && `Revocation reason: ${certData.revocationReason || 'Accuracy defect'}`}
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  fontFamily: 'Outfit',
                  fontWeight: 700,
                  fontSize: '1rem',
                  letterSpacing: '0.05em',
                }}
              >
                {certData.certificateNumber}
              </div>
            </div>

            {/* Certificate Meta Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              {/* Instrument Details */}
              <div style={{ background: 'var(--glass-standard)', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#06b6d4', marginBottom: '0.75rem' }}>
                  <Scale size={18} />
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>
                    Verified Instrument
                  </span>
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                  {certData.instrument.customId}
                </div>
                <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.75)', marginTop: '0.25rem' }}>
                  {certData.instrument.type}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--secondary-text)', marginTop: '0.5rem' }}>
                  <div><strong>Make:</strong> {certData.instrument.manufacturer} {certData.instrument.model}</div>
                  <div><strong>Serial No:</strong> {certData.instrument.serialNumber}</div>
                  <div><strong>Capacity:</strong> {certData.instrument.capacity} (Class: {certData.instrument.accuracyClass})</div>
                </div>
              </div>

              {/* Business Details */}
              <div style={{ background: 'var(--glass-standard)', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#06b6d4', marginBottom: '0.75rem' }}>
                  <Building size={18} />
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>
                    Certified Trade Establishment
                  </span>
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                  {certData.business.name}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--secondary-text)', marginTop: '0.5rem' }}>
                  <div><strong>Location:</strong> {certData.business.location}</div>
                  <div><strong>Verified Under:</strong> Legal Metrology Act 2009</div>
                </div>
              </div>
            </div>

            {/* Inspection Timeline & Officer */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem',
                borderTop: '1px solid var(--glass-border)',
                paddingTop: '1.5rem',
                marginBottom: '1.5rem',
              }}
            >
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--secondary-text)' }}>Verification Date</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
                  {new Date(certData.issueDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--secondary-text)' }}>Valid Until</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#22c55e' }}>
                  {new Date(certData.expiryDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--secondary-text)' }}>Inspected By</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
                  {certData.officer.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)' }}>
                  {certData.officer.officerCode} ({certData.officer.district})
                </div>
              </div>
            </div>

            {/* Verification Security Watermark / Seal */}
            <div
              style={{
                background: 'var(--glass-subtle)',
                borderRadius: '10px',
                padding: '0.85rem 1rem',
                border: '1px solid var(--glass-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.5rem',
                fontSize: '0.78rem',
                color: 'var(--secondary-text)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={16} color="#22c55e" />
                <span style={{ color: '#ffffff' }}>Verified by Legal Metrology Digital Trust Authority</span>
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#06b6d4' }}>
                Sig: {certData.digitalSignature?.slice(0, 32)}...
              </div>
            </div>

            {/* Consumer Vigilance CTA */}
            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <Link
                to={`/report-concern?cert=${certData.certificateNumber}`}
                className="btn btn-outline"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.4)' }}
              >
                <AlertTriangle size={15} /> Report a Concern or Inaccuracy Regarding This Instrument
              </Link>
            </div>
          </div>
        )}
      </div>

      <QRScannerModal isOpen={showQR} onClose={() => setShowQR(false)} />
    </div>
  );
}
