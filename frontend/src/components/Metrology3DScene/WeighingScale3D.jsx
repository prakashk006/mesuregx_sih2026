import React from 'react';
import { ShieldCheck, CheckCircle2, RefreshCw, Play, RotateCcw } from 'lucide-react';

export default function WeighingScale3D({
  verificationState = 'IDLE',
  scaleValue = '0.000',
  onStartVerification,
  onReset,
  showFallbackPlatter = false,
}) {
  const isVerifying =
    verificationState === 'INITIALIZING' ||
    verificationState === 'SCANNING' ||
    verificationState === 'MEASURING' ||
    verificationState === 'STABILIZING';

  const isVerified = verificationState === 'VERIFIED';

  return (
    <div className="m3d-scale-anchor" title="OIML R76 Digital Legal Metrology Instrument">
      {/* Fallback 3D platter only when WebGL is inactive */}
      {showFallbackPlatter && (
        <>
          <div className="m3d-platter-assembly">
            <div className="m3d-platter-glass">
              <div className="m3d-platter-grid-lines" />
              <div className="m3d-platter-scanline" />
            </div>
          </div>
          <div className="m3d-support-pillar" />
        </>
      )}

      {/* Main Digital Instrument Console Enclosure */}
      <div className="m3d-scale-base" style={{ marginTop: showFallbackPlatter ? '0' : '75px' }}>
        {/* Scale Header: Metrological Classification */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(16, 185, 129, 0.25)',
            paddingBottom: '0.45rem',
            marginBottom: '0.55rem',
            fontSize: '0.65rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: isVerified ? '#34D399' : '#A7F3D0', fontWeight: 800 }}>
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: isVerified ? '#34D399' : '#10B981',
                boxShadow: isVerified ? '0 0 8px #34D399' : '0 0 8px #10B981',
              }}
            />
            <span>OIML R76 CLASS III</span>
          </div>
          <span style={{ color: '#D1FAE5', fontFamily: 'monospace', fontWeight: 600 }}>
            IND-LM-2026
          </span>
        </div>

        {/* Digital OLED/LED Precision Display */}
        <div className="m3d-digital-display">
          <div className="m3d-display-scan-sweep" />

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.58rem',
              color: '#34D399',
              fontWeight: 800,
              letterSpacing: '0.1em',
              marginBottom: '2px',
            }}
          >
            <span>PRECISION DIGITAL LOAD</span>
            <span style={{ color: isVerified ? '#34D399' : '#A7F3D0' }}>
              ● {verificationState}
            </span>
          </div>

          {/* Large Animated Weight Value */}
          <div
            className="m3d-display-value"
            style={{
              color: isVerified ? '#34D399' : '#FFFFFF',
              textShadow: isVerified
                ? '0 0 20px rgba(52, 211, 153, 0.9), 0 0 35px rgba(16, 185, 129, 0.5)'
                : '0 0 16px rgba(16, 185, 129, 0.6)',
            }}
          >
            <span>{scaleValue}</span>
            <span className="m3d-display-unit" style={{ color: isVerified ? '#34D399' : '#10B981' }}>
              kg
            </span>
          </div>

          {/* Metrological secondary attributes */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0 0.35rem',
              fontSize: '0.6rem',
              color: '#A7F3D0',
              marginTop: '4px',
              fontFamily: 'monospace',
            }}
          >
            <span style={{ color: isVerified ? '#34D399' : '#10B981', fontWeight: 700 }}>
              ● {isVerified ? 'VERIFIED STABLE' : 'ZERO STABLE'}
            </span>
            <span>TARE: 0.000</span>
            <span>e = 5 g</span>
          </div>
        </div>

        {/* Scanning & Verification Status Bar */}
        <div
          className={`m3d-scan-status-strip ${
            isVerified ? 'm3d-status-verified' : 'm3d-status-verifying'
          }`}
          style={{ marginBottom: '0.65rem' }}
        >
          {isVerifying ? (
            <>
              <RefreshCw
                size={12}
                className="animate-spin"
                style={{ animationDuration: '2s' }}
                color="#EA580C"
              />
              <span>
                {verificationState === 'INITIALIZING' && 'INITIALIZING TRANSDUCER...'}
                {verificationState === 'SCANNING' && 'SCANNING VERIFICATION FIELD...'}
                {verificationState === 'MEASURING' && 'MEASURING LOAD SENSOR...'}
                {verificationState === 'STABILIZING' && 'STABILIZING ACCURACY...'}
              </span>
            </>
          ) : isVerified ? (
            <>
              <CheckCircle2 size={12} color="#10B981" />
              <span>✓ INSTRUMENT VERIFIED & SEALED</span>
            </>
          ) : (
            <div
              onClick={onStartVerification}
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                width: '100%',
                justifyContent: 'center',
                color: '#FFEDD5',
              }}
            >
              <Play size={11} color="#EA580C" fill="#EA580C" />
              <span>CLICK SCALE TO START VERIFICATION</span>
            </div>
          )}
        </div>

        {/* Action Button & Secure Stamp */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid rgba(16, 185, 129, 0.2)',
            paddingTop: '0.5rem',
            fontSize: '0.65rem',
            color: '#D1FAE5',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <ShieldCheck size={13} color="#10B981" />
            <span>SEAL:</span>
            <span style={{ color: '#FFFFFF', fontFamily: 'monospace', fontWeight: 700 }}>
              GOV-LM-99482
            </span>
          </div>

          {isVerified ? (
            <button
              type="button"
              onClick={onReset}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.5)',
                color: '#D1FAE5',
                padding: '0.25rem 0.65rem',
                borderRadius: '6px',
                fontSize: '0.65rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                transition: 'all 0.2s ease',
              }}
            >
              <RotateCcw size={10} />
              <span>Verify Again</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onStartVerification}
              style={{
                background: '#EA580C',
                border: 'none',
                color: '#FFFFFF',
                padding: '0.25rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.65rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                boxShadow: '0 2px 8px rgba(234, 88, 12, 0.35)',
                transition: 'all 0.2s ease',
              }}
            >
              <Play size={10} fill="#FFFFFF" />
              <span>Start</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
