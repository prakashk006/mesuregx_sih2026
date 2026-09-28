import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Building2,
  ClipboardCheck,
  CheckCircle,
  Clock,
  Award,
  ArrowRight,
  ShieldCheck,
  Activity,
  Calendar,
  AlertTriangle,
  Scale,
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';

export default function GatcDashboard() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const gatc = user?.gatc || {};

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.get('/assignments');
        const list = res.data?.data?.assignments || [];
        setAssignments(list);
      } catch (err) {
        setError('Failed to fetch GATC assignments.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const pendingCount = assignments.filter((a) => a.status === 'PENDING' || a.status === 'ACCEPTED').length;
  const inProgressCount = assignments.filter((a) => a.status === 'IN_PROGRESS').length;
  const completedCount = assignments.filter((a) => a.status === 'COMPLETED').length;

  return (
    <div className="page-body">
      {/* GATC Accreditation Header */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          marginBottom: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                padding: '0.2rem 0.6rem',
                background: '#06b6d4',
                color: '#000',
                borderRadius: '4px',
                letterSpacing: '0.05em',
              }}
            >
              Government Approved Test Centre (GATC)
            </span>
            <span style={{ fontSize: '0.85rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
              <ShieldCheck size={16} /> Accredited Facility
            </span>
          </div>
          <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700 }}>
            {gatc.name || 'Apex Metrology Calibration Labs Pvt Ltd'}
          </h2>
          <div style={{ marginTop: '0.5rem', color: 'var(--secondary-text)', fontSize: '0.88rem', display: 'flex', flexWrap: 'wrap', gap: '1.25rem' }}>
            <span><strong>Auth No:</strong> {gatc.authorizationNo || 'GATC-AUTH-2026-TN-001'}</span>
            <span><strong>Code:</strong> {gatc.gatcCode || 'GATC-TN-001'}</span>
            <span><strong>Scope:</strong> {gatc.categories || 'Non-Automatic Weighing Instruments, Fuel Dispensers'}</span>
          </div>
        </div>

        <Link to="/gatc/assignments" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ClipboardCheck size={18} /> View Allocated Testing Queue <ArrowRight size={16} />
        </Link>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.15)', color: '#f87171', borderRadius: '8px', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <Calendar size={22} />
          </div>
          <div>
            <div className="stat-value">{assignments.length}</div>
            <div className="stat-label">Total Allocated Requests</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <Clock size={22} />
          </div>
          <div>
            <div className="stat-value">{pendingCount}</div>
            <div className="stat-label">Pending Testing</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
            <Activity size={22} />
          </div>
          <div>
            <div className="stat-value">{inProgressCount}</div>
            <div className="stat-label">Testing In Progress</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <Award size={22} />
          </div>
          <div>
            <div className="stat-value">{completedCount}</div>
            <div className="stat-label">Completed & Certified</div>
          </div>
        </div>
      </div>

      {/* Allocated Cases Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Scale size={20} color="#06b6d4" /> Recent Allocated Verification Tests
          </h3>
          <Link to="/gatc/assignments" style={{ color: '#06b6d4', fontSize: '0.85rem', fontWeight: 600 }}>
            View All ({assignments.length}) →
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--secondary-text)' }}>
            Loading allocated testing queue...
          </div>
        ) : assignments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--secondary-text)' }}>
            <CheckCircle size={40} color="#10b981" style={{ marginBottom: '0.75rem', opacity: 0.8 }} />
            <p>No pending test requests allocated to this GATC laboratory at the moment.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Application No</th>
                  <th>Establishment</th>
                  <th>Instrument Details</th>
                  <th>Scheduled Date</th>
                  <th>Premises Location</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {assignments.slice(0, 5).map((a) => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 600, color: '#38bdf8' }}>
                      {a.application?.applicationNumber || 'N/A'}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{a.application?.business?.businessName || 'Business Establishment'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)' }}>{a.application?.business?.ownerName}</div>
                    </td>
                    <td>
                      <div><strong>{a.application?.instrument?.customId}</strong></div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--secondary-text)' }}>
                        {a.application?.instrument?.manufacturer} {a.application?.instrument?.model} ({a.application?.instrument?.capacity} {a.application?.instrument?.capacityUnit})
                      </div>
                    </td>
                    <td>{new Date(a.scheduledDate).toLocaleDateString()}</td>
                    <td style={{ fontSize: '0.85rem', maxWidth: '220px' }}>{a.location}</td>
                    <td><StatusBadge status={a.application?.status || a.status} /></td>
                    <td>
                      <Link
                        to={`/officer/verification/${a.applicationId}`}
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '0.75rem', borderColor: '#06b6d4', color: '#06b6d4' }}
                      >
                        Enter Test Readings →
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
