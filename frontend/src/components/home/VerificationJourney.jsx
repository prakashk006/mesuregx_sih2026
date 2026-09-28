import React from 'react';
import {
  FileText,
  SearchCheck,
  Scale,
  Award,
  QrCode
} from 'lucide-react';

export default function VerificationJourney() {
  const steps = [
    {
      num: '01',
      title: 'REGISTER',
      desc: 'Instrument details are registered on the sovereign platform.',
      icon: <FileText size={22} color="#0F766E" />,
    },
    {
      num: '02',
      title: 'INSPECT',
      desc: 'Physical inspection & statutory document verification.',
      icon: <SearchCheck size={22} color="#0F766E" />,
    },
    {
      num: '03',
      title: 'TEST',
      desc: 'OIML R 76 accuracy & tolerance tests are conducted.',
      icon: <Scale size={22} color="#0F766E" />,
    },
    {
      num: '04',
      title: 'CERTIFY',
      desc: 'Digital certificate is issued with unique ID & secure QR code.',
      icon: <Award size={22} color="#0F766E" />,
    },
    {
      num: '05',
      title: 'VERIFY',
      desc: 'Anyone can verify device validity instantly online.',
      icon: <QrCode size={22} color="#0F766E" />,
    },
  ];

  return (
    <section
      id="journey"
      style={{
        padding: '5rem 1.5rem 6rem',
        background: `radial-gradient(circle at 15% 20%, rgba(16, 185, 129, 0.05), transparent 30%),
                     radial-gradient(circle at 85% 70%, rgba(234, 88, 12, 0.04), transparent 30%),
                     #F9FAFB`,
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
            THE VERIFICATION JOURNEY
          </div>
          <h2
            style={{
              fontFamily: 'Outfit, Plus Jakarta Sans, sans-serif',
              fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
              fontWeight: 800,
              color: '#111827',
              letterSpacing: '-0.02em',
              marginBottom: '0.85rem',
            }}
          >
            From Registration to{' '}
            <span
              style={{
                color: '#064E3B',
              }}
            >
              Trust
            </span>
          </h2>
          <p
            style={{
              color: '#475569',
              fontSize: '1.05rem',
              maxWidth: '680px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Every instrument goes through a secure, technology-driven verification process to ensure accuracy, fairness and consumer protection across Bharat.
          </p>
        </div>

        {/* 5-Step Timeline */}
        <div
          className="journey-timeline-container"
          style={{
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '1.5rem',
          }}
        >
          {/* Connecting Line Base (Desktop) */}
          <div
            className="journey-line-desktop"
            style={{
              position: 'absolute',
              top: '42px',
              left: '8%',
              right: '8%',
              height: '2px',
              background: '#CBD5E1',
              zIndex: 1,
              overflow: 'hidden',
            }}
          >
            {/* Animated Progress Pulse traveling 01 -> 05 */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                width: '180px',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, #10B981, #064E3B, transparent)',
                animation: 'journey-line-flow 7s cubic-bezier(0.4, 0, 0.2, 1) infinite',
              }}
            />
          </div>

          {steps.map((step, idx) => (
            <div
              key={idx}
              className="journey-step-card"
              style={{
                position: 'relative',
                zIndex: 2,
                padding: '1.75rem 1.25rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.82)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid #E2E8F0',
                borderRadius: '18px',
                boxShadow: '0 8px 25px rgba(15, 23, 42, 0.05)',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                cursor: 'pointer',
              }}
            >
              {/* Civic Mint Circular Ring Icon Container */}
              <div
                className="step-icon-ring"
                style={{
                  position: 'relative',
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#ECFDF5',
                  border: '1.5px solid #10B981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                  boxShadow: '0 2px 10px rgba(16, 185, 129, 0.15)',
                  transition: 'transform 0.25s ease, border-color 0.25s ease',
                }}
              >
                {step.icon}
                <div
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: '#EA580C',
                    color: '#FFFFFF',
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    fontSize: '0.68rem',
                    fontWeight: 900,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(234, 88, 12, 0.35)',
                  }}
                >
                  {step.num}
                </div>
              </div>

              {/* Step Title */}
              <h3
                className="step-title"
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  color: '#111827',
                  letterSpacing: '0.06em',
                  marginBottom: '0.45rem',
                  transition: 'color 0.25s ease',
                }}
              >
                {step.title}
              </h3>

              {/* Step Description */}
              <p
                className="step-desc"
                style={{
                  fontSize: '0.85rem',
                  color: '#64748B',
                  lineHeight: 1.55,
                  margin: 0,
                  transition: 'color 0.25s ease',
                }}
              >
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .journey-step-card:hover {
          transform: translateY(-3px);
          border-color: #A7F3D0 !important;
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08) !important;
        }
        .journey-step-card:hover .step-icon-ring {
          transform: scale(1.03);
          border-color: #064E3B !important;
        }
        .journey-step-card:hover .step-title {
          color: #064E3B !important;
        }
        @media (max-width: 960px) {
          .journey-timeline-container {
            grid-template-columns: 1fr !important;
            gap: 1.25rem !important;
          }
          .journey-line-desktop {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
}
