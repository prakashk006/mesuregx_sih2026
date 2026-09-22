import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  QrCode,
  LogOut,
  User,
  ShieldCheck,
  Search,
  Menu,
  X,
  Radio,
  ExternalLink,
  Building,
  Scale
} from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import QRScannerModal from './QRScannerModal';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [showQRModal, setShowQRModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getDashboardHome = () => {
    if (user?.role === 'ADMIN') return '/admin/dashboard';
    if (user?.role === 'OFFICER') return '/officer/dashboard';
    return '/business/dashboard';
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/#about' },
    { name: 'Services', href: '/#services' },
    { name: 'Network', href: '/#network' },
    { name: 'Resources', href: '/#standards' },
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
          height: '78px',
          background: scrolled
            ? 'rgba(255, 255, 255, 0.92)'
            : 'rgba(255, 255, 255, 0.82)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(15, 118, 110, 0.12)',
          position: 'sticky',
          top: 0,
          zIndex: 60,
          transition: 'all 0.3s ease',
          boxShadow: scrolled
            ? '0 10px 30px rgba(15, 23, 42, 0.08), 0 0 1px rgba(15, 118, 110, 0.12)'
            : '0 4px 20px rgba(15, 23, 42, 0.04)',
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
            gap: '1rem',
          }}
        >
          {/* LEFT: MeasureGX Logo + Subtitle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <Link
              to={user ? getDashboardHome() : '/'}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}
            >
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
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  position: 'relative',
                }}
              >
                <Scale size={22} color="#FFFFFF" strokeWidth={2.4} />
                <div
                  style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#10B981',
                    boxShadow: '0 0 6px #10B981',
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontFamily: 'Outfit, Plus Jakarta Sans, sans-serif',
                    fontWeight: 800,
                    fontSize: '1.4rem',
                    color: '#064E3B',
                    letterSpacing: '0.04em',
                    lineHeight: 1.1,
                  }}
                >
                  MEASURE<span style={{ color: '#EA580C' }}>GX</span>
                </span>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color: '#64748B',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    marginTop: '2px',
                  }}
                >
                  Digital Metrology Platform
                </span>
              </div>
            </Link>
          </div>

          {/* CENTER: Navigation Links (Desktop) */}
          <nav
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '1.8rem',
            }}
            className="desktop-nav-links"
          >
            {navLinks.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => handleNavClick(item.href)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: location.pathname === item.href ? '#064E3B' : '#475569',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '0.5rem 0.2rem',
                  position: 'relative',
                  transition: 'color 0.2s ease',
                  letterSpacing: '0.01em',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#064E3B')}
                onMouseLeave={(e) => {
                  if (location.pathname !== item.href) {
                    e.currentTarget.style.color = '#475569';
                  }
                }}
              >
                {item.name}
                {location.pathname === item.href && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      height: '2px',
                      background: '#EA580C',
                      borderRadius: '2px',
                    }}
                  />
                )}
              </button>
            ))}
          </nav>

          {/* RIGHT: Government of India Identity Badge + Auth / QR */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            {/* Government of India Identity Badge */}
            <div
              className="gov-badge-desktop"
              style={{
                display: 'none',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.35rem 0.75rem',
                background: '#F1F5F9',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '0.72rem',
                color: '#475569',
              }}
            >
              <div
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#EA580C',
                  boxShadow: '0 0 6px rgba(234, 88, 12, 0.4)',
                }}
              />
              <span style={{ fontWeight: 700, color: '#064E3B' }}>Govt of India</span>
              <span style={{ opacity: 0.4 }}>|</span>
              <span style={{ color: '#0F766E' }}>Legal Metrology</span>
            </div>

            {/* Quick QR Scanner Modal Button */}
            <button
              onClick={() => setShowQRModal(true)}
              style={{
                background: '#F0FDFA',
                border: '1px solid rgba(15, 118, 110, 0.35)',
                color: '#064E3B',
                padding: '0.45rem 0.85rem',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              title="Scan scale QR code"
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#CCFBF1';
                e.currentTarget.style.borderColor = '#0F766E';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#F0FDFA';
                e.currentTarget.style.borderColor = 'rgba(15, 118, 110, 0.35)';
              }}
            >
              <QrCode size={15} color="#064E3B" />
              <span className="verify-qr-text">Scan QR</span>
            </button>

            {/* Auth Buttons */}
            {user ? (
              <>
                <NotificationDropdown />

                <Link
                  to={getDashboardHome()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.35rem 0.75rem',
                    background: '#FFFFFF',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
                    textDecoration: 'none',
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: '#064E3B',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                    }}
                  >
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#111827', lineHeight: 1.1 }}>
                      {user.name}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: '#0F766E', fontWeight: 600 }}>
                      {user.role?.replace('_', ' ')}
                    </span>
                  </div>
                </Link>

                <button
                  onClick={logout}
                  className="btn btn-outline btn-sm"
                  title="Log Out"
                  style={{
                    padding: '0.45rem',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF',
                    color: '#64748B',
                    cursor: 'pointer',
                  }}
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Link
                  to="/login"
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    color: '#064E3B',
                    padding: '0.45rem 1.1rem',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#0F766E';
                    e.currentTarget.style.background = '#F0FDFA';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#CBD5E1';
                    e.currentTarget.style.background = '#FFFFFF';
                  }}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  style={{
                    background: '#EA580C',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '0.48rem 1.15rem',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    boxShadow: '0 4px 14px rgba(234, 88, 12, 0.25)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#C2410C';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#EA580C';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Menu Button */}
            <button
              type="button"
              className="mobile-hamburger-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: 'none',
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '0.45rem',
                color: '#064E3B',
                cursor: 'pointer',
              }}
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(24px)',
              borderBottom: '1px solid #E2E8F0',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              boxShadow: '0 20px 40px rgba(15, 23, 42, 0.1)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {navLinks.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => handleNavClick(item.href)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#111827',
                    fontSize: '1rem',
                    fontWeight: 600,
                    textAlign: 'left',
                    padding: '0.5rem 0',
                    borderBottom: '1px solid #F1F5F9',
                    cursor: 'pointer',
                  }}
                >
                  {item.name}
                </button>
              ))}
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 0.75rem',
                background: '#F1F5F9',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                fontSize: '0.78rem',
                color: '#475569',
              }}
            >
              <div
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#EA580C',
                  boxShadow: '0 0 6px rgba(234, 88, 12, 0.4)',
                }}
              />
              <span>Government of India • Ministry of Legal Metrology</span>
            </div>

            {!user && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    textAlign: 'center',
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    color: '#064E3B',
                    padding: '0.65rem',
                    borderRadius: '10px',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    textDecoration: 'none',
                  }}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    textAlign: 'center',
                    background: '#EA580C',
                    color: '#FFFFFF',
                    padding: '0.65rem',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    textDecoration: 'none',
                  }}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* QR Scanner Modal */}
      <QRScannerModal isOpen={showQRModal} onClose={() => setShowQRModal(false)} />

      {/* Style overrides for responsive navbar breakpoints */}
      <style>{`
        @media (min-width: 900px) {
          .desktop-nav-links {
            display: flex !important;
          }
          .gov-badge-desktop {
            display: flex !important;
          }
        }
        @media (max-width: 899px) {
          .mobile-hamburger-btn {
            display: flex !important;
          }
          .verify-qr-text {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
