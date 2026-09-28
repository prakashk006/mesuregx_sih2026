import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Printer, ShieldCheck, Download, Award, History, ExternalLink, Building2, Scale, Calendar, CheckCircle } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function DigitalCertificateModal({ certificate, isOpen, onClose, onViewHistory }) {
  if (!isOpen || !certificate) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Generate a printable download or trigger print
    window.print();
  };

  const certNumber = certificate.certificateNumber || 'CERT-2026-000001';
  const qrUrl = certificate.qrCodeData || `${window.location.origin}/verify/${certNumber}`;
  const status = certificate.status || certificate.dynamicStatus || 'VALID';
  const isSuperseded = status === 'SUPERSEDED' || certificate.isCurrent === false;
  const isLMO = certificate.issuedByType !== 'GATC';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 860, padding: 0 }}
      >
        {/* Header Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 1.5rem',
            borderBottom: '1px solid var(--glass-border)',
            background: 'linear-gradient(135deg, #064E3B 0%, #0F766E 100%)',
            color: '#ffffff',
          }}
          className="no-print"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Award size={22} style={{ color: '#10B981' }} />
            <div>
              <span style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '0.02em' }}>
                Digital Verification Certificate
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  marginLeft: '0.5rem',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '999px',
                  background: isSuperseded ? 'rgba(255,255,255,0.2)' : 'rgba(16, 185, 129, 0.3)',
                  fontWeight: 700,
                }}
              >
                {isSuperseded ? 'HISTORICAL RECORD' : 'CURRENT ACTIVE'}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {onViewHistory && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onViewHistory(certificate);
                }}
                className="btn btn-navy btn-sm"
                title="View Full Instrument Certificate History"
              >
                <History size={14} /> View History
              </button>
            )}
            <button type="button" onClick={handleDownload} className="btn btn-navy btn-sm">
              <Download size={14} /> Download PDF
            </button>
            <button type="button" onClick={handlePrint} className="btn btn-primary btn-sm">
              <Printer size={14} /> Print
            </button>
            <button type="button" onClick={onClose} className="btn btn-outline btn-sm" style={{ border: 'none', color: '#ffffff' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        <div style={{ padding: '2rem', maxHeight: '80vh', overflowY: 'auto' }}>
          {/* Historical Status Alert if Superseded */}
          {isSuperseded && (
            <div
              className="no-print"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.85rem 1.25rem',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                marginBottom: '1.25rem',
                fontSize: '0.85rem',
                color: '#475569',
              }}
            >
              <History size={18} color="#64748b" />
              <div>
                <strong>Archival / Historical Record:</strong> This verification certificate has been succeeded by a subsequent periodic re-verification. It is retained permanently in the digital ledger for historical compliance.
              </div>
            </div>
          )}

          {/* Formal Printable Certificate Frame */}
          <div className="certificate-frame" id="printable-certificate">
            <div className="certificate-watermark">
              {isSuperseded ? 'ARCHIVED' : 'MESUREGX VERIFIED'}
            </div>

            <div className="certificate-header">
              <div className="certificate-seal">
                <ShieldCheck size={44} />
              </div>
              <div className="certificate-title">MESUREGX</div>
              <div className="certificate-subtitle">
                Department of Legal Metrology & Standards — Digital Verification Certificate
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '1rem',
                  marginTop: '0.75rem',
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#064E3B' }}>
                  Certificate No: {certNumber}
                </span>
                <StatusBadge status={status} size="lg" />
              </div>
            </div>

            {/* Top Operational Info Bar: Application ID, Verification Type, Authority */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                background: '#f8fafc',
                padding: '0.85rem 1.25rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                marginBottom: '1.5rem',
                fontSize: '0.85rem',
              }}
            >
              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>
                  Application Number
                </span>
                <strong style={{ color: '#0f172a' }}>
                  {certificate.application?.applicationNumber || certificate.applicationNumber || 'APP-OFFICIAL'}
                </strong>
              </div>

              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>
                  Verification Type
                </span>
                <strong style={{ color: '#0f172a' }}>
                  {certificate.application?.applicationType || certificate.verificationType || 'Periodic Verification'}
                </strong>
              </div>

              <div>
                <span style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>
                  Verification Authority
                </span>
                <strong style={{ color: '#064E3B' }}>
                  {isLMO ? 'Legal Metrology Officer (LMO)' : 'Government Approved Test Centre (GATC)'}
                </strong>
              </div>
            </div>

            {/* Certificate Details Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem',
                marginBottom: '1.75rem',
              }}
            >
              {/* Business Information */}
              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '0.85rem', color: '#064E3B', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
                  Certified Business / Establishment
                </h4>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                  {certificate.business?.name || certificate.business?.businessName || 'Business Establishment'}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.35rem' }}>
                  <strong>Owner / Trader:</strong> {certificate.business?.ownerName || 'Licensed Trader'}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.35rem', lineHeight: 1.5 }}>
                  {certificate.business?.address || certificate.business?.city || 'Registered Commercial Premises'}
                </div>
              </div>

              {/* Instrument Information */}
              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '0.85rem', color: '#064E3B', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
                  Measuring Instrument Details
                </h4>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                  {certificate.instrument?.customId || 'WX-1001'} — {certificate.instrument?.name || certificate.instrument?.type || 'Measuring Scale'}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.35rem' }}>
                  <strong>Make & Model:</strong> {certificate.instrument?.manufacturer || 'Standard'} {certificate.instrument?.model || ''}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.25rem' }}>
                  <strong>Serial Number:</strong> {certificate.instrument?.serialNumber || 'N/A'}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.25rem' }}>
                  <strong>Capacity & Accuracy:</strong> {certificate.instrument?.capacity || '30 kg'} (Class: {certificate.instrument?.accuracyClass || 'III'})
                </div>
                {certificate.instrument?.installationLocation && (
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                    <strong>Premises Location:</strong> {certificate.instrument.installationLocation}
                  </div>
                )}
              </div>
            </div>

            {/* Verification Validity & QR Row */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1.5rem',
                borderTop: '1px solid #e2e8f0',
                borderBottom: '1px solid #e2e8f0',
                padding: '1.25rem 0',
                marginBottom: '1.5rem',
              }}
            >
              <div>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Date of Inspection & Issue</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                  {new Date(certificate.issueDate || Date.now()).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>

                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.75rem' }}>Valid Until Calibration Expiry</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#059669' }}>
                  {new Date(certificate.expiryDate || Date.now()).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
              </div>

              {/* High-Contrast QR Code */}
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    background: 'white',
                    padding: '8px',
                    borderRadius: '8px',
                    border: '2px solid #064E3B',
                    display: 'inline-block',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  }}
                >
                  <QRCodeSVG value={qrUrl} size={110} level="H" includeMargin={false} />
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#064E3B', marginTop: '0.35rem' }}>
                  Scan to Verify Online
                </div>
              </div>
            </div>

            {/* Signatures & Disclaimers */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                marginTop: '1.5rem',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', maxWidth: 400, lineHeight: 1.5 }}>
                  Digitally issued under the Legal Metrology Act 2009 & General Rules 2011.
                  Tamper-evident verification available publicly via MESUREGX QR scan.
                </div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '0.35rem', fontFamily: 'monospace' }}>
                  Sig: {certificate.digitalSignature || 'SHA256:VERIFIED_STAMP_OK'}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                {isLMO ? (
                  <>
                    <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>
                      {certificate.officer?.name || 'Inspector R. Natarajan'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                      {certificate.officer?.designation || 'Senior Inspector of Legal Metrology'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      ID: {certificate.officer?.code || certificate.officer?.officerCode || 'OFF-TN-042'}
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>
                      {certificate.gatcName || certificate.gatc?.name || 'National Test House Lab'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                      Accredited Testing & Calibration Centre
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Auth No: {certificate.gatc?.authorizationNo || 'GATC-AUTH-2026-TN-042'}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
