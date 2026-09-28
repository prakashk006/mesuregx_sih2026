import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  ClipboardCheck,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  Award,
  AlertTriangle,
  ArrowRight,
  MapPin,
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

export default function OfficerDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [dashRes, assignRes] = await Promise.all([
          api.get('/admin/dashboard'), // shared metric aggregator
          api.get('/assignments'),
        ]);

        setStats(dashRes.data?.data);
        setAssignments(assignRes.data?.data?.assignments || []);
      } catch (err) {
        console.error('Officer dashboard error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="page-body" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <h3>Loading Officer Dashboard...</h3>
      </div>
    );
  }

  const s = stats?.stats || {};
  const statusChartData = (stats?.statusChart || []).filter((x) => x.value > 0);

  // Sample monthly verification trend
  const monthlyData = [
    { month: 'Apr', inspections: 24, pass: 22 },
    { month: 'May', inspections: 31, pass: 28 },
    { month: 'Jun', inspections: 40, pass: 37 },
    { month: 'Jul', inspections: 35, pass: 33 },
    { month: 'Aug', inspections: 48, pass: 44 },
    { month: 'Sep', inspections: 52, pass: 49 },
  ];

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
          <h1 style={{ fontSize: '1.75rem', color: '#ffffff' }}>Legal Metrology Officer Portal</h1>
          <p style={{ color: 'var(--secondary-text)', fontSize: '0.9rem' }}>
            Field inspection dispatch, accuracy evaluations, and digital certificate governance
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/officer/applications" className="btn btn-navy">
            <ClipboardCheck size={16} /> Inspection Queue
          </Link>
          <Link
            to={assignments.length > 0 ? `/officer/verification/${assignments[0].applicationId}` : '/officer/verification'}
            className="btn btn-primary"
          >
            <Calendar size={16} /> Start Field Inspection
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="stat-grid">
        <StatCard
          title="Total Applications"
          value={s.totalApplications || 0}
          icon={<Clock size={24} />}
          color="blue"
        />
        <StatCard
          title="Scheduled Inspections"
          value={assignments.length}
          icon={<Calendar size={24} />}
          color="amber"
        />
        <StatCard
          title="Verified Instruments"
          value={s.verifiedInstruments || 0}
          icon={<CheckCircle size={24} />}
          color="green"
        />
        <StatCard
          title="Active Certificates"
          value={s.activeCertificates || 0}
          icon={<Award size={24} />}
          color="cyan"
        />
        <StatCard
          title="Expiring Soon"
          value={s.expiringSoonCertificates || 0}
          icon={<AlertTriangle size={24} />}
          color="purple"
        />
        <StatCard
          title="Compliance Pass Rate"
          value={`${s.passRate || 94}%`}
          icon={<CheckCircle size={24} />}
          color="green"
        />
      </div>

      {/* Charts Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        {/* Monthly Verifications Bar Chart */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#0f172a' }}>
            Monthly Verification Volume (Field Load Tests)
          </h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="inspections" fill="#2563eb" name="Conducted Tests" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pass" fill="#10b981" name="Passed Standards" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Application Status Donut */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#0f172a' }}>
            Department Application Pipeline
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
      </div>

      {/* Scheduled Inspections Queue */}
      <div className="card">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.15rem', color: '#ffffff', margin: 0 }}>
              Scheduled Field Inspections
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--secondary-text)', marginTop: '0.2rem' }}>
              Pending site visits for weighing machine and dispenser verification
            </p>
          </div>

          <Link to="/officer/schedule" style={{ fontSize: '0.85rem', color: '#06b6d4', fontWeight: 600 }}>
            View Calendar <ArrowRight size={14} style={{ display: 'inline' }} />
          </Link>
        </div>

        {assignments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--secondary-text)' }}>
            No scheduled field assignments right now.
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Application Number</th>
                  <th>Establishment</th>
                  <th>Instrument</th>
                  <th>Scheduled Date & Time</th>
                  <th>Location</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assign) => (
                  <tr key={assign.id}>
                    <td>
                      <strong style={{ color: '#38bdf8' }}>
                        {assign.application?.applicationNumber}
                      </strong>
                    </td>
                    <td>
                      <strong>{assign.application?.business?.businessName}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)' }}>
                        {assign.application?.business?.ownerName}
                      </div>
                    </td>
                    <td>
                      <strong>{assign.application?.instrument?.customId}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)' }}>
                        {assign.application?.instrument?.instrumentType?.name}
                      </div>
                    </td>
                    <td>
                      <div>
                        {new Date(assign.scheduledDate).toLocaleDateString()}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)' }}>
                        {assign.scheduledTime || '10:00 AM'}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      <MapPin size={12} style={{ display: 'inline', color: '#06b6d4' }} />{' '}
                      {assign.location}
                    </td>
                    <td>
                      <Link
                        to={`/officer/verification/${assign.applicationId}`}
                        className="btn btn-primary btn-sm"
                      >
                        Start Verification
                      </Link>
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
