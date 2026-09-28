import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import {
  Menu,
  QrCode,
  LogOut,
  User,
  ShieldCheck,
  Building,
  Scale,
  Award
} from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import QRScannerModal from './QRScannerModal';

export default function DashboardHeader() {
  const { user, logout } = useAuth();
  const { isCollapsed, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const [showQRModal, setShowQRModal] = useState(false);

  const role = user?.role;

  const handleMenuClick = () => {
    if (window.innerWidth <= 767) {
      toggleMobileSidebar();
    } else {
      toggleSidebar();
    }
  };

  // Role Portal Identity Badges
  const getPortalInfo = () => {
    if (role === 'ADMIN') {
      return {
        title: 'STATE ADMINISTRATION PORTAL',
        badge: 'GOVT ADMIN',
        bg: '#064E3B',
        color: '#ffffff',
      };
    }
    if (role === 'OFFICER') {
      return {
        title: 'LEGAL METROLOGY OFFICER',
        badge: user?.officer?.officerCode || 'TN-LMO',
        bg: '#0F766E',
        color: '#ffffff',
      };
    }
    if (role === 'GATC') {
      return {
        title: 'GATC LABORATORY PORTAL',
        badge: user?.gatc?.gatcCode || 'GATC-AUTH',
        bg: '#2563EB',
        color: '#ffffff',
      };
    }
    return {
      title: 'TRADER PORTAL',
      badge: 'VERIFIED TRADER',
      bg: '#EA580C',
      color: '#ffffff',
    };
  };

  const portal = getPortalInfo();

  return (
    <>
      <header
        style={{
          height: '64px',
          background: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--color-border)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          padding: '0 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 10px rgba(15, 23, 42, 0.04)',
        }}
      >
        {/* Left Side: Hamburger Sidebar Toggle + Loginer Portal Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            type="button"
            className="sidebar-toggle-btn"
            onClick={handleMenuClick}
            title={isCollapsed ? 'Expand sidebar menu' : 'Collapse sidebar menu'}
            aria-label="Toggle menu"
            style={{
              background: '#F1F5F9',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              padding: '0.45rem',
              color: '#064E3B',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
          >
            <Menu size={20} color="#064E3B" />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 800,
                    fontSize: '1.05rem',
                    color: '#0F172A',
                    letterSpacing: '-0.01em',
                  }}
                >
                  MEASUREGX — {portal.title}
                </span>
                <span
                  style={{
                    background: portal.bg,
                    color: portal.color,
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    padding: '0.18rem 0.5rem',
                    borderRadius: '6px',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  {portal.badge}
                </span>
              </div>
              <span style={{ fontSize: '0.65rem', color: '#0F766E', fontWeight: 800, letterSpacing: '0.08em' }}>
                EVERY MEASURE MATTERS
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Features (QR Scanner, Notifications, Profile Chip, Logout) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Quick QR Scanner */}
          <button
            type="button"
            onClick={() => setShowQRModal(true)}
            className="btn btn-outline btn-sm"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              borderColor: 'var(--color-border-strong)',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
            title="Scan Legal Metrology QR Certificate"
          >
            <QrCode size={15} style={{ color: '#0F766E' }} />
            <span className="desktop-only-view">Scan QR</span>
          </button>

          {/* Notifications Dropdown */}
          <NotificationDropdown />

          {/* User Profile Chip */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.3rem 0.6rem',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
            }}
          >
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: '#064E3B',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.8rem',
              }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="desktop-only-view" style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', lineHeight: 1.2 }}>
                {user?.name || 'User'}
              </span>
              <span style={{ fontSize: '0.68rem', color: '#64748B' }}>
                {user?.officer?.officerCode || user?.business?.businessName || user?.role}
              </span>
            </div>
          </div>

          {/* Quick Logout Button */}
          <button
            type="button"
            onClick={logout}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748B',
              cursor: 'pointer',
              padding: '0.4rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Sign Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* QR Scanner Modal */}
      {showQRModal && (
        <QRScannerModal isOpen={showQRModal} onClose={() => setShowQRModal(false)} />
      )}
    </>
  );
}
