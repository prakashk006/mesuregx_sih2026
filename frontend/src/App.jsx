import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Navigation & Layout
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PublicVerificationPage from './pages/PublicVerificationPage';
import PublicReportConcernPage from './pages/PublicReportConcernPage';
import NotificationsPage from './pages/NotificationsPage';

// Business Pages
import BusinessDashboard from './pages/business/BusinessDashboard';
import BusinessProfile from './pages/business/BusinessProfile';
import InstrumentManagement from './pages/business/InstrumentManagement';
import NewApplicationPage from './pages/business/NewApplicationPage';
import ApplicationTrackingPage from './pages/business/ApplicationTrackingPage';
import BusinessCertificates from './pages/business/BusinessCertificates';
import BusinessPaymentsPage from './pages/business/BusinessPaymentsPage';
import BusinessComplaintsPage from './pages/business/BusinessComplaintsPage';

// Officer Pages
import OfficerDashboard from './pages/officer/OfficerDashboard';
import OfficerApplicationsList from './pages/officer/OfficerApplicationsList';
import ApplicationDetailPage from './pages/officer/ApplicationDetailPage';
import FieldVerificationPage from './pages/officer/FieldVerificationPage';
import OfficerCertificates from './pages/officer/OfficerCertificates';
import OfficerSchedulePage from './pages/officer/OfficerSchedulePage';
import OfficerComplaintsPage from './pages/officer/OfficerComplaintsPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminOfficersPage from './pages/admin/AdminOfficersPage';
import AdminRulesPage from './pages/admin/AdminRulesPage';
import AdminAuditLogsPage from './pages/admin/AdminAuditLogsPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminPaymentsPage from './pages/admin/AdminPaymentsPage';
import AdminComplaintsPage from './pages/admin/AdminComplaintsPage';

// Enforcement & Documentation Pages
import EnforcementDashboardPage from './pages/enforcement/EnforcementDashboardPage';
import EnforcementDetailPage from './pages/enforcement/EnforcementDetailPage';
import BusinessEnforcementPage from './pages/business/BusinessEnforcementPage';
import SystemArchitecturePage from './pages/docs/SystemArchitecturePage';

// Protected Route Guard
function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 0' }}>
        <h3>Loading Session...</h3>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect to their default dashboard
    if (user?.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user?.role === 'OFFICER') return <Navigate to="/officer/dashboard" replace />;
    return <Navigate to="/business/dashboard" replace />;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        {children}
      </div>
    </div>
  );
}

