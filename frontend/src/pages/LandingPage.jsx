import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Globe,
  Radio,
  Info
} from 'lucide-react';
import QRScannerModal from '../components/QRScannerModal';

// Modular Components
import HeroSection from '../components/home/HeroSection';
import VerificationJourney from '../components/home/VerificationJourney';
import StatsPanel from '../components/home/StatsPanel';
import NetworkSection from '../components/home/NetworkSection';
import AudienceCards from '../components/home/AudienceCards';
import PublicVerification from '../components/home/PublicVerification';
import ServicesGrid from '../components/home/ServicesGrid';
import SecuritySection from '../components/home/SecuritySection';
import Footer from '../components/home/Footer';

export default function LandingPage() {
  const [showQR, setShowQR] = useState(false);
  const [activeTab, setActiveTab] = useState('business');
  const [faqOpen, setFaqOpen] = useState({ 0: true });
  const navigate = useNavigate();

  const toggleFaq = (index) => {
    setFaqOpen((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // IntersectionObserver for staggered section reveal animations
  useEffect(() => {
    const reveals = document.querySelectorAll('.reveal-section');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
    );

    reveals.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#F9FAFB',
        color: '#111827',
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      {/* 1. Official Government Sovereign Status Bar */}
      <div
        style={{
          background: '#064E3B',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          padding: '0.45rem 1.5rem',
          fontSize: '0.78rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          zIndex: 30,
          color: '#FFFFFF',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Subtle Indian Tricolor Accent */}
          <div style={{ display: 'flex', height: '10px', width: '24px', borderRadius: '2px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)' }}>
            <span style={{ flex: 1, background: '#FF9933' }} />
            <span style={{ flex: 1, background: '#FFFFFF' }} />
            <span style={{ flex: 1, background: '#138808' }} />
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#FFFFFF', fontWeight: 700 }}>
            <Globe size={13} color="#FFFFFF" /> NATIONAL LEGAL METROLOGY DIGITAL NETWORK
          </span>
          <span style={{ color: 'rgba(255, 255, 255, 0.35)' }}>|</span>
          <span style={{ color: 'rgba(255, 255, 255, 0.85)' }}>Government of India • Ministry of Consumer Affairs</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#D1FAE5', fontWeight: 600 }}>
            <Radio size={12} color="#10B981" className="animate-pulse" /> Grid Active (36 States)
          </span>
          <Link
            to="/report-concern"
            style={{
              color: '#FEF3C7',
              textDecoration: 'none',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              transition: 'color 0.2s',
            }}
          >
            <AlertTriangle size={13} color="#F59E0B" /> Public Vigilance & Grievance Portal
          </Link>
        </div>
      </div>

      {/* 2. GOVERNMENT HERO SECTION */}
      <HeroSection
        onVerifyClick={() => scrollToSection('verification')}
        onExploreClick={() => scrollToSection('network')}
      />

      {/* 3. Quick Demo Access Strip */}
      <div style={{ padding: '0 1.5rem', margin: '-1.5rem 0 2rem 0', position: 'relative', zIndex: 30 }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.92)',
              border: '1px solid #E2E8F0',
              backdropFilter: 'blur(16px)',
              borderRadius: '14px',
              padding: '0.75rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.5rem',
              flexWrap: 'wrap',
              fontSize: '0.82rem',
              color: '#475569',
              boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)',
            }}
          >
            <span style={{ color: '#064E3B', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Info size={14} color="#064E3B" /> Quick Demo Credentials:
            </span>
            <span>
              <strong style={{ color: '#111827' }}>Business:</strong> business@mesuregx.demo <span style={{ color: '#EA580C' }}>(Business@123)</span>
            </span>
            <span>
              <strong style={{ color: '#111827' }}>Officer:</strong> officer@mesuregx.demo <span style={{ color: '#EA580C' }}>(Officer@123)</span>
            </span>
            <span>
              <strong style={{ color: '#111827' }}>Admin:</strong> admin@mesuregx.demo <span style={{ color: '#EA580C' }}>(Admin@123)</span>
            </span>
          </div>
        </div>
      </div>

      {/* 4. THE VERIFICATION JOURNEY */}
      <div className="reveal-section">
        <VerificationJourney />
      </div>

      {/* 5. LIVE PLATFORM METRICS */}
      <div className="reveal-section">
        <StatsPanel />
      </div>

      {/* 6. WHO WE SERVE */}
      <div className="reveal-section">
        <AudienceCards />
      </div>

      {/* 7. NATIONAL LEGAL METROLOGY NETWORK */}
      <div className="reveal-section">
        <NetworkSection />
      </div>

      {/* 8. PUBLIC VERIFICATION FEATURE */}
      <div className="reveal-section">
        <PublicVerification />
      </div>

      {/* 9. STATUTORY DIGITAL SERVICES */}
      <div className="reveal-section">
        <ServicesGrid />
      </div>

      {/* 10. UNIFIED MULTI-TIER WORKSPACE */}
      <section id="portals" className="reveal-section" style={{ padding: '6rem 1.5rem', background: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div
              style={{
                color: '#064E3B',
                fontSize: '0.8rem',
                fontWeight: 800,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: '0.65rem',
              }}
            >
              MULTI-PORTAL WORKSPACE
            </div>
            <h2
              style={{
                fontFamily: 'Outfit, Plus Jakarta Sans, sans-serif',
                fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
                fontWeight: 800,
                color: '#111827',
                letterSpacing: '-0.02em',
              }}
            >
              Dedicated Operational Environments
            </h2>
            <p style={{ color: '#475569', fontSize: '1.05rem', maxWidth: '680px', margin: '0.65rem auto 0', lineHeight: 1.6 }}>
              Tailored interfaces engineered specifically for business proprietors, field verification inspectors, and government regulators.
            </p>
          </div>

          {/* Portal Tabs Selector */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
            {[
              { id: 'business', label: 'Business Owner Portal', icon: <Building size={16} /> },
              { id: 'officer', label: 'Field Officer Mobile Console', icon: <Smartphone size={16} /> },
              { id: 'admin', label: 'State Administrative Oversight', icon: <ShieldCheck size={16} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                type="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.55rem',
                  padding: '0.75rem 1.4rem',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  background: activeTab === tab.id ? '#EA580C' : '#FFFFFF',
                  color: activeTab === tab.id ? '#FFFFFF' : '#064E3B',
                  border: activeTab === tab.id ? 'none' : '1px solid #CBD5E1',
                  boxShadow: activeTab === tab.id ? '0 4px 16px rgba(234, 88, 12, 0.28)' : '0 2px 6px rgba(15, 23, 42, 0.04)',
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Portal Preview Screen */}
          <div
            className="card"
            style={{
              padding: '2.5rem',
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #E2E8F0',
              borderRadius: '24px',
              boxShadow: '0 12px 40px rgba(15, 23, 42, 0.06)',
            }}
          >
            {activeTab === 'business' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'center' }}>
                <div>
                  <div
                    style={{
                      display: 'inline-block',
                      background: '#CCFBF1',
                      color: '#064E3B',
                      padding: '0.3rem 0.85rem',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      letterSpacing: '0.06em',
                      marginBottom: '1rem',
                      border: '1px solid rgba(15, 118, 110, 0.2)',
                    }}
                  >
                    COMMERCIAL ENTITY MANAGEMENT
                  </div>
                  <h3 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#111827', marginBottom: '1rem' }}>
                    Self-Service Metrology Portal
                  </h3>
                  <p style={{ color: '#475569', lineHeight: 1.65, marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                    Business owners manage their scale fleet, file initial and periodic verification applications, complete statutory treasury fee payments, and download certified verification certificates.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                    {[
                      'Real-time Application Tracking (SUBMITTED → APPROVED)',
                      'Instant Statutory Treasury Fee Payments & Form TR-6 Receipts',
                      '30-Day Certificate Expiry & Renewal Reminders',
                      'Integrated Grievance & Discrepancy Lodging',
                    ].map((t, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#111827', fontSize: '0.9rem' }}>
                        <CheckCircle2 size={16} color="#10B981" />
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                  <Link to="/business/dashboard" className="btn-cyber-primary">
                    Launch Business Workspace →
                  </Link>
                </div>
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
                    <span style={{ fontWeight: 700, color: '#064E3B' }}>Scale Fleet Overview</span>
                    <span className="badge badge-valid">3 Active</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ padding: '0.75rem', background: '#FFFFFF', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600, color: '#111827' }}>Avery Weigh-Tronix Class III</span>
                      <span className="badge badge-valid">Certified</span>
                    </div>
                    <div style={{ padding: '0.75rem', background: '#FFFFFF', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600, color: '#111827' }}>Mettler Toledo Bench Scale</span>
                      <span className="badge badge-valid">Certified</span>
                    </div>
                    <div style={{ padding: '0.75rem', background: '#FFFFFF', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600, color: '#111827' }}>Essae Retail Counter Scale</span>
                      <span className="badge badge-expiring_soon">Renewal Due</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'officer' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'center' }}>
                <div>
                  <div
                    style={{
                      display: 'inline-block',
                      background: '#D1FAE5',
                      color: '#064E3B',
                      padding: '0.3rem 0.85rem',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      letterSpacing: '0.06em',
                      marginBottom: '1rem',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                    }}
                  >
                    REGULATORY ENFORCEMENT
                  </div>
                  <h3 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#111827', marginBottom: '1rem' }}>
                    Field Inspector Mobile Console
                  </h3>
                  <p style={{ color: '#475569', lineHeight: 1.65, marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                    Authorized Legal Metrology Officers perform on-site inspections, input raw load deviations, compute automated MPE tolerance decisions, and digitally issue statutory verification certificates.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                    {[
                      'Interactive Load Testing Matrix (OIML R 76)',
                      'Automated PASS / FAIL Statutory Determination',
                      'Instant Cryptographic QR Certificate Minting',
                      'Tamper-evident Security Lead Seal Serialization',
                    ].map((t, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#111827', fontSize: '0.9rem' }}>
                        <CheckCircle2 size={16} color="#10B981" />
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                  <Link to="/officer/dashboard" className="btn-cyber-primary">
                    Launch Inspector Console →
                  </Link>
                </div>
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
                    <span style={{ fontWeight: 700, color: '#064E3B' }}>Field Test Tolerance Monitor</span>
                    <span className="badge badge-field_verification">OIML Class III</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ padding: '0.75rem', background: '#FFFFFF', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600, color: '#111827' }}>Load 1.000 kg</span>
                      <span style={{ color: '#10B981', fontWeight: 700 }}>Error: +0.001 kg (PASS)</span>
                    </div>
                    <div style={{ padding: '0.75rem', background: '#FFFFFF', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600, color: '#111827' }}>Load 5.000 kg</span>
                      <span style={{ color: '#10B981', fontWeight: 700 }}>Error: 0.000 kg (PASS)</span>
                    </div>
                    <div style={{ padding: '0.75rem', background: '#FFFFFF', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600, color: '#111827' }}>Load 15.000 kg</span>
                      <span style={{ color: '#10B981', fontWeight: 700 }}>Error: -0.002 kg (PASS)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'admin' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'center' }}>
                <div>
                  <div
                    style={{
                      display: 'inline-block',
                      background: '#DBEAFE',
                      color: '#1D4ED8',
                      padding: '0.3rem 0.85rem',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      letterSpacing: '0.06em',
                      marginBottom: '1rem',
                      border: '1px solid rgba(37, 99, 235, 0.3)',
                    }}
                  >
                    STATE METROLOGY DIRECTORS
                  </div>
                  <h3 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#111827', marginBottom: '1rem' }}>
                    Statewide Governance & Oversight
                  </h3>
                  <p style={{ color: '#475569', lineHeight: 1.65, marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                    Controllers of Legal Metrology track statewide compliance percentages, manage inspector assignments, review revenue collections, and inspect immutable audit trails.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                    {[
                      'District-level Verification Performance Analytics',
                      'Statutory Treasury Fee Collections & Reconciliation',
                      'Officer Accountability & Field Productivity Metrics',
                      'Comprehensive Audit Logging of All Regulatory Actions',
                    ].map((t, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#111827', fontSize: '0.9rem' }}>
                        <CheckCircle2 size={16} color="#10B981" />
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                  <Link to="/admin/dashboard" className="btn-cyber-primary">
                    Launch Director Portal →
                  </Link>
                </div>
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
                    <span style={{ fontWeight: 700, color: '#064E3B' }}>State Compliance Pulse</span>
                    <span className="badge badge-valid">98.4% Compliant</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ padding: '0.75rem', background: '#FFFFFF', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600, color: '#111827' }}>Delhi Central Zone</span>
                      <span style={{ color: '#064E3B', fontWeight: 700 }}>99.2% Verified</span>
                    </div>
                    <div style={{ padding: '0.75rem', background: '#FFFFFF', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600, color: '#111827' }}>Maharashtra Coastal</span>
                      <span style={{ color: '#064E3B', fontWeight: 700 }}>98.6% Verified</span>
                    </div>
                    <div style={{ padding: '0.75rem', background: '#FFFFFF', borderRadius: '10px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600, color: '#111827' }}>Karnataka Tech Hub</span>
                      <span style={{ color: '#064E3B', fontWeight: 700 }}>99.5% Verified</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 11. TRUST / SECURITY SECTION */}
      <div className="reveal-section">
        <SecuritySection />
      </div>

      {/* 12. OIML STANDARDS & STATUTORY ALIGNMENT */}
      <section id="standards" className="reveal-section" style={{ padding: '6rem 1.5rem', background: '#F1F5F9', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <div
            style={{
              color: '#064E3B',
              fontSize: '0.8rem',
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: '0.65rem',
            }}
          >
            STATUTORY ALIGNMENT
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
            Conforming to National & International Standards
          </h2>
          <p style={{ color: '#475569', fontSize: '1.05rem', maxWidth: '750px', margin: '0 auto 3.5rem', lineHeight: 1.6 }}>
            MESUREGX is built strictly adhering to national and international metrological conventions, ensuring cross-border recognition and strict legal validity in judicial proceedings.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.75rem', textAlign: 'left' }}>
            <div className="card" style={{ padding: '2.25rem', background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
              <div style={{ fontWeight: 800, color: '#064E3B', fontSize: '1.35rem', marginBottom: '0.5rem' }}>OIML R 76-1</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111827', marginBottom: '0.65rem' }}>
                Non-Automatic Weighing Instruments
              </div>
              <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.6 }}>
                Defines the metrological and technical requirements including verification scale intervals (e), maximum permissible errors, and repeatability tolerances.
              </p>
            </div>

            <div className="card" style={{ padding: '2.25rem', background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
              <div style={{ fontWeight: 800, color: '#EA580C', fontSize: '1.35rem', marginBottom: '0.5rem' }}>Legal Metrology Act 2009</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111827', marginBottom: '0.65rem' }}>
                General Rules 2011 Compliance
              </div>
              <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.6 }}>
                Governs mandatory annual re-verification, statutory stamping procedures, license provisions, and penalty structures for unverified commercial weights.
              </p>
            </div>

            <div className="card" style={{ padding: '2.25rem', background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
              <div style={{ fontWeight: 800, color: '#10B981', fontSize: '1.35rem', marginBottom: '0.5rem' }}>ISO/IEC 17025:2017</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111827', marginBottom: '0.65rem' }}>
                Testing & Calibration Laboratories
              </div>
              <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.6 }}>
                Guarantees standard mass traceability, environmental control logging during testing, and officer measurement uncertainty validation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 13. CONSUMER VIGILANCE / GRIEVANCE PORTAL CALLOUT */}
      <section
        className="reveal-section"
        style={{
          padding: '4.5rem 1.5rem',
          background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.06) 0%, rgba(234, 88, 12, 0.05) 100%)',
          borderBottom: '1px solid #E2E8F0',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#EA580C',
              fontWeight: 800,
              fontSize: '0.8rem',
              letterSpacing: '0.08em',
              marginBottom: '1rem',
            }}
          >
            <AlertTriangle size={16} color="#EA580C" /> CONSUMER PROTECTION VIGILANCE
          </div>
          <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 800, color: '#064E3B', marginBottom: '0.85rem' }}>
            Suspect a Faulty Scale or Broken Seal?
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#475569', lineHeight: 1.65, marginBottom: '2rem' }}>
            Citizens have the right to verified commercial measurements. Lodge an immediate vigilance report with photograph uploads for prompt investigation by district legal metrology officers.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/report-concern" className="btn-cyber-primary">
              <AlertTriangle size={18} color="#FFFFFF" strokeWidth={2.5} />
              <span>Lodge a Vigilance Report</span>
            </Link>
            <button
              type="button"
              onClick={() => scrollToSection('verification')}
              className="btn-cyber-secondary"
            >
              Check Certificate Validity First
            </button>
          </div>
        </div>
      </section>

      {/* 14. CITIZEN FREQUENTLY ASKED QUESTIONS */}
      <section id="faq" className="reveal-section" style={{ padding: '6rem 1.5rem', background: '#F9FAFB', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div
              style={{
                color: '#064E3B',
                fontSize: '0.8rem',
                fontWeight: 800,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: '0.65rem',
              }}
            >
              COMMON QUESTIONS
            </div>
            <h2
              style={{
                fontFamily: 'Outfit, Plus Jakarta Sans, sans-serif',
                fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
                fontWeight: 800,
                color: '#111827',
                letterSpacing: '-0.02em',
              }}
            >
              Frequently Asked Questions
            </h2>
            <p style={{ color: '#475569', fontSize: '1.05rem', margin: '0.65rem auto 0' }}>
              Answers regarding scale registration, physical inspections, tolerance rules, and public verification.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {[
              {
                q: 'Which commercial instruments are required by law to be verified?',
                a: 'Under Section 24 of the Legal Metrology Act 2009, all weighing and measuring devices used in commercial trade—including retail counter scales, weighbridges, electronic balances, fuel dispensers, and flow meters—must undergo initial and periodic annual verification.',
              },
              {
                q: 'How does the automated FastAPI Rule Engine determine PASS / FAIL?',
                a: 'The engine implements OIML R 76 tolerances. Based on the scale accuracy class (e.g. Class III Medium), maximum capacity, and verification scale interval (e), it compares load test errors against the statutory Maximum Permissible Error (MPE). If errors exceed allowed limits, verification fails.',
              },
              {
                q: 'What should a business do if an instrument fails field inspection?',
                a: 'When an inspection yields a REJECTED decision, the owner receives a detailed non-compliance notice specifying the load deviations. The scale must be calibrated by a licensed repairer and an application for re-verification must be submitted before resuming commercial use.',
              },
              {
                q: 'How can a consumer check if a merchant scale is legally verified?',
                a: 'Consumers can simply scan the QR code sticker affixed to the scale using any smartphone camera, or navigate to the MESUREGX Public Verification portal and enter the Certificate Number or Seal ID.',
              },
              {
                q: 'What happens when a citizen files a grievance or vigilance report?',
                a: 'Submitted grievances are logged with a unique tracking ID (e.g. CMP-2026-000001) and assigned to regional Legal Metrology Officers for investigation. Citizens can track the investigation findings and final resolution online.',
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="card"
                style={{
                  background: '#FFFFFF',
                  overflow: 'hidden',
                  borderRadius: '14px',
                  padding: 0,
                  border: '1px solid #E2E8F0',
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  style={{
                    width: '100%',
                    padding: '1.35rem 1.75rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'none',
                    border: 'none',
                    color: '#111827',
                    fontSize: '1.02rem',
                    fontWeight: 700,
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <span>{faq.q}</span>
                  {faqOpen[index] ? <ChevronUp size={20} color="#064E3B" /> : <ChevronDown size={20} color="#64748B" />}
                </button>
                {faqOpen[index] && (
                  <div
                    style={{
                      padding: '0 1.75rem 1.35rem',
                      color: '#475569',
                      fontSize: '0.92rem',
                      lineHeight: 1.65,
                      borderTop: '1px solid #F1F5F9',
                    }}
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 15. GOVERNMENT-GRADE FOOTER */}
      <Footer />

      {/* QR Scanner Modal */}
      <QRScannerModal isOpen={showQR} onClose={() => setShowQR(false)} />
    </div>
  );
}
