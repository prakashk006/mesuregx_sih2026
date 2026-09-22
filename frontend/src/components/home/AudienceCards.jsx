import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  ShieldCheck,
  Check,
  Users
} from 'lucide-react';

export default function AudienceCards() {
  const navigate = useNavigate();

  const audiences = [
    {
      role: 'BUSINESSES',
      title: 'Businesses',
      subtitle: 'Operate with complete compliance & confidence.',
      icon: <Building2 size={26} color="#EA580C" />,
      tag: 'Commercial Entities',
      features: [
        'Quick digital verification process',
        'Cryptographic certificates & records',
        'Build national consumer trust',
      ],
      link: '/register',
      ctaText: 'Register Business →',
      visualSummary: {
        label: 'STAMP VALIDITY',
        val: 'Active 365 Days',
        sub: 'Automated 30-Day Renewal Alerts',
      },
    },
    {
      role: 'OFFICERS',
      title: 'Officers',
      subtitle: 'Field inspection & verification intelligence.',
      icon: <ShieldCheck size={26} color="#064E3B" />,
      tag: 'Legal Metrology Inspectors',
      features: [
        'Real-time mesh monitoring',
        'Automated MPE violation reporting',
        'FastAPI sovereign rule engine',
      ],
      link: '/login',
      ctaText: 'Officer Portal →',
      visualSummary: {
        label: 'EVALUATION ENGINE',
        val: '< 25ms MPE Check',
        sub: 'OIML R76 Mathematical Accuracy',
      },
    },
    {
      role: 'CITIZENS',
      title: 'Citizens',
      subtitle: 'Instant consumer protection and transparency.',
      icon: <Users size={26} color="#2563EB" />,
      tag: 'Consumer Protection',
      features: [
        'Verify scale validity anytime, anywhere',
        '100% Free & Zero Login required',
        'Direct consumer grievance filing',
      ],
      link: '/verify',
      ctaText: 'Verify Any Device →',
      visualSummary: {
        label: 'PUBLIC QR LOOKUP',
        val: '100% Free & Open Access',
        sub: 'Tamper-Evident Sovereign Seals',
      },
    },
  ];

  return (
    <section
      id="about"
      style={{
        padding: '5.5rem 1.5rem 6rem',
        background: '#F9FAFB',
        position: 'relative',
        borderBottom: '1px solid rgba(6, 78, 59, 0.08)',
      }}
    >
      <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div
            style={{
              color: '#065F46',
              fontSize: '0.8rem',
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: '0.65rem',
            }}
          >
            WHO WE SERVE
          </div>
          <h2
            style={{
              fontFamily: 'Outfit, Plus Jakarta Sans, sans-serif',
              fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
              fontWeight: 800,
              color: '#064E3B',
              letterSpacing: '-0.02em',
              marginBottom: '0.85rem',
            }}
          >
            One Sovereign Network. Every Measure.
          </h2>
          <p
            style={{
              color: '#4B5563',
              fontSize: '1.05rem',
              maxWidth: '680px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            MeasureGX connects the entire legal metrology ecosystem — empowering businesses, enabling officers and protecting every citizen across India.
          </p>
        </div>

        {/* Three Large Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
          }}
        >
          {audiences.map((card, i) => (
            <div
              key={i}
              className="audience-card"
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(18px)',
                WebkitBackdropFilter: 'blur(18px)',
                border: '1px solid rgba(6, 78, 59, 0.12)',
                borderRadius: '20px',
                padding: '2.25rem 2rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 16px 36px rgba(6, 78, 59, 0.06), 0 2px 8px rgba(0, 0, 0, 0.04)',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
              }}
              onClick={() => navigate(card.link)}
            >
              {/* Subtle top indicator bar */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background:
                    i === 0
                      ? 'linear-gradient(90deg, #EA580C, #F59E0B)'
                      : i === 1
                      ? 'linear-gradient(90deg, #064E3B, #10B981)'
                      : 'linear-gradient(90deg, #2563EB, #064E3B)',
                }}
              />

              <div>
                {/* Header Icon + Role Tag */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div
                    className="audience-icon-box"
                    style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '14px',
                      background: i === 0 ? '#FFF7ED' : i === 1 ? '#F0FDF4' : '#EFF6FF',
                      border: `1px solid ${i === 0 ? 'rgba(234, 88, 12, 0.25)' : i === 1 ? 'rgba(16, 185, 129, 0.25)' : 'rgba(37, 99, 235, 0.25)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
                      transition: 'transform 0.3s ease',
                    }}
                  >
                    {card.icon}
                  </div>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      color: i === 0 ? '#C2410C' : i === 1 ? '#065F46' : '#1E40AF',
                      background: i === 0 ? '#FFEDD5' : i === 1 ? '#D1FAE5' : '#DBEAFE',
                      border: `1px solid ${i === 0 ? 'rgba(234, 88, 12, 0.3)' : i === 1 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(37, 99, 235, 0.3)'}`,
                      padding: '0.25rem 0.65rem',
                      borderRadius: '999px',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {card.tag}
                  </span>
                </div>

                {/* Title & Subtitle */}
                <h3
                  style={{
                    fontSize: '1.75rem',
                    fontWeight: 800,
                    color: '#111827',
                    letterSpacing: '-0.01em',
                    marginBottom: '0.35rem',
                  }}
                >
                  {card.title}
                </h3>
                <div
                  style={{
                    fontSize: '0.98rem',
                    fontWeight: 600,
                    color: '#4B5563',
                    marginBottom: '1.5rem',
                  }}
                >
                  {card.subtitle}
                </div>

                {/* Features Check List */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    marginBottom: '2rem',
                  }}
                >
                  {card.features.map((feat, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        fontSize: '0.92rem',
                        color: '#1F2937',
                        fontWeight: 500,
                      }}
                    >
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: '#D1FAE5',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Check size={12} color="#065F46" strokeWidth={3} />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                {/* Micro HUD visual container */}
                <div
                  className="audience-hud-box"
                  style={{
                    background: '#F9FAFB',
                    border: '1px solid rgba(6, 78, 59, 0.1)',
                    borderRadius: '12px',
                    padding: '0.85rem 1rem',
                    marginBottom: '1.75rem',
                    transition: 'transform 0.3s ease, border-color 0.3s ease',
                  }}
                >
                  <div style={{ fontSize: '0.68rem', color: '#6B7280', fontWeight: 800, letterSpacing: '0.08em' }}>
                    {card.visualSummary.label}
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#064E3B', marginTop: '2px' }}>
                    {card.visualSummary.val}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#065F46', marginTop: '2px', fontWeight: 600 }}>
                    {card.visualSummary.sub}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Link
                to={card.link}
                className={i === 0 ? "btn btn-primary" : "btn btn-secondary"}
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  fontSize: '0.9rem',
                  padding: '0.75rem 1rem',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <span>{card.ctaText}</span>
              </Link>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .audience-card:hover {
          transform: translateY(-6px);
          border-color: rgba(6, 78, 59, 0.3) !important;
          box-shadow: 0 24px 50px rgba(6, 78, 59, 0.12), 0 4px 16px rgba(0, 0, 0, 0.06) !important;
        }
        .audience-card:hover .audience-hud-box {
          border-color: rgba(6, 78, 59, 0.25) !important;
        }
        .audience-card:hover .audience-icon-box {
          transform: scale(1.08);
        }
      `}</style>
    </section>
  );
}
