import React from 'react';
import { Check, Activity, ShieldCheck, RefreshCw } from 'lucide-react';

export default function VerificationCard({
  verificationState = 'IDLE',
  accuracy = '99.98%',
  standard = 'OIML R76',
  accuracyClass = 'Class III',
  certificateId = 'MGX-2025-784562',
  tolerance = '0.02%',
  status = 'Within Limit'
}) {
  const isVerified = verificationState === 'VERIFIED';
  const isBusy =
    verificationState === 'INITIALIZING' ||
    verificationState === 'SCANNING' ||
    verificationState === 'MEASURING' ||
    verificationState === 'STABILIZING';

  return (
    <div
      className="m3d-glass-card m3d-card-verify m3d-anim-float-2"
      style={{
        borderColor: isVerified
          ? 'rgba(16, 185, 129, 0.5)'
          : isBusy
          ? 'rgba(234, 88, 12, 0.45)'
          : 'rgba(6, 78, 59, 0.18)',
        boxShadow: isVerified
          ? '0 18px 40px rgba(6, 78, 59, 0.15), 0 0 20px rgba(16, 185, 129, 0.2)'
          : '0 16px 36px rgba(6, 78, 59, 0.12)',
      }}
      title="Live Metrological Verification Panel"
    >
      {/* Header with Live Status */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.6rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Activity size={12} color="#064E3B" />
          <span
            style={{
              fontSize: '0.65rem',
              fontWeight: 800,
              color: '#064E3B',
              letterSpacing: '0.08em',
            }}
          >
            LIVE VERIFICATION
          </span>
        </div>

        {isVerified ? (
          <span
            style={{
              fontSize: '0.62rem',
              background: '#D1FAE5',
              color: '#065F46',
              border: '1px solid rgba(16, 185, 129, 0.5)',
              padding: '0.15rem 0.45rem',
              borderRadius: '999px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '0.2rem',
              boxShadow: '0 0 8px rgba(16, 185, 129, 0.25)',
            }}
          >
            <Check size={10} strokeWidth={3} /> VERIFIED
          </span>
        ) : isBusy ? (
          <span
            style={{
              fontSize: '0.62rem',
              background: '#FFEDD5',
              color: '#C2410C',
              border: '1px solid rgba(234, 88, 12, 0.4)',
              padding: '0.15rem 0.45rem',
              borderRadius: '999px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <RefreshCw size={9} className="animate-spin" /> {verificationState}
          </span>
        ) : (
          <span
            style={{
              fontSize: '0.62rem',
              background: '#DBEAFE',
              color: '#1E40AF',
              border: '1px solid rgba(37, 99, 235, 0.3)',
              padding: '0.15rem 0.45rem',
              borderRadius: '999px',
              fontWeight: 800,
            }}
          >
            READY
          </span>
        )}
      </div>

      {/* Accuracy Big Metric */}
      <div
        style={{
          background: '#F9FAFB',
          borderRadius: '10px',
          padding: '0.45rem 0.65rem',
          marginBottom: '0.55rem',
          border: `1px solid ${isVerified ? 'rgba(16, 185, 129, 0.35)' : 'rgba(6, 78, 59, 0.12)'}`,
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontSize: '0.65rem', color: '#6B7280', fontWeight: 600 }}>Accuracy</span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem' }}>
          <span
            style={{
              fontSize: '1.35rem',
              fontWeight: 900,
              color: isVerified ? '#065F46' : '#111827',
              fontFamily: 'monospace',
            }}
          >
            {isVerified ? accuracy : isBusy ? '99.9x%' : '99.98%'}
          </span>
        </div>
      </div>

      {/* Detail Attributes Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.4rem',
          fontSize: '0.64rem',
          marginBottom: '0.55rem',
        }}
      >
        <div style={{ background: '#F3F4F6', padding: '0.35rem 0.5rem', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.04)' }}>
          <span style={{ color: '#6B7280', display: 'block', fontSize: '0.58rem' }}>Standard</span>
          <strong style={{ color: '#064E3B' }}>{standard}</strong>
        </div>
        <div style={{ background: '#F3F4F6', padding: '0.35rem 0.5rem', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.04)' }}>
          <span style={{ color: '#6B7280', display: 'block', fontSize: '0.58rem' }}>Accuracy Class</span>
          <strong style={{ color: '#2563EB' }}>{accuracyClass}</strong>
        </div>
      </div>

      {/* Certificate and Tolerance Row */}
      <div
        style={{
          fontSize: '0.63rem',
          color: '#6B7280',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
          borderTop: '1px solid rgba(6, 78, 59, 0.1)',
          paddingTop: '0.45rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Certificate ID:</span>
          <span style={{ color: '#111827', fontFamily: 'monospace', fontWeight: 700 }}>
            {certificateId}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Tolerance:</span>
          <span style={{ color: isVerified ? '#065F46' : '#2563EB', fontWeight: 800 }}>
            {tolerance} ({status})
          </span>
        </div>
      </div>
    </div>
  );
}
