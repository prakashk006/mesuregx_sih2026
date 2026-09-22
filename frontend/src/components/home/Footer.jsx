import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, PhoneCall, ShieldCheck, ExternalLink, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer
      style={{
        background: 'linear-gradient(180deg, #064E3B 0%, #032E23 100%)',
        borderTop: '3px solid #EA580C',
        color: '#D1FAE5',
        padding: '5rem 1.5rem 2.5rem',
        position: 'relative',
        zIndex: 20,
      }}
    >
      <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '3rem',
            marginBottom: '4rem',
          }}
        >
          {/* Brand Column */}
          <div style={{ maxWidth: '320px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                }}
              >
                <Scale size={20} color="#064E3B" strokeWidth={2.5} />
              </div>
              <div>
                <span
                  style={{
                    fontFamily: 'Outfit, Plus Jakarta Sans, sans-serif',
                    fontWeight: 800,
                    fontSize: '1.35rem',
                    color: '#FFFFFF',
                    letterSpacing: '0.04em',
                  }}
                >
                  MEASURE<span style={{ color: '#EA580C' }}>GX</span>
                </span>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#A7F3D0', letterSpacing: '0.1em' }}>
                  SOVEREIGN LEGAL METROLOGY
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.88rem', lineHeight: 1.65, color: '#D1FAE5', marginBottom: '1.5rem' }}>
              India's digital infrastructure for verified commercial instruments. Ensuring precision, legal conformity, and consumer protection nationwide.
            </p>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.4rem 0.75rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                borderRadius: '8px',
                fontSize: '0.75rem',
                color: '#FFFFFF',
                fontWeight: 600,
              }}
            >
              <ShieldCheck size={14} color="#34D399" />
              <span>OIML R 76 • Legal Metrology Act 2009</span>
            </div>
          </div>

          {/* Platform Column */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '0.95rem', fontWeight: 800, letterSpacing: '0.04em', marginBottom: '1.25rem' }}>
              Platform
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.88rem' }}>
              <li>
                <a href="#services" style={{ color: '#D1FAE5', textDecoration: 'none', transition: 'color 0.2s' }}>
                  Digital Services
                </a>
              </li>
              <li>
                <Link to="/verify" style={{ color: '#D1FAE5', textDecoration: 'none', transition: 'color 0.2s' }}>
                  Verification Portal
                </Link>
              </li>
              <li>
                <Link to="/business/certificates" style={{ color: '#D1FAE5', textDecoration: 'none', transition: 'color 0.2s' }}>
                  Digital Certificates
                </Link>
              </li>
              <li>
                <a href="#network" style={{ color: '#D1FAE5', textDecoration: 'none', transition: 'color 0.2s' }}>
                  National Grid Network
                </a>
              </li>
              <li>
                <Link to="/register" style={{ color: '#D1FAE5', textDecoration: 'none', transition: 'color 0.2s' }}>
                  Merchant Scale Enrollment
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '0.95rem', fontWeight: 800, letterSpacing: '0.04em', marginBottom: '1.25rem' }}>
              Resources
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.88rem' }}>
              <li>
                <a href="#standards" style={{ color: '#D1FAE5', textDecoration: 'none', transition: 'color 0.2s' }}>
                  OIML Standards
                </a>
              </li>
              <li>
                <a href="#faq" style={{ color: '#D1FAE5', textDecoration: 'none', transition: 'color 0.2s' }}>
                  Citizen FAQs
                </a>
              </li>
              <li>
                <Link to="/report-concern" style={{ color: '#D1FAE5', textDecoration: 'none', transition: 'color 0.2s' }}>
                  Vigilance & Grievances
                </Link>
              </li>
              <li>
                <Link to="/login" style={{ color: '#D1FAE5', textDecoration: 'none', transition: 'color 0.2s' }}>
                  Officer Field Manual
                </Link>
              </li>
              <li>
                <a href="http://127.0.0.1:8000/docs" target="_blank" rel="noreferrer" style={{ color: '#D1FAE5', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  FastAPI OpenAPI Specs <ExternalLink size={12} />
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '0.95rem', fontWeight: 800, letterSpacing: '0.04em', marginBottom: '1.25rem' }}>
              Legal & Sovereign
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.88rem' }}>
              <li><span style={{ color: '#D1FAE5' }}>Privacy Policy</span></li>
              <li><span style={{ color: '#D1FAE5' }}>Terms of Service</span></li>
              <li><span style={{ color: '#D1FAE5' }}>Accessibility Statement (GIGW)</span></li>
              <li><span style={{ color: '#D1FAE5' }}>ISO/IEC 27001 Security Audit</span></li>
              <li><span style={{ color: '#D1FAE5' }}>Indian Metrology Act 2009</span></li>
            </ul>
          </div>

          {/* Helpline Column */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '0.95rem', fontWeight: 800, letterSpacing: '0.04em', marginBottom: '1.25rem' }}>
              Toll-Free Helpline
            </h4>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                color: '#FFEDD5',
                fontWeight: 800,
                fontSize: '1.1rem',
                marginBottom: '0.6rem',
              }}
            >
              <PhoneCall size={18} color="#EA580C" />
              <span>1800-METROLOGY-01</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#D1FAE5', lineHeight: 1.5, marginBottom: '1rem' }}>
              National Consumer Helpline for short-weight violations, unverified commercial scales, and seal integrity complaints.
            </p>
            <div style={{ fontSize: '0.75rem', color: '#34D399', fontWeight: 700 }}>
              ● 24/7 Citizen Redressal Service
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.15)',
            paddingTop: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.25rem',
            fontSize: '0.82rem',
            color: '#A7F3D0',
          }}
        >
          <div>
            <span style={{ color: '#FFEDD5', fontWeight: 700 }}>Accuracy • Fairness • Trust</span>
            <span style={{ margin: '0 0.75rem', opacity: 0.4 }}>|</span>
            <span>Government of India • Ministry of Consumer Affairs • Legal Metrology Division</span>
          </div>

          <div>
            © 2026 MEASUREGX Sovereign Legal Metrology Platform. All Rights Reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
