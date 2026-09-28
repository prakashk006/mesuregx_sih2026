import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import {
  LayoutDashboard,
  Building2,
  Scale,
  FileText,
  Award,
  Bell,
  Calendar,
  ClipboardCheck,
  Users,
  ShieldAlert,
  Sliders,
  BarChart3,
  LogOut,
  CreditCard,
  AlertCircle,
  Menu,
  ChevronLeft,
  Gavel
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { isPinned, togglePin, isHovered, setIsHovered, isMobileOpen, closeMobileSidebar } = useSidebar();
  const role = user?.role;

  const isExpanded = isPinned || isHovered;

  return (
    <>
      <div
        className={`mobile-drawer-overlay ${isMobileOpen ? 'active' : ''}`}
        onClick={closeMobileSidebar}
      />
      <aside
        className={`app-sidebar ${isPinned ? 'pinned' : 'mini-rail'} ${
          isHovered ? 'is-hovered' : ''
        } ${isMobileOpen ? 'mobile-open' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1 }}>
            <div className="brand-badge">M</div>
            <div className="sidebar-brand-text">
              <div className="brand-title">MEASUREGX</div>
              <div style={{ fontSize: '0.65rem', color: '#10B981', fontWeight: 800, letterSpacing: '0.06em' }}>
                EVERY MEASURE MATTERS
              </div>
            </div>
          </div>
          <button
            className="mobile-only-view"
            onClick={closeMobileSidebar}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.5rem' }}
          >
            ✕
          </button>
        </div>

        <nav className="sidebar-menu" onClick={closeMobileSidebar}>
        {/* BUSINESS OWNER MENU */}
        {role === 'BUSINESS_OWNER' && (
          <>
            <NavLink
              to="/business/dashboard"
              title="Dashboard"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink
              to="/business/profile"
              title="My Business"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Building2 size={18} />
              <span>My Business</span>
            </NavLink>
            <NavLink
              to="/business/instruments"
              title="Instruments"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Scale size={18} />
              <span>Instruments</span>
            </NavLink>
            <NavLink
              to="/business/applications"
              title="Applications"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <FileText size={18} />
              <span>Applications</span>
            </NavLink>
            <NavLink
              to="/business/payments"
              title="Payments & Treasury"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <CreditCard size={18} />
              <span>Payments & Treasury</span>
            </NavLink>
            <NavLink
              to="/business/certificates"
              title="Certificates"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Award size={18} />
              <span>Certificates</span>
            </NavLink>
            <NavLink
              to="/business/complaints"
              title="Grievances / Helpdesk"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <AlertCircle size={18} />
              <span>Grievances / Helpdesk</span>
            </NavLink>
            <NavLink
              to="/business/notifications"
              title="Notifications"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Bell size={18} />
              <span>Notifications</span>
            </NavLink>
          </>
        )}

        {/* OFFICER MENU */}
        {role === 'OFFICER' && (
          <>
            <NavLink
              to="/officer/dashboard"
              title="Dashboard"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink
              to="/officer/applications"
              title="Applications"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <FileText size={18} />
              <span>Applications</span>
            </NavLink>
            <NavLink
              to="/officer/schedule"
              title="Schedule"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Calendar size={18} />
              <span>Schedule</span>
            </NavLink>
            <NavLink
              to="/officer/verification"
              title="Field Verification"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <ClipboardCheck size={18} />
              <span>Field Verification</span>
            </NavLink>
            <NavLink
              to="/officer/certificates"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Award size={18} />
              <span>Certificates</span>
            </NavLink>
            <NavLink
              to="/officer/complaints"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <AlertCircle size={18} />
              <span>Grievance Inquiries</span>
            </NavLink>
            <NavLink
              to="/officer/enforcement"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Gavel size={18} />
              <span>Enforcement Cases</span>
            </NavLink>
            <NavLink
              to="/officer/notifications"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Bell size={18} />
              <span>Notifications</span>
            </NavLink>
          </>
        )}

        {/* GATC LABORATORY MENU */}
        {role === 'GATC' && (
          <>
            <NavLink
              to="/gatc/dashboard"
              title="Lab Dashboard"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <LayoutDashboard size={18} />
              <span>Lab Dashboard</span>
            </NavLink>
            <NavLink
              to="/gatc/assignments"
              title="Allocated Tests"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <ClipboardCheck size={18} />
              <span>Allocated Tests</span>
            </NavLink>
            <NavLink
              to="/gatc/verification"
              title="Enter Test Readings"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Scale size={18} />
              <span>Enter Test Readings</span>
            </NavLink>
            <NavLink
              to="/gatc/certificates"
              title="Lab Certificates"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Award size={18} />
              <span>Lab Certificates</span>
            </NavLink>
            <NavLink
              to="/gatc/notifications"
              title="Notifications"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Bell size={18} />
              <span>Notifications</span>
            </NavLink>
          </>
        )}

        {/* ADMIN MENU */}
        {role === 'ADMIN' && (
          <>
            <NavLink
              to="/admin/dashboard"
              title="Dashboard"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink
              to="/admin/users"
              title="Users"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Users size={18} />
              <span>Users</span>
            </NavLink>
            <NavLink
              to="/admin/officers"
              title="Officers"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <ClipboardCheck size={18} />
              <span>Officers</span>
            </NavLink>
            <NavLink
              to="/admin/gatcs"
              title="Authorized GATCs"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Building2 size={18} />
              <span>Authorized GATCs</span>
            </NavLink>
            <NavLink
              to="/admin/enforcement"
              title="Statutory Enforcement"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Gavel size={18} />
              <span>Statutory Enforcement</span>
            </NavLink>
            <NavLink
              to="/admin/instruments"
              title="Instruments"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Scale size={18} />
              <span>Instruments</span>
            </NavLink>
            <NavLink
              to="/admin/applications"
              title="Applications"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <FileText size={18} />
              <span>Applications</span>
            </NavLink>
            <NavLink
              to="/admin/payments"
              title="Treasury & Fees"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <CreditCard size={18} />
              <span>Treasury & Fees</span>
            </NavLink>
            <NavLink
              to="/admin/complaints"
              title="Grievance Oversight"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <AlertCircle size={18} />
              <span>Grievance Oversight</span>
            </NavLink>
            <NavLink
              to="/admin/certificates"
              title="Certificates"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Award size={18} />
              <span>Certificates</span>
            </NavLink>
            <NavLink
              to="/admin/rules"
              title="Verification Rules"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Sliders size={18} />
              <span>Verification Rules</span>
            </NavLink>
            <NavLink
              to="/admin/audit-logs"
              title="Audit Logs"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <ShieldAlert size={18} />
              <span>Audit Logs</span>
            </NavLink>
            <NavLink
              to="/admin/reports"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <BarChart3 size={18} />
              <span>Reports</span>
            </NavLink>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
          <div className="sidebar-user-avatar" title={user?.name || 'User'}>
            {(user?.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="sidebar-user-meta" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <span style={{ fontSize: '0.8rem', color: '#e2e8f0', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || 'User'}
            </span>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.officer?.officerCode || user?.business?.city || user?.role}
            </span>
          </div>
        </div>
        <button
          onClick={logout}
          className="sidebar-logout-btn"
          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.4rem' }}
          title="Sign Out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  </>
);
}
