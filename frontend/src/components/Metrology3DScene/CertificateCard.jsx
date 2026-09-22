import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Award, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function CertificateCard({
  verificationState = 'IDLE',
  certificateId = 'MGX-2025-784562',
  standard = 'OIML R 76 • Class III',
  status = 'Valid'
}) {
  const isVerified = verificationState === 'VERIFIED';
  const isScanning = verificationState === 'SCANNING' || verificationState === 'MEASURING';

  return (
    <div
      className="m3d-glass-card m3d-card-cert m3d-anim-float-1"
      style={{
        borderColor: isVerified
          ? 'rgba(16, 185, 129, 0.5)'
          : isScanning
          ? 'rgba(234, 88, 12, 0.45)'
          : 'rgba(6, 78, 59, 0.18)',
        boxShadow: isVerified
          ? '0 18px 40px rgba(6, 78, 59, 0.15), 0 0 20px rgba(16, 185, 129, 0.2)'
          : '0 16px 36px rgba(6, 78, 59, 0.12)',
      }}
      title="Official Legal Metrology Certificate"
    >
      <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
        {/* QR Code with scanning laser */}
        <div
          style={{
            position: 'relative',
            background: '#FFFFFF',
            padding: '4px',
            borderRadius: '8px',
            border: '1px solid rgba(6, 78, 59, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            boxShadow: isVerified
              ? '0 0 12px rgba(16, 185, 129, 0.3)'
              : '0 2px 8px rgba(0, 0, 0, 0.06)',
            flexShrink: 0,
          }}
        >
          <QRCodeSVG
            value={`https://mesuregx.gov.in/verify/${certificateId}`}
            size={52}
            level="M"
          />
          {/* Animated Laser Scan Line */}
          <div
            className="m3d-laser-scan"
            style={{
              background: isVerified ? '#10B981' : '#EA580C',
              boxShadow: isVerified ? '0 0 8px #10B981' : '0 0 8px #EA580C',
            }}
          />
        </div>

        {/* Certificate Metadata */}
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.62rem',
              color: isVerified ? '#065F46' : '#064E3B',
              fontWeight: 800,
              letterSpacing: '0.06em',
            }}
          >
            <Award size={11} color={isVerified ? '#10B981' : '#064E3B'} />
            <span>CERTIFICATE</span>
          </div>

          <div
            style={{
              fontSize: '0.8rem',
              fontWeight: 800,
              color: '#111827',
              fontFamily: 'monospace',
              margin: '2px 0',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {certificateId}
          </div>

          <div
            style={{
              fontSize: '0.62rem',
              color: '#4B5563',
              whiteSpace: 'nowrap',
            }}
          >
            {standard}
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.64rem',
              color: isVerified ? '#065F46' : '#1E40AF',
              fontWeight: 800,
              marginTop: '4px',
              background: isVerified ? '#D1FAE5' : '#DBEAFE',
              padding: '2px 6px',
              borderRadius: '4px',
              border: `1px solid ${isVerified ? 'rgba(16, 185, 129, 0.4)' : 'rgba(37, 99, 235, 0.3)'}`,
            }}
          >
            <CheckCircle2 size={10} color={isVerified ? '#065F46' : '#1E40AF'} />
            <span>{isVerified ? '✓ Verified' : status}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
