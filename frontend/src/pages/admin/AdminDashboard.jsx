import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Building2,
  Scale,
  FileText,
  Award,
  Users,
  ShieldCheck,
  AlertTriangle,
  Sliders,
  ShieldAlert,
  BarChart3,
  ArrowRight,
} from 'lucide-react';
import StatCard from '../../components/StatCard';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.get('/admin/dashboard');
        setData(res.data?.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="page-body" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <h3>Loading System Administration...</h3>
      </div>
    );
  }

  const s = data?.stats || {};
  const statusChartData = (data?.statusChart || []).filter((d) => d.value > 0);

  return (
    <div className="page-body">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', color: '#0f172a' }}>System Administration Portal</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Statewide Legal Metrology administration, officer allocations, rule thresholds, and audit governance
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/admin/rules" className="btn btn-navy">
            <Sliders size={16} /> Verification Rules
          </Link>
          <Link to="/admin/audit-logs" className="btn btn-outline">
            <ShieldAlert size={16} /> Audit Trail
          </Link>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="stat-grid">
        <StatCard
          title="Registered Businesses"
          value={s.totalBusinesses || 0}
          icon={<Building2 size={24} />}
          color="blue"
        />
        <StatCard
          title="Total Instruments"
          value={s.totalInstruments || 0}
          icon={<Scale size={24} />}
          color="cyan"
        />
        <StatCard
          title="Verification Applications"
          value={s.totalApplications || 0}
          icon={<FileText size={24} />}
          color="amber"
        />
        <StatCard
          title="Verified Instruments"
          value={s.verifiedInstruments || 0}
          icon={<ShieldCheck size={24} />}
          color="green"
        />
        <StatCard
          title="Active Certificates"
          value={s.activeCertificates || 0}
          icon={<Award size={24} />}
          color="purple"
        />
        <StatCard
          title="Registered Officers"
          value={s.registeredOfficers || 0}
          icon={<Users size={24} />}
          color="blue"
        />
        <StatCard
          title="Expiring Within 30 Days"
          value={s.expiringSoonCertificates || 0}
          icon={<AlertTriangle size={24} />}
          color="amber"
        />
        <StatCard
          title="Compliance Pass Rate"
          value={`${s.passRate || 0}%`}
          icon={<ShieldCheck size={24} />}
          color="green"
        />
      </div>

      {/* Split View: Quick Admin Actions & Status Pipeline */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Status Distribution */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#0f172a' }}>
            Statewide Application Pipeline
          </h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Admin Modules */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#0f172a' }}>
              Governance Modules
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Quick access to administrative control panels
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <Link
                to="/admin/users"
                className="btn btn-outline"
                style={{ justifyContent: 'flex-start', padding: '0.85rem 1rem' }}
              >
                <Users size={18} color="#2563eb" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Users</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Account control</div>
                </div>
              </Link>

              <Link
                to="/admin/officers"
                className="btn btn-outline"
                style={{ justifyContent: 'flex-start', padding: '0.85rem 1rem' }}
              >
                <Users size={18} color="#0891b2" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Officers</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Inspector roster</div>
                </div>
              </Link>

              <Link
                to="/admin/rules"
                className="btn btn-outline"
                style={{ justifyContent: 'flex-start', padding: '0.85rem 1rem' }}
              >
                <Sliders size={18} color="#d97706" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Rules</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Tolerances & limits</div>
                </div>
              </Link>

              <Link
                to="/admin/reports"
                className="btn btn-outline"
                style={{ justifyContent: 'flex-start', padding: '0.85rem 1rem' }}
              >
                <BarChart3 size={18} color="#059669" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Reports</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>District analytics</div>
                </div>
              </Link>
            </div>
          </div>

          <div
            style={{
              marginTop: '1.5rem',
              padding: '1rem',
              background: 'var(--glass-subtle)',
              borderRadius: '12px',
              border: '1px solid var(--glass-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ fontSize: '0.85rem', color: 'var(--secondary-text)' }}>
              Review recent administrative actions and security events
            </div>
            <Link to="/admin/audit-logs" className="btn btn-navy btn-sm">
              Audit Trail <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
