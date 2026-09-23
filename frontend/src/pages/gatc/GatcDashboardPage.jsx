import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import {
  ClipboardCheck,
  Clock,
  CheckCircle,
  AlertTriangle,
  Building2,
  Calendar,
  Award,
  ArrowRight,
  TrendingUp,
  FlaskConical,
  Scale,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export default function GatcDashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  const fetchDashboardStats = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/gatc/dashboard');
      if (res.data?.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load GATC dashboard stats:', err);
      setError('Unable to load GATC dashboard analytics. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const COLORS = ['#0F766E', '#2563EB', '#10B981', '#EA580C'];

  return (
    <div style={{ padding: '1.5rem', maxWidth: 1400, margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #0F766E 0%, #064E3B 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(15, 118, 110, 0.3)',
            }}>
              <FlaskConical size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                {stats?.gatc?.name || user?.name || 'GATC Command Center'}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--secondary-text)', marginTop: '0.2rem' }}>
                <span style={{ color: '#38bdf8', fontWeight: 600 }}>{stats?.gatc?.gatcCode || 'GATC-TN'}</span>
                <span>•</span>
                <span>Authorized Jurisdiction: {stats?.gatc?.district || 'Tamil Nadu'}</span>
                <span>•</span>
                <span style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <CheckCircle size={13} /> {stats?.gatc?.status || 'ACTIVE'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={fetchDashboardStats}
            className="btn btn-outline btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <Link
            to="/gatc/applications"
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#0F766E' }}
          >
            <ClipboardCheck size={16} />
            <span>Open Verification Queue</span>
          </Link>
        </div>
      </div>

      {error && (
        <div style={{
          padding: '0.85rem 1rem',
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 8,
          color: '#f87171',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.9rem',
        }}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '1rem',
        marginBottom: '1.75rem',
      }}>
        {/* Card 1: Assigned */}
        <div className="card" style={{ padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                Total Allocated
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#ffffff', marginTop: '0.4rem' }}>
                {loading ? '...' : (stats?.kpis?.totalAssigned ?? 0)}
              </div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 8, background: 'rgba(37, 99, 235, 0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Scale size={20} />
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.75rem' }}>
            Cumulative test allocations
          </div>
        </div>

        {/* Card 2: Pending Tests */}
        <div className="card" style={{ padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                Pending Acceptance
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#f59e0b', marginTop: '0.4rem' }}>
                {loading ? '...' : (stats?.kpis?.pendingTests ?? 0)}
              </div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 8, background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={20} />
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#fbbf24', marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            Action required in queue
          </div>
        </div>

        {/* Card 3: In Progress */}
        <div className="card" style={{ padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                Under Testing
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#38bdf8', marginTop: '0.4rem' }}>
                {loading ? '...' : (stats?.kpis?.inProgressTests ?? 0)}
              </div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 8, background: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FlaskConical size={20} />
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.75rem' }}>
            Active laboratory verification
          </div>
        </div>

        {/* Card 4: Today's Tests */}
        <div className="card" style={{ padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                Scheduled Today
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#a855f7', marginTop: '0.4rem' }}>
                {loading ? '...' : (stats?.kpis?.todaysTests ?? 0)}
              </div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 8, background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={20} />
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.75rem' }}>
            Appointments for today
          </div>
        </div>

        {/* Card 5: Completed Tests */}
        <div className="card" style={{ padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                Completed Tests
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#10B981', marginTop: '0.4rem' }}>
                {loading ? '...' : (stats?.kpis?.completedTests ?? 0)}
              </div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 8, background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={20} />
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '0.75rem' }}>
            Results submitted
          </div>
        </div>

        {/* Card 6: Certificates */}
        <div className="card" style={{ padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--secondary-text)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                Certificates Issued
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#34d399', marginTop: '0.4rem' }}>
                {loading ? '...' : (stats?.kpis?.certificatesIssued ?? 0)}
              </div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 8, background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={20} />
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.75rem' }}>
            Attributed to this test lab
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Chart 1: Monthly Testing Volume */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#ffffff', margin: 0 }}>Monthly Testing Volume</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--secondary-text)', margin: '0.2rem 0 0' }}>Completed vs Pending Verifications</p>
            </div>
            <TrendingUp size={18} color="#0F766E" />
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.monthlyVolume || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: 'var(--glass-border)', borderRadius: 8, fontSize: '0.8rem' }}
                />
                <Bar dataKey="completed" name="Completed Tests" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" name="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Instrument Categories */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#ffffff', margin: 0 }}>Instrument Categories Tested</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--secondary-text)', margin: '0.2rem 0 0' }}>Distribution across test standards</p>
            </div>
            <Scale size={18} color="#0F766E" />
          </div>
          <div style={{ width: '100%', height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.categoryStats || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="name"
                >
                  {(stats?.categoryStats || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: 'var(--glass-border)', borderRadius: 8, fontSize: '0.8rem' }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '0.75rem', paddingTop: '0.5rem' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Active Queue & Recent Tests Table */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#ffffff', margin: 0 }}>
              Recent Allocations & Priority Queue
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--secondary-text)', margin: '0.2rem 0 0' }}>
              Applications assigned to your Government Approved Test Centre
            </p>
          </div>
          <Link
            to="/gatc/applications"
            style={{ fontSize: '0.85rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none', fontWeight: 500 }}
          >
            <span>View Full Queue ({stats?.kpis?.activeQueueCount ?? 0})</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--secondary-text)' }}>
            Loading assignments...
          </div>
        ) : !stats?.recentAssignments || stats.recentAssignments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--secondary-text)' }}>
            <ClipboardCheck size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
            <p>No active verification allocations at this moment.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-border)', textAlign: 'left', color: 'var(--secondary-text)' }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Application ID</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Business Name</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Instrument Details</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Scheduled Date</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentAssignments.map((a) => (
                  <tr key={a.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.85rem 0.5rem' }}>
                      <span style={{ fontWeight: 600, color: '#38bdf8' }}>
                        {a.application?.applicationNumber}
                      </span>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {a.application?.applicationType}
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem' }}>
                      <div style={{ fontWeight: 500, color: '#ffffff' }}>
                        {a.application?.business?.businessName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {a.application?.business?.district}, {a.application?.business?.state}
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem' }}>
                      <span style={{ color: '#ffffff' }}>
                        {a.application?.instrument?.model}
                      </span>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {a.application?.instrument?.customId} • Cap: {a.application?.instrument?.capacity} {a.application?.instrument?.capacityUnit}
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem', color: '#e2e8f0' }}>
                      {a.scheduledDate ? new Date(a.scheduledDate).toLocaleDateString() : 'Pending'}
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{a.scheduledTime || '10:00 AM'}</div>
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem' }}>
                      <StatusBadge status={a.application?.status || a.status} />
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                      {a.status === 'COMPLETED' ? (
                        <Link
                          to={`/verify/${a.application?.certificate?.certificateNumber || ''}`}
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                        >
                          View Certificate
                        </Link>
                      ) : (
                        <Link
                          to={`/gatc/verification/${a.applicationId}`}
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', background: '#0F766E' }}
                        >
                          Execute Test
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
