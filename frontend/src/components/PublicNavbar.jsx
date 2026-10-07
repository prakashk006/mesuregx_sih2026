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
      <header
        style={{
          height: '76px',
          background: scrolled ? 'rgba(255, 255, 255, 0.94)' : 'rgba(255, 255, 255, 0.85)',
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
          {/* Logo Brand */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: '#064E3B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(6, 78, 59, 0.25)',
              }}
            >
              <Scale size={22} color="#FFFFFF" strokeWidth={2.4} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.4rem', color: '#064E3B', letterSpacing: '0.04em' }}>
                MEASUREGX
              </span>
              <span style={{ fontSize: '0.65rem', color: '#0F766E', fontWeight: 800, letterSpacing: '0.08em' }}>
                EVERY MEASURE MATTERS
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

          {/* Desktop Right Action Buttons */}
          <div className="desktop-only-view" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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

          {/* Mobile Right Controls: Quick QR + Hamburger Button */}
          <div className="mobile-only-view" style={{ display: 'none', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setShowQRModal(true)}
              className="btn btn-outline btn-sm"
              style={{ padding: '0.45rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              aria-label="Scan QR Code"
              title="Scan QR Code"
            >
              <QrCode size={16} color="#064E3B" />
              <span style={{ fontSize: '0.78rem' }}>QR</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              style={{
                background: mobileMenuOpen ? '#064E3B' : 'rgba(6, 78, 59, 0.08)',
                color: mobileMenuOpen ? '#FFFFFF' : '#064E3B',
                border: '1px solid rgba(6, 78, 59, 0.2)',
                borderRadius: '10px',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer & Backdrop */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 90,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Backdrop overlay */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.55)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              zIndex: 91,
            }}
          />

          {/* Slide-down Drawer Sheet */}
          <div
            style={{
              position: 'relative',
              zIndex: 92,
              background: '#FFFFFF',
              boxShadow: '0 20px 40px rgba(15, 23, 42, 0.2)',
              borderBottom: '2px solid #064E3B',
              padding: '1.25rem 1.25rem 1.75rem',
              maxHeight: 'calc(100dvh - 76px)',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              animation: 'mobileSlideDown 0.25s ease-out',
            }}
          >
            {/* Header / User Status */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '0.85rem',
                borderBottom: '1px solid #E2E8F0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: '#064E3B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Scale size={18} color="#FFFFFF" />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#064E3B' }}>
                    MEASUREGX
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748B' }}>
                    {isAuthenticated ? `Signed in (${user?.role || 'User'})` : 'National Metrology Portal'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  padding: '4px',
                  cursor: 'pointer',
                }}
                aria-label="Close Menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Navigation Links list */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  type="button"
                  onClick={() => handleNavClick(link.href)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '10px',
                    color: '#064E3B',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <span>{link.name}</span>
                  <span style={{ color: '#0F766E', fontSize: '0.9rem' }}>→</span>
                </button>
              ))}

              <Link
                to="/report-concern"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: '10px',
                  color: '#991B1B',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  textDecoration: 'none',
                }}
              >
                <span>⚠ Report Measurement Concern</span>
                <span style={{ fontSize: '0.9rem' }}>→</span>
              </Link>
            </nav>

            {/* Mobile Drawer Quick Action Buttons */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid #E2E8F0',
              }}
            >
              {isAuthenticated ? (
                <Link
                  to={getDashboardHome()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-primary"
                  style={{ justifyContent: 'center', padding: '0.75rem' }}
                >
                  Go to Portal Dashboard →
                </Link>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn btn-primary"
                  style={{ justifyContent: 'center', padding: '0.75rem' }}
                >
                  Portal Sign In
                </Link>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowQRModal(true);
                  }}
                  className="btn btn-outline"
                  style={{ justifyContent: 'center', fontSize: '0.85rem' }}
                >
                  <QrCode size={16} /> QR Scan
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    window.dispatchEvent(new Event('measuregx:replay_splash'));
                  }}
                  className="btn btn-outline"
                  style={{ justifyContent: 'center', fontSize: '0.85rem' }}
                >
                  ▶ Intro Splash
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showQRModal && <QRScannerModal isOpen={showQRModal} onClose={() => setShowQRModal(false)} />}
    </>
  );
}
