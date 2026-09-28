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
