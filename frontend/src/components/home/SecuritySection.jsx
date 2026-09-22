import React from 'react';
import { Cpu, FileCheck2, ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';

export default function SecuritySection() {
  const pillars = [
    {
      icon: <Cpu size={36} color="#064E3B" strokeWidth={1.75} />,
      title: 'ACCURACY',
      subtitle: 'Mathematical tolerance evaluation and instrument testing.',
      iconBg: '#F0FDF4',
      iconBorder: 'rgba(16, 185, 129, 0.25)',
      subColor: '#065F46',
      bullets: [
        'Strict OIML R 76-1 Maximum Permissible Error rules',
        'Sub-25ms Python FastAPI microservice calculation',
        'Support for Class I, II, III, and IIII instruments',
      ],
    },
    {
      icon: <FileCheck2 size={36} color="#EA580C" strokeWidth={1.75} />,
      title: 'TRANSPARENCY',
      subtitle: 'Every verification has an immutable digital record.',
      iconBg: '#FFF7ED',
      iconBorder: 'rgba(234, 88, 12, 0.25)',
      subColor: '#C2410C',
      bullets: [
        'Permanent sovereign metrology audit trail',
        'Geotagged inspector GPS and seal photographic logs',
        'Statewide public certificate lookup and Form TR-6 receipts',
      ],
    },
    {
      icon: <ShieldCheck size={36} color="#2563EB" strokeWidth={1.75} />,
      title: 'SECURITY',
      subtitle: 'Cryptographically secured certificates and QR verification.',
      iconBg: '#EFF6FF',
      iconBorder: 'rgba(37, 99, 235, 0.25)',
      subColor: '#1E40AF',
      bullets: [
        'SHA-256 digital signatures preventing physical seal tampering',
        'Dynamic encrypted QR payloads verifiable with any smartphone',
        'Zero-trust role-based access for business, officer, and state HQ',
      ],
    },
  ];

  return (
    <section
      id="security"
      style={{
        padding: '6rem 1.5rem',
        background: '#FFFFFF',
        position: 'relative',
        borderBottom: '1px solid rgba(6, 78, 59, 0.08)',
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: '1440px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '4.5rem' }}>
          <div
            style={{
              color: '#065F46',
              fontSize: '0.82rem',
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: '0.65rem',
            }}
          >
            SOVEREIGN TRUST ARCHITECTURE
          </div>
          <h2
            style={{
              fontFamily: 'Outfit, Plus Jakarta Sans, sans-serif',
              fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
              fontWeight: 800,
              color: '#064E3B',
              letterSpacing: '-0.02em',
              marginBottom: '1rem',
            }}
          >
            Built for Accuracy. Designed for Trust.
          </h2>
          <p
            style={{
              color: '#4B5563',
              fontSize: '1.08rem',
              maxWidth: '680px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Engineered under statutory metrological directives to eliminate fraud, uphold consumer confidence, and provide airtight judicial evidence across Bharat.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
          }}
        >
          {pillars.map((p, i) => (
            <div
              key={i}
              className="security-pillar-card"
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                padding: '2.5rem 2rem',
                borderRadius: '20px',
                border: '1px solid rgba(6, 78, 59, 0.12)',
                boxShadow: '0 16px 36px rgba(6, 78, 59, 0.05), 0 2px 8px rgba(0, 0, 0, 0.02)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              }}
            >
              <div>
                <div
                  style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '16px',
                    background: p.iconBg,
                    border: `1.5px solid ${p.iconBorder}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
                  }}
                >
                  {p.icon}
                </div>

                <h3
                  style={{
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    color: '#111827',
                    letterSpacing: '0.04em',
                    marginBottom: '0.5rem',
                  }}
                >
                  {p.title}
                </h3>

                <p
                  style={{
                    fontSize: '0.92rem',
                    color: p.subColor,
                    fontWeight: 600,
                    lineHeight: 1.5,
                    marginBottom: '1.75rem',
                  }}
                >
                  {p.subtitle}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {p.bullets.map((b, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.65rem',
                        fontSize: '0.88rem',
                        color: '#4B5563',
                        lineHeight: 1.5,
                      }}
                    >
                      <CheckCircle2 size={16} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .security-pillar-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 45px rgba(6, 78, 59, 0.1), 0 4px 12px rgba(0, 0, 0, 0.04) !important;
          border-color: rgba(6, 78, 59, 0.28) !important;
        }
      `}</style>
    </section>
  );
}