// Public Layout wrapper (with top Navbar)
function PublicLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <PublicLayout>
                <LandingPage />
              </PublicLayout>
            }
          />
          <Route
            path="/login"
            element={
              <PublicLayout>
                <LoginPage />
              </PublicLayout>
            }
          />
          <Route
            path="/register"
            element={
              <PublicLayout>
                <RegisterPage />
              </PublicLayout>
            }
          />
          <Route
            path="/verify"
            element={
              <PublicLayout>
                <PublicVerificationPage />
              </PublicLayout>
            }
          />
          <Route
            path="/verify/:certificateNumber"
            element={
              <PublicLayout>
                <PublicVerificationPage />
              </PublicLayout>
            }
          />
          <Route
            path="/report-concern"
            element={
              <PublicLayout>
                <PublicReportConcernPage />
              </PublicLayout>
            }
          />
          <Route
            path="/architecture"
            element={
              <PublicLayout>
                <SystemArchitecturePage />
              </PublicLayout>
            }
          />
          <Route
            path="/docs"
            element={
              <PublicLayout>
                <SystemArchitecturePage />
              </PublicLayout>
            }
          />
          <Route
            path="/system-architecture"
            element={
              <PublicLayout>
                <SystemArchitecturePage />
              </PublicLayout>
            }
          />

          {/* Business Owner Routes */}
          <Route
            path="/business"
            element={<Navigate to="/business/dashboard" replace />}
          />
          <Route
            path="/business/dashboard"
            element={
              <ProtectedRoute allowedRoles={['BUSINESS_OWNER']}>
                <BusinessDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/business/profile"
            element={
              <ProtectedRoute allowedRoles={['BUSINESS_OWNER']}>
                <BusinessProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/business/instruments"
            element={
              <ProtectedRoute allowedRoles={['BUSINESS_OWNER']}>
                <InstrumentManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/business/instruments/new"
            element={
              <ProtectedRoute allowedRoles={['BUSINESS_OWNER']}>
                <InstrumentManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/business/applications"
            element={
              <ProtectedRoute allowedRoles={['BUSINESS_OWNER']}>
                <ApplicationTrackingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/business/applications/new"
            element={
              <ProtectedRoute allowedRoles={['BUSINESS_OWNER']}>
                <NewApplicationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/business/certificates"
            element={
              <ProtectedRoute allowedRoles={['BUSINESS_OWNER']}>
                <BusinessCertificates />
              </ProtectedRoute>
            }
          />
          <Route
            path="/business/payments"
            element={
              <ProtectedRoute allowedRoles={['BUSINESS_OWNER']}>
                <BusinessPaymentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/business/complaints"
            element={
              <ProtectedRoute allowedRoles={['BUSINESS_OWNER']}>
                <BusinessComplaintsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/business/enforcement"
            element={
              <ProtectedRoute allowedRoles={['BUSINESS_OWNER']}>
                <BusinessEnforcementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/business/notifications"
            element={
              <ProtectedRoute allowedRoles={['BUSINESS_OWNER']}>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />

          {/* Legal Metrology Officer Routes */}
          <Route
            path="/officer"
            element={<Navigate to="/officer/dashboard" replace />}
          />
          <Route
            path="/officer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['OFFICER', 'ADMIN']}>
                <OfficerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/officer/applications"
            element={
              <ProtectedRoute allowedRoles={['OFFICER', 'ADMIN']}>
                <OfficerApplicationsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/officer/applications/:id"
            element={
              <ProtectedRoute allowedRoles={['OFFICER', 'ADMIN']}>
                <ApplicationDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/officer/schedule"
            element={
              <ProtectedRoute allowedRoles={['OFFICER', 'ADMIN']}>
                <OfficerSchedulePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/officer/verification"
            element={
              <ProtectedRoute allowedRoles={['OFFICER', 'ADMIN']}>
                <FieldVerificationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/officer/verification/:id"
            element={
              <ProtectedRoute allowedRoles={['OFFICER', 'ADMIN']}>
                <FieldVerificationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/officer/certificates"
            element={
              <ProtectedRoute allowedRoles={['OFFICER', 'ADMIN']}>
                <OfficerCertificates />
              </ProtectedRoute>
            }
          />
          <Route
            path="/officer/complaints"
            element={
              <ProtectedRoute allowedRoles={['OFFICER', 'ADMIN']}>
                <OfficerComplaintsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/officer/enforcement"
            element={
              <ProtectedRoute allowedRoles={['OFFICER', 'ADMIN']}>
                <EnforcementDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/officer/enforcement/:id"
            element={
              <ProtectedRoute allowedRoles={['OFFICER', 'ADMIN', 'BUSINESS_OWNER']}>
                <EnforcementDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/officer/notifications"
            element={
              <ProtectedRoute allowedRoles={['OFFICER', 'ADMIN']}>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />

          {/* System Administrator Routes */}
          <Route
            path="/admin"
            element={<Navigate to="/admin/dashboard" replace />}
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/businesses"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/officers"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminOfficersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/instruments"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <InstrumentManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/applications"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <OfficerApplicationsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/certificates"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <OfficerCertificates />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/rules"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminRulesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/audit-logs"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminAuditLogsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/payments"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminPaymentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/complaints"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminComplaintsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/enforcement"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <EnforcementDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-All Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
