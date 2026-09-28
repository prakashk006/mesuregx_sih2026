import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  Scale,
  CreditCard,
  Award,
  Users,
  ShieldCheck,
  Building,
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function MobileBottomNav() {
  const { user } = useAuth();
  const role = user?.role;

  if (!role) return null;

  // Tabs configured per role for optimal one-thumb mobile access
  let navItems = [];

  if (role === 'BUSINESS_OWNER') {
    navItems = [
      { to: '/business/dashboard', label: 'Home', icon: LayoutDashboard },
      { to: '/business/instruments', label: 'Instruments', icon: Scale },
      { to: '/business/applications/new', label: 'Apply', icon: FileText },
      { to: '/business/payments', label: 'Payments', icon: CreditCard },
      { to: '/business/certificates', label: 'Certificates', icon: Award },
    ];
  } else if (role === 'OFFICER') {
    navItems = [
      { to: '/officer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/officer/applications', label: 'Queue', icon: FileText },
      { to: '/officer/schedule', label: 'Schedule', icon: Calendar },
      { to: '/officer/certificates', label: 'Verifications', icon: ShieldCheck },
    ];
  } else if (role === 'ADMIN') {
    navItems = [
      { to: '/admin/dashboard', label: 'Admin', icon: LayoutDashboard },
      { to: '/admin/applications', label: 'Applications', icon: FileText },
      { to: '/admin/officers', label: 'Officers', icon: Users },
      { to: '/admin/payments', label: 'Treasury', icon: CreditCard },
    ];
  } else if (role === 'GATC') {
    navItems = [
      { to: '/gatc/dashboard', label: 'Lab Home', icon: LayoutDashboard },
      { to: '/gatc/assignments', label: 'Calibrations', icon: Scale },
      { to: '/certificates/repository', label: 'Repo', icon: Award },
    ];
  }

  return (
    <nav className="mobile-bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `mobile-bottom-nav-item ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
