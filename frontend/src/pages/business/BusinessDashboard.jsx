import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Scale,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  FileText,
  ExternalLink,
} from 'lucide-react';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function BusinessDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await api.get('/business/dashboard');
        setData(res.data?.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="page-body" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <div className="brand-badge" style={{ margin: '0 auto 1rem', width: 44, height: 44 }}>
          M
        </div>
        <h3>Loading Business Dashboard...</h3>
      </div>
    );
  }

  const stats = data?.stats || {
    totalInstruments: 0,
    pendingApplications: 0,
    verifiedInstruments: 0,
    expiringSoon: 0,
  };

  const chartData = (data?.statusChart || []).filter((d) => d.value > 0);

  return (
    <div className="page-body">
      {/* Page Header */}
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
          <h1 style={{ fontSize: '1.75rem', color: '#0f172a' }}>Business Dashboard</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Overview of measuring instruments, verification requests, and certificates
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/business/instruments/new" className="btn btn-outline">
            <PlusCircle size={16} /> Register Instrument
          </Link>
          <Link to="/business/applications/new" className="btn btn-primary">
            <FileText size={16} /> Apply for Verification
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="stat-grid">
        <StatCard
          title="Total Instruments"
          value={stats.totalInstruments}
          icon={<Scale size={24} />}
          color="blue"
        />
        <StatCard
          title="Pending Applications"
          value={stats.pendingApplications}
          icon={<Clock size={24} />}
          color="amber"
        />
        <StatCard
          title="Verified Instruments"
          value={stats.verifiedInstruments}
          icon={<ShieldCheck size={24} />}
          color="green"
        />
        <StatCard
          title="Expiring Within 30 Days"
          value={stats.expiringSoon}
          icon={<AlertTriangle size={24} />}
          color="red"
        />
      </div>

      {/* Expiry Alerts Banner if any */}
      {data?.expiryAlerts && data.expiryAlerts.length > 0 && (
        <div
          style={{
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fbbf24', marginBottom: '0.75rem' }}>
            <AlertTriangle size={20} />
            <h3 style={{ fontSize: '1rem', color: '#fbbf24', margin: 0 }}>
              Certificate Expiry Alerts ({data.expiryAlerts.length} Instruments)
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {data.expiryAlerts.map((alert) => (
              <div
                key={alert.certificateId}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '0.65rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                <div>
                  <strong style={{ color: '#ffffff' }}>{alert.instrumentId}</strong> — <span style={{ color: 'rgba(255,255,255,0.85)' }}>{alert.instrumentName}</span> (Cert: <span style={{ color: '#06b6d4' }}>{alert.certificateNumber}</span>)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '0.85rem', color: '#fbbf24', fontWeight: 600 }}>
                    Expires in {alert.daysRemaining} days
                  </span>
                  <Link
                    to={`/business/applications/new?instrumentId=${alert.instrumentId}`}
                    className="btn btn-sm btn-primary"
                  >
                    Apply Re-Verification
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts & Recent Applications Split */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {/* Application Status Distribution */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#ffffff' }}>
            Verification Status Breakdown
          </h3>
          {chartData.length === 0 ? (
            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--secondary-text)' }}>
              No applications submitted yet.
            </div>
          ) : (
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Recent Applications List */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#ffffff', margin: 0 }}>Recent Applications</h3>
            <Link to="/business/applications" style={{ fontSize: '0.85rem', color: '#06b6d4', fontWeight: 600 }}>
              View All <ArrowRight size={14} style={{ display: 'inline' }} />
            </Link>
          </div>

          {(!data?.recentApplications || data.recentApplications.length === 0) ? (
            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--secondary-text)' }}>
              No recent verification applications.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {data.recentApplications.map((app) => (
                <div
                  key={app.id}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: '1px solid var(--glass-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'var(--glass-subtle)',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff' }}>
                      {app.applicationNumber}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--secondary-text)' }}>
                      {app.instrumentId} — {app.instrumentName}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <StatusBadge status={app.status} />
                    <Link
                      to={`/business/applications`}
                      className="btn btn-outline btn-sm"
                      style={{ padding: '0.25rem 0.5rem' }}
                    >
                      <ExternalLink size={12} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
