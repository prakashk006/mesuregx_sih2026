import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const role = user?.role;

  return (
    <aside className="app-sidebar">
      <div className="sidebar-header">
        <div className="brand-badge">M</div>
        <div>
          <div className="brand-title">MESUREGX</div>
          <div style={{ fontSize: '0.7rem', color: '#06b6d4', fontWeight: 600, letterSpacing: '0.05em' }}>
            LEGAL METROLOGY
          </div>
        </div>
      </div>

      <nav className="sidebar-menu">
        {/* BUSINESS OWNER MENU */}
        {role === 'BUSINESS_OWNER' && (
          <>
            <NavLink
              to="/business/dashboard"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink
              to="/business/profile"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Building2 size={18} />
              <span>My Business</span>
            </NavLink>
            <NavLink
              to="/business/instruments"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Scale size={18} />
              <span>Instruments</span>
            </NavLink>
            <NavLink
              to="/business/applications"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <FileText size={18} />
              <span>Applications</span>
            </NavLink>
            <NavLink
              to="/business/payments"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <CreditCard size={18} />
              <span>Payments & Treasury</span>
            </NavLink>
            <NavLink
              to="/business/certificates"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Award size={18} />
              <span>Certificates</span>
            </NavLink>
            <NavLink
              to="/business/complaints"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <AlertCircle size={18} />
              <span>Grievances / Helpdesk</span>
            </NavLink>
            <NavLink
              to="/business/enforcement"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <ShieldAlert size={18} />
              <span>Compliance Notices</span>
            </NavLink>
            <NavLink
              to="/business/notifications"
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
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink
              to="/officer/applications"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <FileText size={18} />
              <span>Applications</span>
            </NavLink>
            <NavLink
              to="/officer/schedule"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Calendar size={18} />
              <span>Schedule</span>
            </NavLink>
            <NavLink
              to="/officer/verification"
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
              <ShieldAlert size={18} />
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

        {/* ADMIN MENU */}
        {role === 'ADMIN' && (
          <>
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink
              to="/admin/users"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Users size={18} />
              <span>Users</span>
            </NavLink>
            <NavLink
              to="/admin/officers"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <ClipboardCheck size={18} />
              <span>Officers</span>
            </NavLink>
            <NavLink
              to="/admin/instruments"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Scale size={18} />
              <span>Instruments</span>
            </NavLink>
            <NavLink
              to="/admin/applications"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <FileText size={18} />
              <span>Applications</span>
            </NavLink>
            <NavLink
              to="/admin/payments"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <CreditCard size={18} />
              <span>Treasury & Fees</span>
            </NavLink>
            <NavLink
              to="/admin/complaints"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <AlertCircle size={18} />
              <span>Grievance Oversight</span>
            </NavLink>
            <NavLink
              to="/admin/certificates"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Award size={18} />
              <span>Certificates</span>
            </NavLink>
            <NavLink
              to="/admin/rules"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Sliders size={18} />
              <span>Verification Rules</span>
            </NavLink>
            <NavLink
              to="/admin/audit-logs"
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
            <NavLink
              to="/admin/enforcement"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <ShieldAlert size={18} />
              <span>Enforcement Directorate</span>
            </NavLink>
          </>
        )}

        <div style={{ margin: '1rem 0 0.5rem', borderTop: '1px solid rgba(255,255,255,0.08)' }} />
        <NavLink
          to="/architecture"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <Layers size={18} />
          <span>System Architecture</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.8rem', color: '#e2e8f0', fontWeight: 600 }}>
            {user?.name || 'User'}
          </span>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
            {user?.officer?.officerCode || user?.business?.city || user?.role}
          </span>
        </div>
        <button
          onClick={logout}
          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          title="Logout"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
