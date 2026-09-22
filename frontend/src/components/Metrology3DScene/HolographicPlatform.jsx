import React from 'react';

export default function HolographicPlatform() {
  return (
    <div className="m3d-platform-wrapper" aria-hidden="true">
      {/* Outer Ring */}
      <div className="m3d-ring-outer" />

      {/* Middle Counter-Rotating Ring with orbiting beacons */}
      <div className="m3d-ring-middle" />

      {/* Inner Ring */}
      <div className="m3d-ring-inner" />

      {/* Sweeping Light Cone / Radar Sweep */}
      <div className="m3d-platform-sweep" />

      {/* Base Concentric Rings in SVG for high definition tick marks */}
      <svg
        viewBox="0 0 400 400"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        <circle
          cx="200"
          cy="200"
          r="190"
          fill="none"
          stroke="rgba(16, 185, 129, 0.2)"
          strokeWidth="1"
          strokeDasharray="4 8"
        />
        <circle
          cx="200"
          cy="200"
          r="130"
          fill="none"
          stroke="rgba(37, 99, 235, 0.2)"
          strokeWidth="1.2"
        />
        <circle
          cx="200"
          cy="200"
          r="70"
          fill="rgba(16, 185, 129, 0.04)"
          stroke="rgba(16, 185, 129, 0.35)"
          strokeWidth="1"
          strokeDasharray="6 4"
        />
        {/* Crosshair markers */}
        <line x1="200" y1="10" x2="200" y2="40" stroke="#10B981" strokeWidth="1.5" />
        <line x1="200" y1="360" x2="200" y2="390" stroke="#10B981" strokeWidth="1.5" />
        <line x1="10" y1="200" x2="40" y2="200" stroke="#10B981" strokeWidth="1.5" />
        <line x1="360" y1="200" x2="390" y2="200" stroke="#10B981" strokeWidth="1.5" />
      </svg>
    </div>
  );
}
