import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  QrCode,
  User,
  Scale,
  ExternalLink,
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';
import QRScannerModal from './QRScannerModal';

export default function PublicNavbar() {
  const { isAuthenticated, user } = useAuth();
  const [showQRModal, setShowQRModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getDashboardHome = () => {
    if (user?.role === 'ADMIN') return '/admin/dashboard';
    if (user?.role === 'OFFICER') return '/officer/dashboard';
    if (user?.role === 'GATC') return '/gatc/dashboard';
    return '/business/dashboard';
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/#about' },
    { name: 'Services', href: '/#services' },
    { name: 'Standards', href: '/#standards' },
    { name: 'Support', href: '/#faq' },
  ];

  const handleNavClick = (href) => {
    setMobileMenuOpen(false);
    if (href.startsWith('/#')) {
      const targetId = href.replace('/#', '');
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          const el = document.getElementById(targetId);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 200);
      } else {
        const el = document.getElementById(targetId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(href);
    }
  };

  return (
    <>
      {/* Official Government Sovereign Top Bar */}
      <div
        style={{
          background: '#0F172A',
          color: '#F8FAFC',
          fontSize: '0.74rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* National Flag Tricolor Ribbon */}
        <div style={{ height: '3px', display: 'flex', width: '100%' }}>
          <div style={{ flex: 1, backgroundColor: '#FF9933' }} />
          <div style={{ flex: 1, backgroundColor: '#FFFFFF' }} />
          <div style={{ flex: 1, backgroundColor: '#138808' }} />
        </div>

        <div
          style={{
            maxWidth: '1440px',
            margin: '0 auto',
            padding: '0.35rem 1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, color: '#F8FAFC', letterSpacing: '0.02em' }}>
              भारत सरकार | GOVERNMENT OF INDIA
            </span>
            <span style={{ color: '#64748B' }}>•</span>
            <span style={{ color: '#CBD5E1' }}>
              Ministry of Consumer Affairs, Food & Public Distribution
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#94A3B8' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <ShieldCheck size={13} color="#10B981" /> National Legal Metrology Grid
            </span>
            <span style={{ color: '#475569' }}>|</span>
            <a
              href="https://consumeraffairs.nic.in"
              target="_blank"
              rel="noreferrer"
              style={{ color: '#38BDF8', textDecoration: 'none', fontWeight: 600 }}
            >
              consumeraffairs.nic.in <ExternalLink size={10} style={{ display: 'inline', marginLeft: 2 }} />
            </a>
          </div>
        </div>
      </div>

      <header
        style={{
          height: '78px',
          background: scrolled ? 'rgba(255, 255, 255, 0.96)' : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(15, 118, 110, 0.12)',
          position: 'sticky',
          top: 0,
          zIndex: 60,
          transition: 'all 0.3s ease',
          boxShadow: scrolled ? '0 10px 30px rgba(15, 23, 42, 0.08)' : '0 4px 20px rgba(15, 23, 42, 0.04)',
        }}
      >
        <div
          style={{
            maxWidth: '1440px',
            height: '100%',
            margin: '0 auto',
            padding: '0 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo Brand with Official Seal Emblem */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', textDecoration: 'none' }}>
            {/* National Emblem & Scale Badge */}
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #064E3B 0%, #0F766E 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(6, 78, 59, 0.25)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                position: 'relative',
              }}
            >
              <Scale size={24} color="#FFFFFF" strokeWidth={2.4} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.45rem', color: '#064E3B', letterSpacing: '0.03em' }}>
                  MEASUREGX
                </span>
                <span style={{ fontSize: '0.68rem', backgroundColor: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0', fontWeight: 800, padding: '0.1rem 0.45rem', borderRadius: '4px' }}>
                  e-METROLOGY
                </span>
              </div>
              <span style={{ fontSize: '0.64rem', color: '#047857', fontWeight: 800, letterSpacing: '0.06em' }}>
                DEPARTMENT OF LEGAL METROLOGY • विधिक मापविज्ञान प्रभाग
              </span>
            </div>
          </Link>

          {/* Center Navigation Links (Public Pages Only) */}
          <nav className="desktop-only-view" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            {navLinks.map((link) => (
              <button
                key={link.name}
                type="button"
                onClick={() => handleNavClick(link.href)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#475569',
                  fontWeight: 600,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => (e.target.style.color = '#064E3B')}
                onMouseLeave={(e) => (e.target.style.color = '#475569')}
              >
                {link.name}
              </button>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event('measuregx:replay_splash'))}
              className="btn btn-outline btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              title="Replay 3-Second App Intro Splash Animation"
            >
              ▶ Intro Splash
            </button>

            <button
              type="button"
              onClick={() => setShowQRModal(true)}
              className="btn btn-outline btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <QrCode size={16} /> QR Scan
            </button>

            {isAuthenticated ? (
              <Link to={getDashboardHome()} className="btn btn-primary btn-sm">
                Go to Portal →
              </Link>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm">
                Portal Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {showQRModal && <QRScannerModal isOpen={showQRModal} onClose={() => setShowQRModal(false)} />}
    </>
  );
}
