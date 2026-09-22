import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Printer, ShieldCheck, Download, Award } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function DigitalCertificateModal({ certificate, isOpen, onClose }) {
  if (!isOpen || !certificate) return null;

  const handlePrint = () => {
    window.print();
  };

  const certNumber = certificate.certificateNumber || 'CERT-2026-000001';
  const qrUrl = certificate.qrCodeData || `${window.location.origin}/verify/${certNumber}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 840, padding: 0 }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 1.5rem',
            borderBottom: '1px solid var(--glass-border)',
            background: 'rgba(7, 20, 38, 0.95)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={20} style={{ color: '#06b6d4' }} />
            <span style={{ fontWeight: 700, color: '#ffffff' }}>
              Digital Verification Certificate Preview
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={handlePrint} className="btn btn-navy btn-sm">
              <Printer size={14} /> Print / Save PDF
            </button>
            <button onClick={onClose} className="btn btn-outline btn-sm" style={{ border: 'none' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        <div style={{ padding: '2rem', maxHeight: '80vh', overflowY: 'auto' }}>
          {/* Formal Printable Certificate Frame */}
          <div className="certificate-frame" id="printable-certificate">
            <div className="certificate-watermark">MESUREGX VERIFIED</div>

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
                }}
              >
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e3a8a' }}>
                  Certificate No: {certNumber}
                </span>
                <StatusBadge status={certificate.status || certificate.dynamicStatus || 'VALID'} size="lg" />
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
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '0.85rem', color: '#1e3a8a', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
                  Business / Establishment
                </h4>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                  {certificate.business?.name || certificate.business?.businessName || 'Business Establishment'}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.25rem' }}>
                  <strong>Owner:</strong> {certificate.business?.ownerName || 'Licensed Trader'}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                  {certificate.business?.address || certificate.business?.city || 'Registered Premises'}
                </div>
              </div>

              {/* Instrument Information */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '0.85rem', color: '#1e3a8a', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
                  Measuring Instrument
                </h4>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                  {certificate.instrument?.customId || 'WX-1001'} — {certificate.instrument?.name || certificate.instrument?.type || 'Weighing Scale'}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.25rem' }}>
                  <strong>Make / Model:</strong> {certificate.instrument?.manufacturer || 'Standard'} {certificate.instrument?.model || ''}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.25rem' }}>
                  <strong>Serial Number:</strong> {certificate.instrument?.serialNumber || 'N/A'}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.25rem' }}>
                  <strong>Capacity & Class:</strong> {certificate.instrument?.capacity || '30 kg'} (Accuracy Class: {certificate.instrument?.accuracyClass || 'III'})
                </div>
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
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Date of Verification</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                  {new Date(certificate.issueDate || Date.now()).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>

                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem' }}>Valid Until</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#059669' }}>
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
                    border: '2px solid #0f172a',
                    display: 'inline-block',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  }}
                >
                  <QRCodeSVG value={qrUrl} size={110} level="H" includeMargin={false} />
                </div>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#1e3a8a', marginTop: '0.35rem' }}>
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
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', maxWidth: 360 }}>
                  Digitally generated and verified under the Legal Metrology Framework.
                  Tamper-evident verification available publicly via MESUREGX QR scan.
                </div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '0.35rem', fontFamily: 'monospace' }}>
                  Sig: {certificate.digitalSignature || 'SHA256:VERIFIED_STAMP_OK'}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                  {certificate.officer?.name || 'Inspector R. Natarajan'}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                  {certificate.officer?.designation || 'Senior Inspector of Legal Metrology'}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  ID: {certificate.officer?.code || certificate.officer?.officerCode || 'OFF-TN-042'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
