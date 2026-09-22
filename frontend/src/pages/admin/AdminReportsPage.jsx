import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { BarChart3, Scale, Award, FileText, CheckCircle } from 'lucide-react';
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

export default function AdminReportsPage() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        const res = await api.get('/reports');
        setReportData(res.data?.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  if (loading) {
    return (
      <div className="page-body" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <h3>Loading Metrology Analytics...</h3>
      </div>
    );
  }

  const verif = reportData?.verificationReport || {};
  const certReport = reportData?.certificateReport || {};
  const instrumentsByType = reportData?.instrumentsByType || [];
  const instrumentsByDistrict = reportData?.instrumentsByDistrict || [];

  const certPieData = [
    { name: 'Active (Valid)', value: certReport.active, fill: '#10b981' },
    { name: 'Expiring (<30d)', value: certReport.expiring, fill: '#f59e0b' },
    { name: 'Expired', value: certReport.expired, fill: '#ef4444' },
    { name: 'Revoked', value: certReport.revoked, fill: '#0f172a' },
  ].filter((x) => x.value > 0);

  return (
    <div className="page-body">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', color: '#0f172a' }}>
          Metrological Analytics & Compliance Reports
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Verification pass rates, geographic instrument dispersion, and validity longevity metrics
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
            Total Applications
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>
            {verif.totalApplications || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#2563eb', marginTop: '0.25rem' }}>
            {verif.approved} Approved • {verif.rejected} Rejected
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
            Overall Pass Rate
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#059669', marginTop: '0.25rem' }}>
            {verif.passRate || 0}%
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
            Based on {verif.totalTests} physical tests
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
            Total Certificates
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0891b2', marginTop: '0.25rem' }}>
            {certReport.total || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '0.25rem' }}>
            {certReport.active} currently active & valid
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
            Expirations & Alerts
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#d97706', marginTop: '0.25rem' }}>
            {certReport.expiring || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem' }}>
            {certReport.expired} historical expired
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Instruments By Type */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#0f172a' }}>
            Instrument Distribution by Category
          </h3>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={instrumentsByType} layout="vertical">
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" radius={[0, 4, 4, 0]} name="Total Instruments" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Certificate Health Donut */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#0f172a' }}>
            Certificate Validity Health
          </h3>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={certPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {certPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Instruments By District */}
      <div className="card">
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#0f172a' }}>
          Geographic Metrology Dispersion (By District)
        </h3>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={instrumentsByDistrict}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#0891b2" radius={[4, 4, 0, 0]} name="Instruments Enrolled" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
