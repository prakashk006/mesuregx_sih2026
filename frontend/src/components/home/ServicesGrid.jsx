import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Scale,
  SearchCheck,
  Activity,
  Award,
  QrCode,
  ShieldCheck,
  Globe2,
  ArrowRight
} from 'lucide-react';

export default function ServicesGrid() {
  const navigate = useNavigate();

  const services = [
    {
      title: 'Instrument Registration',
      desc: 'Seamless onboarding of commercial weighing instruments into the state central asset database.',
      icon: <FileText size={22} color="#064E3B" />,
      link: '/business/instruments',
    },
    {
      title: 'Instrument Verification',
      desc: 'Statutory initial and mandatory annual re-verification application workflows.',
      icon: <Scale size={22} color="#EA580C" />,
      link: '/business/applications/new',
    },
    {
      title: 'Officer Inspection',
      desc: 'Mobile field console for legal metrology inspectors with GPS coordinates and seal evidence.',
      icon: <SearchCheck size={22} color="#10B981" />,
      link: '/officer/dashboard',
    },
    {
      title: 'Load Testing',
      desc: 'Multi-point eccentricity and repeatability test recording with automated FastAPI tolerance calculations.',
      icon: <Activity size={22} color="#2563EB" />,
      link: '/officer/applications',
    },
    {
      title: 'Digital Certificates',
      desc: 'Instant cryptographic minting and sovereign registry of Form TR-6 verification certificates.',
      icon: <Award size={22} color="#D97706" />,
      link: '/business/certificates',
    },
    {
      title: 'QR Verification',
      desc: 'Dynamic tamper-evident QR code labels affixed to commercial scales for instant public lookup.',
      icon: <QrCode size={22} color="#064E3B" />,
      link: '/verify',
    },
    {
      title: 'Compliance Monitoring',
      desc: 'Statewide metrological oversight, dynamic accuracy tolerance rules, and immutable audit logs.',
      icon: <ShieldCheck size={22} color="#10B981" />,
      link: '/admin/rules',
    },
    {
      title: 'Public Verification',
      desc: 'Zero-login public search ensuring consumer protection, transparency, and fair commercial trade.',
      icon: <Globe2 size={22} color="#2563EB" />,
      link: '/verify',
    },
  ];

  return (
    <section
      id="services"
      style={{
        padding: '5.5rem 1.5rem 6rem',
        background: '#FFFFFF',
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
            METROLOGY SERVICES
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
            Digital Services Ecosystem
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
            Streamlined statutory compliance pipelines built for high-throughput regulatory enforcement and transparent commercial operations across Bharat.
          </p>
        </div>

        {/* 8-Services Grid: 4-col desktop, 2-col tablet, 1-col mobile */}
        <div
          className="services-grid-container"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1.5rem',
          }}
        >
          {services.map((item, idx) => (
            <div
              key={idx}
              className="service-card"
              style={{
                padding: '1.75rem 1.4rem',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                borderRadius: '16px',
                border: '1px solid rgba(6, 78, 59, 0.12)',
                boxShadow: '0 4px 16px rgba(6, 78, 59, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
                transition: 'all 0.25s ease',
              }}
              onClick={() => navigate(item.link)}
            >
              <div>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: '#F0FDF4',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.15rem',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                  }}
                >
                  {item.icon}
                </div>

                <h3
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    color: '#111827',
                    marginBottom: '0.55rem',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {item.title}
                </h3>

                <p
                  style={{
                    fontSize: '0.84rem',
                    color: '#4B5563',
                    lineHeight: 1.55,
                    marginBottom: '1.5rem',
                  }}
                >
                  {item.desc}
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: '#064E3B',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  transition: 'gap 0.2s ease, color 0.2s ease',
                }}
                className="service-arrow"
              >
                <span>Access Service</span>
                <ArrowRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 1100px) {
          .services-grid-container {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 600px) {
          .services-grid-container {
            grid-template-columns: 1fr !important;
          }
        }
        .service-card:hover {
          transform: translateY(-4px);
          border-color: rgba(6, 78, 59, 0.3) !important;
          box-shadow: 0 16px 36px rgba(6, 78, 59, 0.1), 0 2px 8px rgba(0, 0, 0, 0.04) !important;
        }
        .service-card:hover .service-arrow {
          gap: 0.75rem !important;
          color: #EA580C !important;
        }
      `}</style>
    </section>
  );
}
