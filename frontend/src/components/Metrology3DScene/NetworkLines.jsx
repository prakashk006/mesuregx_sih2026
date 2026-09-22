import React from 'react';

export default function NetworkLines() {
  return (
    <svg
      viewBox="0 0 720 600"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 5,
      }}
      aria-hidden="true"
    >
      <defs>
        {/* Glow Filters for travelling particles */}
        <filter id="m3d-mint-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <filter id="m3d-saffron-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Path 1: Certificate (Top-Left ~180,120) to Scale Platter (~310,240) */}
      <path
        id="path-cert-to-scale"
        d="M 190,130 Q 250,180 310,240"
        fill="none"
        stroke="rgba(16, 185, 129, 0.35)"
        strokeWidth="1.5"
        strokeDasharray="4 4"
      />
      <circle r="3" fill="#10B981" filter="url(#m3d-mint-glow)">
        <animateMotion dur="2.8s" repeatCount="indefinite" path="M 190,130 Q 250,180 310,240" />
      </circle>

      {/* Path 2: Scale Platter (~410,240) to Live Verification Panel (~530,130) */}
      <path
        id="path-scale-to-verify"
        d="M 410,240 Q 470,180 530,130"
        fill="none"
        stroke="rgba(234, 88, 12, 0.35)"
        strokeWidth="1.5"
        strokeDasharray="4 4"
      />
      <circle r="3" fill="#EA580C" filter="url(#m3d-saffron-glow)">
        <animateMotion dur="3.2s" repeatCount="indefinite" begin="0.8s" path="M 410,240 Q 470,180 530,130" />
      </circle>

      {/* Path 3: Live Verification (~550,260) to National Metrology Node (~430,450) */}
      <path
        id="path-verify-to-node"
        d="M 550,260 Q 490,360 430,450"
        fill="none"
        stroke="rgba(16, 185, 129, 0.3)"
        strokeWidth="1.2"
        strokeDasharray="3 3"
      />
      <circle r="2.8" fill="#10B981" filter="url(#m3d-mint-glow)">
        <animateMotion dur="3.6s" repeatCount="indefinite" begin="1.4s" path="M 550,260 Q 490,360 430,450" />
      </circle>

      {/* Path 4: Security Shield (~110,420) to Scale Base (~290,430) */}
      <path
        id="path-shield-to-base"
        d="M 120,410 Q 200,440 290,430"
        fill="none"
        stroke="rgba(37, 99, 235, 0.3)"
        strokeWidth="1.2"
        strokeDasharray="4 4"
      />
      <circle r="2.5" fill="#2563EB" filter="url(#m3d-mint-glow)">
        <animateMotion dur="4.2s" repeatCount="indefinite" begin="2.1s" path="M 120,410 Q 200,440 290,430" />
      </circle>

      {/* Connection Node Anchors */}
      <circle cx="190" cy="130" r="3.5" fill="#10B981" />
      <circle cx="310" cy="240" r="4" fill="#10B981" />
      <circle cx="410" cy="240" r="4" fill="#EA580C" />
      <circle cx="530" cy="130" r="3.5" fill="#10B981" />
      <circle cx="430" cy="450" r="3.5" fill="#10B981" />
      <circle cx="120" cy="410" r="3.5" fill="#2563EB" />
    </svg>
  );
}
