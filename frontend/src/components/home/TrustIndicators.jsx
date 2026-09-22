import React from 'react';
import { ShieldCheck, CheckCircle2, Globe2 } from 'lucide-react';

export default function TrustIndicators() {
  const indicators = [
    {
      icon: <ShieldCheck size={16} color="#064E3B" />,
      text: 'DIGITAL VERIFICATION',
    },
    {
      icon: <CheckCircle2 size={16} color="#10B981" />,
      text: 'TRANSPARENT & TRUSTED',
    },
    {
      icon: <Globe2 size={16} color="#2563EB" />,
      text: 'NATIONWIDE COVERAGE',
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        flexWrap: 'wrap',
        marginTop: '2rem',
      }}
    >
      {indicators.map((item, index) => (
        <div
          key={index}
          className="trust-indicator-item"
        >
          <div className="trust-indicator-icon-box">
            {item.icon}
          </div>
          <span style={{ color: '#111827', fontWeight: 700 }}>{item.text}</span>
        </div>
      ))}
    </div>
  );
}
