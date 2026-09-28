import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function FloatingQRElements() {
  return (
    <>
      {/* Secondary Floating QR Card (Bottom-Right) */}
      <div
        className="m3d-floating-qr m3d-anim-float-3"
        style={{
          bottom: '75px',
          right: '50px',
        }}
        title="Public Metrology Verification QR"
      >
        <div
          style={{
            position: 'relative',
            background: '#FFFFFF',
            padding: '4px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <QRCodeSVG
            value="https://mesuregx.gov.in/verify/MGX-2025-784562"
            size={42}
            level="M"
          />
          {/* Laser scanning strip */}
          <div className="m3d-laser-scan" />
        </div>
        <div
          style={{
            fontSize: '0.55rem',
            color: '#064E3B',
            fontWeight: 800,
            textAlign: 'center',
            marginTop: '3px',
            letterSpacing: '0.04em',
          }}
        >
          SCAN TO AUDIT
        </div>
      </div>

      {/* Mini Floating Verification Stamp (Mid-Left) */}
      <div
        className="m3d-floating-qr m3d-anim-float-4"
        style={{
          top: '260px',
          left: '15px',
          padding: '5px',
          opacity: 0.9,
        }}
        title="OIML R76 Compliance Stamp"
      >
        <div
          style={{
            background: '#D1FAE5',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '6px',
            padding: '4px 6px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
          }}
        >
          <span style={{ fontSize: '0.52rem', color: '#065F46', fontWeight: 800 }}>OIML COMPLIANT</span>
          <span style={{ fontSize: '0.58rem', color: '#111827', fontFamily: 'monospace', fontWeight: 700 }}>IND-2026</span>
        </div>
      </div>
    </>
  );
}
