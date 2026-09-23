import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldAlert,
  AlertTriangle,
  FileCheck,
  CheckCircle,
  Clock,
  Scale,
  Plus,
  Search,
  Filter,
  Eye,
  RefreshCw,
  Building,
  MapPin,
  Calendar,
  BarChart3,
  List,
  Layers,
  X,
  FileText,
  Smartphone,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const VIOLATION_TYPES = [
  'Expired Verification',
  'Failed Verification',
  'Non-Compliant Instrument',
  'Missing Certificate',
  'Incorrect Display',
  'Tampering/Irregularity',
  'Other',
];

const STATUS_OPTIONS = [
  'ALL',
  'OPEN',
  'UNDER_REVIEW',
  'INSPECTION_REQUIRED',
  'VIOLATION_CONFIRMED',
  'ACTION_PENDING',
  'NOTICE_ISSUED',
  'FOLLOW_UP',
  'RESOLVED',
  'CLOSED',
];

const PRIORITY_OPTIONS = ['ALL', 'Low', 'Medium', 'High', 'Critical'];

const CHART_COLORS = ['#EA580C', '#0F766E', '#2563EB', '#D97706', '#EF4444', '#8B5CF6', '#10B981'];

export default function EnforcementDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('cases'); // 'cases', 'analytics', 'jurisdiction'
  const [stats, setStats] = useState(null);
  const [cases, setCases] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [violationFilter, setViolationFilter] = useState('ALL');
  const [districtFilter, setDistrictFilter] = useState('ALL');

  // New Case Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [linkableData, setLinkableData] = useState(null);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    businessId: '',
    instrumentId: '',
    applicationId: '',
    certificateId: '',
    complaintId: '',
    violationType: 'Expired Verification',
    priority: 'Medium',
    location: '',
    district: '',
    remarks: '',
    observations: '',
    initialActionType: 'Warning / Notice',
    initialActionDescription: 'Statutory compliance notice initiated.',
  });

  // Load Dashboard Data
  const loadData = async () => {
    try {
      setRefreshing(true);
      const [statsRes, casesRes, analyticsRes] = await Promise.all([
        api.get('/enforcement/stats'),
        api.get('/enforcement', {
          params: {
            search: searchTerm || undefined,
            status: statusFilter !== 'ALL' ? statusFilter : undefined,
            priority: priorityFilter !== 'ALL' ? priorityFilter : undefined,
            violationType: violationFilter !== 'ALL' ? violationFilter : undefined,
            district: districtFilter !== 'ALL' ? districtFilter : undefined,
          },
        }),
        api.get('/enforcement/analytics'),
      ]);

      setStats(statsRes.data?.data);
      setCases(casesRes.data?.data?.cases || []);
      setAnalytics(analyticsRes.data?.data);
    } catch (err) {
      console.error('Failed to load enforcement dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchTerm, statusFilter, priorityFilter, violationFilter, districtFilter]);

  // Load linkable records when opening create modal
  const openCreateModal = async () => {
    setShowCreateModal(true);
    setFormError('');
    try {
      const res = await api.get('/enforcement/linkable-records');
      setLinkableData(res.data?.data);
    } catch (err) {
      console.error('Failed to load linkable records:', err);
    }
  };

  // Handle Create Case Submit
  const handleCreateCase = async (e) => {
    e.preventDefault();
    setCreating(true);
    setFormError('');
    try {
      const res = await api.post('/enforcement', formData);
      setShowCreateModal(false);
      // Reset form
      setFormData({
        businessId: '',
        instrumentId: '',
        applicationId: '',
        certificateId: '',
        complaintId: '',
        violationType: 'Expired Verification',
        priority: 'Medium',
        location: '',
        district: '',
        remarks: '',
        observations: '',
        initialActionType: 'Warning / Notice',
        initialActionDescription: 'Statutory compliance notice initiated.',
      });
      await loadData();
      if (res.data?.data?.id) {
        navigate(`/officer/enforcement/${res.data.data.id}`);
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create enforcement case.');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="page-body" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <RefreshCw size={36} className="spin-animate" style={{ color: '#0F766E', margin: '0 auto 1rem' }} />
        <h3 style={{ color: '#064E3B' }}>Loading Legal Metrology Enforcement Module...</h3>
      </div>
    );
  }

  return (
    <div className="page-body" style={{ maxWidth: '1440px', margin: '0 auto', padding: '1.5rem' }}>
      {/* HEADER BANNER */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, #064E3B 0%, #0F766E 100%)',
          padding: '1.75rem 2rem',
          borderRadius: '16px',
          color: '#FFFFFF',
          boxShadow: '0 10px 25px rgba(6, 78, 59, 0.18)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
            <span
              style={{
                background: 'rgba(255,255,255,0.15)',
                padding: '0.25rem 0.65rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.05em',
              }}
            >
              STATUTORY SURVEILLANCE
            </span>
            <span style={{ fontSize: '0.8rem', opacity: 0.9 }}>
              Tamil Nadu State Legal Metrology Enforcement Directorate
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
            Enforcement Monitoring & Compliance Console
          </h1>
          <p style={{ margin: '0.4rem 0 0', opacity: 0.85, fontSize: '0.9rem' }}>
            Full lifecycle tracking: Detection ➔ Investigation ➔ Evidence ➔ Statutory Action ➔ Resolution
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={loadData}
            className="btn btn-outline"
            style={{
              color: '#FFFFFF',
              borderColor: 'rgba(255,255,255,0.3)',
              background: 'rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
            title="Refresh Data"
          >
            <RefreshCw size={16} className={refreshing ? 'spin-animate' : ''} />
            <span>Sync</span>
          </button>

          {user?.role !== 'BUSINESS_OWNER' && (
            <button
              onClick={openCreateModal}
              className="btn"
              style={{
                background: '#EA580C',
                color: '#FFFFFF',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: 700,
                boxShadow: '0 4px 14px rgba(234, 88, 12, 0.4)',
              }}
            >
              <Plus size={18} />
              <span>Register Enforcement Case</span>
            </button>
          )}
        </div>
      </div>

      {/* DASHBOARD CARDS (8 Real-time Indicators) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <StatCard
          icon={AlertTriangle}
          label="Open Cases"
          value={stats?.openCases || 0}
          subtext="Under active inquiry"
          color="#EA580C"
        />
        <StatCard
          icon={Clock}
          label="Under Review"
          value={stats?.underReview || 0}
          subtext="Supervisor / LMO review"
          color="#2563EB"
        />
        <StatCard
          icon={ShieldAlert}
          label="Violations Confirmed"
          value={stats?.violationsConfirmed || 0}
          subtext="Physical evidence logged"
          color="#DC2626"
        />
        <StatCard
          icon={Layers}
          label="Actions Pending"
          value={stats?.actionsPending || 0}
          subtext="Statutory notices due"
          color="#D97706"
        />
        <StatCard
          icon={FileCheck}
          label="Notices Issued"
          value={stats?.noticesIssued || 0}
          subtext="Sec. 24 notices dispatched"
          color="#0F766E"
        />
        <StatCard
          icon={CheckCircle}
          label="Resolved Cases"
          value={stats?.resolvedCases || 0}
          subtext="Compliance verified"
          color="#10B981"
        />
        <StatCard
          icon={TrendingUp}
          label="Repeat Violations"
          value={stats?.repeatViolations || 0}
          subtext="Traders with > 1 infraction"
          color="#7C3AED"
        />
        <StatCard
          icon={Scale}
          label="Expired Scales"
          value={stats?.expiredInstruments || 0}
          subtext="Unverified active devices"
          color="#9A3412"
        />
      </div>

      {/* NAVIGATION TABS */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          borderBottom: '2px solid #E2E8F0',
          marginBottom: '1.5rem',
        }}
      >
        <button
          onClick={() => setActiveTab('cases')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'cases' ? '3px solid #064E3B' : '3px solid transparent',
            color: activeTab === 'cases' ? '#064E3B' : '#64748B',
            fontWeight: activeTab === 'cases' ? 700 : 500,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <List size={18} />
          <span>Active Enforcement Dossiers ({cases.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'analytics' ? '3px solid #064E3B' : '3px solid transparent',
            color: activeTab === 'analytics' ? '#064E3B' : '#64748B',
            fontWeight: activeTab === 'analytics' ? 700 : 500,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <BarChart3 size={18} />
          <span>Surveillance Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('jurisdiction')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'jurisdiction' ? '3px solid #064E3B' : '3px solid transparent',
            color: activeTab === 'jurisdiction' ? '#064E3B' : '#64748B',
            fontWeight: activeTab === 'jurisdiction' ? 700 : 500,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <MapPin size={18} />
          <span>District & Jurisdiction Oversight</span>
        </button>
      </div>

      {/* TAB 1: CASES TABLE & FILTER */}
      {activeTab === 'cases' && (
        <div>
          {/* SEARCH & FILTERS BAR */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '12px',
              padding: '1.25rem',
              boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
              border: '1px solid #E2E8F0',
              marginBottom: '1.5rem',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ flex: '1 1 300px', position: 'relative' }}>
              <Search
                size={18}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}
              />
              <input
                type="text"
                className="form-control"
                placeholder="Search by Case ID, Business, Instrument, Location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              <select
                className="form-control"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ width: 'auto' }}
              >
                <option value="ALL">Status: All Statuses</option>
                {STATUS_OPTIONS.filter((s) => s !== 'ALL').map((st) => (
                  <option key={st} value={st}>
                    {st.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>

              <select
                className="form-control"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                style={{ width: 'auto' }}
              >
                <option value="ALL">Priority: All</option>
                {PRIORITY_OPTIONS.filter((p) => p !== 'ALL').map((p) => (
                  <option key={p} value={p}>
                    {p} Priority
                  </option>
                ))}
              </select>

              <select
                className="form-control"
                value={violationFilter}
                onChange={(e) => setViolationFilter(e.target.value)}
                style={{ width: 'auto' }}
              >
                <option value="ALL">Violation: All</option>
                {VIOLATION_TYPES.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* CASES LIST TABLE */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              overflow: 'hidden',
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table className="table" style={{ margin: 0, width: '100%', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>CASE ID</th>
                    <th style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>BUSINESS / SITE</th>
                    <th style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>VIOLATION TYPE</th>
                    <th style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>PRIORITY</th>
                    <th style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>LIFECYCLE STATUS</th>
                    <th style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>ASSIGNED OFFICER</th>
                    <th style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>DETECTED DATE</th>
                    <th style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 700, color: '#475569', textAlign: 'right' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {cases.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#64748B' }}>
                        <ShieldAlert size={36} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
                        <div style={{ fontWeight: 600, fontSize: '1rem' }}>No enforcement cases found.</div>
                        <p style={{ fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
                          Try adjusting your search criteria or register a new case from field observations.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    cases.map((c) => (
                      <tr
                        key={c.id}
                        style={{
                          borderBottom: '1px solid #F1F5F9',
                          cursor: 'pointer',
                          transition: 'background 0.2s ease',
                        }}
                        onClick={() => navigate(`/officer/enforcement/${c.id}`)}
                      >
                        <td style={{ padding: '1rem', fontWeight: 700, color: '#064E3B' }}>
                          {c.caseNumber}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontWeight: 600, color: '#1E293B' }}>
                            {c.business?.businessName || 'Spot Location Inspection'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <MapPin size={12} />
                            <span>{c.location || c.district}</span>
                          </div>
                        </td>
                        <td style={{ padding: '1rem', fontWeight: 500, color: '#334155' }}>
                          <span
                            style={{
                              background: '#F1F5F9',
                              padding: '0.2rem 0.55rem',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                            }}
                          >
                            {c.violationType}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <StatusBadge status={c.priority?.toUpperCase()} size="sm" />
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <StatusBadge status={c.status} size="sm" />
                        </td>
                        <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#475569' }}>
                          {c.officer?.name || 'Unassigned'}
                        </td>
                        <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#64748B' }}>
                          {new Date(c.detectedDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/officer/enforcement/${c.id}`);
                            }}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                          >
                            <Eye size={14} />
                            <span>Dossier</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ANALYTICS TAB */}
      {activeTab === 'analytics' && analytics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem' }}>
          {/* Monthly Trend */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '14px',
              padding: '1.5rem',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
            }}
          >
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#064E3B', margin: '0 0 1rem' }}>
              Enforcement Cases by Month (6-Month Trend)
            </h3>
            <div style={{ height: '280px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.monthlyTrend}>
                  <XAxis dataKey="month" stroke="#64748B" />
                  <YAxis stroke="#64748B" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="cases" name="Cases Registered" fill="#EA580C" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="resolved" name="Cases Resolved" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Violations by Type */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '14px',
              padding: '1.5rem',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
            }}
          >
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#064E3B', margin: '0 0 1rem' }}>
              Infractions by Violation Classification
            </h3>
            <div style={{ height: '280px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.violationsByType}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    label
                  >
                    {analytics.violationsByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Open vs Resolved */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '14px',
              padding: '1.5rem',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
            }}
          >
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#064E3B', margin: '0 0 1rem' }}>
              Active vs. Resolved Compliance Dossiers
            </h3>
            <div style={{ height: '280px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.openVsResolved}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={5}
                    label
                  >
                    {analytics.openVsResolved.map((entry, index) => (
                      <Cell key={`cell-ovr-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Conversion Ratio */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '14px',
              padding: '1.5rem',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
            }}
          >
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#064E3B', margin: '0 0 1rem' }}>
              Field Inspection ➔ Enforcement Ratio
            </h3>
            <div style={{ padding: '1rem 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ color: '#475569' }}>Total Inspections Conducted:</span>
                <strong>{analytics.totalInspections}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ color: '#475569' }}>Failed Tolerance / Non-Compliant:</span>
                <strong style={{ color: '#DC2626' }}>{analytics.failedInspections}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ color: '#475569' }}>Formal Enforcement Conversion:</span>
                <strong style={{ color: '#EA580C' }}>{analytics.conversionRate}%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <span style={{ color: '#475569' }}>Habitual / Repeat Offenders:</span>
                <strong style={{ color: '#7C3AED' }}>{analytics.repeatCasesCount} Businesses</strong>
              </div>

              <div
                style={{
                  background: '#F8FAFC',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px dashed #CBD5E1',
                  fontSize: '0.85rem',
                  color: '#475569',
                }}
              >
                <strong>Statutory Standard:</strong> Legal Metrology General Rules (2011) mandate immediate Section 24 show-cause issuance for devices exceeding Maximum Permissible Error (MPE) tolerances.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DISTRICT MONITORING */}
      {activeTab === 'jurisdiction' && analytics && (
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
            boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#064E3B' }}>
              District-Wise Jurisdiction Activity & Enforcement Intensity
            </h3>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#64748B' }}>
              Statewide jurisdictional compliance metrics across Tamil Nadu administrative zones
            </p>
          </div>

          <table className="table" style={{ margin: 0, width: '100%', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F1F5F9', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '1rem', fontWeight: 700, color: '#475569' }}>DISTRICT / ZONE</th>
                <th style={{ padding: '1rem', fontWeight: 700, color: '#475569' }}>TOTAL DOSSIERS</th>
                <th style={{ padding: '1rem', fontWeight: 700, color: '#475569' }}>ACTIVE / OPEN</th>
                <th style={{ padding: '1rem', fontWeight: 700, color: '#475569' }}>RESOLVED</th>
                <th style={{ padding: '1rem', fontWeight: 700, color: '#475569' }}>HIGH / CRITICAL PRIORITY</th>
                <th style={{ padding: '1rem', fontWeight: 700, color: '#475569', textAlign: 'right' }}>COMPLIANCE RATE</th>
              </tr>
            </thead>
            <tbody>
              {analytics.districtWiseCases.map((d) => {
                const compRate = d.total > 0 ? Math.round((d.resolved / d.total) * 100) : 100;
                return (
                  <tr key={d.district} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '1rem', fontWeight: 600, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MapPin size={16} style={{ color: '#0F766E' }} />
                      <span>{d.district}</span>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 700 }}>{d.total}</td>
                    <td style={{ padding: '1rem', color: '#EA580C', fontWeight: 600 }}>{d.open}</td>
                    <td style={{ padding: '1rem', color: '#10B981', fontWeight: 600 }}>{d.resolved}</td>
                    <td style={{ padding: '1rem' }}>
                      {d.highPriority > 0 ? (
                        <span style={{ color: '#DC2626', fontWeight: 700 }}>{d.highPriority} Cases</span>
                      ) : (
                        <span style={{ color: '#64748B' }}>0</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <span
                        style={{
                          padding: '0.2rem 0.6rem',
                          borderRadius: '12px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          background: compRate > 50 ? '#DCFCE7' : '#FEF3C7',
                          color: compRate > 50 ? '#15803D' : '#B45309',
                        }}
                      >
                        {compRate}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL: REGISTER ENFORCEMENT CASE LINKED TO EXISTING RECORDS */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              padding: '2rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#064E3B', margin: 0 }}>
                  Register Legal Metrology Enforcement Case
                </h2>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#64748B' }}>
                  Link to existing applications, commercial instruments, or complaints without duplicating records.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div
                style={{
                  background: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  color: '#991B1B',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  fontSize: '0.85rem',
                }}
              >
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateCase}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label className="form-label">Link Existing Business *</label>
                  <select
                    className="form-control"
                    value={formData.businessId}
                    onChange={(e) => {
                      const bId = e.target.value;
                      const selectedB = linkableData?.businesses?.find((b) => b.id === bId);
                      setFormData({
                        ...formData,
                        businessId: bId,
                        district: selectedB ? selectedB.district : formData.district,
                        location: selectedB ? `${selectedB.ownerName} (${selectedB.city})` : formData.location,
                      });
                    }}
                    required
                  >
                    <option value="">-- Select Registered Business --</option>
                    {linkableData?.businesses?.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.businessName} ({b.district})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Link Existing Instrument</label>
                  <select
                    className="form-control"
                    value={formData.instrumentId}
                    onChange={(e) => setFormData({ ...formData, instrumentId: e.target.value })}
                  >
                    <option value="">-- Optional: Link Scale / Meter --</option>
                    {linkableData?.instruments
                      ?.filter((i) => !formData.businessId || i.businessId === formData.businessId)
                      .map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.customId} - {i.model} ({i.status})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label className="form-label">Violation Classification *</label>
                  <select
                    className="form-control"
                    value={formData.violationType}
                    onChange={(e) => setFormData({ ...formData, violationType: e.target.value })}
                    required
                  >
                    {VIOLATION_TYPES.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Enforcement Priority *</label>
                  <select
                    className="form-control"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    required
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                    <option value="Critical">Critical Priority (Immediate Action)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label className="form-label">Inspection Site Location *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 15 Cross Cut Road, Gandhipuram"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Administrative District *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Coimbatore, Chennai, Tiruppur"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">Initial Inspection Observation & Findings *</label>
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder="Record on-site findings, MPE tolerance error, broken seals, or missing stamp..."
                  value={formData.observations}
                  onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label className="form-label">Initial Statutory Action</label>
                  <select
                    className="form-control"
                    value={formData.initialActionType}
                    onChange={(e) => setFormData({ ...formData, initialActionType: e.target.value })}
                  >
                    <option value="Warning / Notice">Warning / Notice Issued</option>
                    <option value="Correction Required">Correction Required</option>
                    <option value="Re-inspection">Re-inspection Mandated</option>
                    <option value="Follow-up Required">Follow-up Required</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Action Memo / Instructions</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Mandated verification within 7 working days"
                    value={formData.initialActionDescription}
                    onChange={(e) => setFormData({ ...formData, initialActionDescription: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn"
                  style={{ background: '#064E3B', color: '#FFFFFF', fontWeight: 700 }}
                >
                  {creating ? 'Registering...' : 'Register Enforcement Dossier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
