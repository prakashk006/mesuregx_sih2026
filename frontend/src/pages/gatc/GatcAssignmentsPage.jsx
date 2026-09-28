import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  ClipboardCheck,
  Search,
  Filter,
  ArrowRight,
  Scale,
  MapPin,
  Calendar,
  Building,
  CheckCircle,
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';

export default function GatcAssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchAssignments() {
      try {
        const res = await api.get('/assignments');
        setAssignments(res.data?.data?.assignments || []);
      } catch (err) {
        setError('Failed to load GATC allocated assignments.');
      } finally {
        setLoading(false);
      }
    }
    fetchAssignments();
  }, []);

  const filtered = assignments.filter((a) => {
    const s = search.toLowerCase();
    const matchSearch =
      !search ||
      a.application?.applicationNumber?.toLowerCase().includes(s) ||
      a.application?.business?.businessName?.toLowerCase().includes(s) ||
      a.application?.instrument?.customId?.toLowerCase().includes(s) ||
      a.location?.toLowerCase().includes(s);

    const matchStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'PENDING' && (a.status === 'PENDING' || a.status === 'ACCEPTED')) ||
      (statusFilter === 'COMPLETED' && a.status === 'COMPLETED');

    return matchSearch && matchStatus;
  });

  return (
    <div className="page-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700 }}>GATC Testing & Verification Queue</h2>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--secondary-text)', fontSize: '0.88rem' }}>
            Verification inspection and calibration testing tasks allocated to your Government Approved Test Centre.
          </p>
        </div>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.15)', color: '#f87171', borderRadius: '8px', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary-text)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search by Application No, Business, Instrument ID, or Location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Filter size={18} color="var(--secondary-text)" />
            <select
              className="form-select"
              style={{ width: 'auto' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Testing Statuses</option>
              <option value="PENDING">Pending / To Test</option>
              <option value="COMPLETED">Completed & Verified</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--secondary-text)' }}>
            Loading assignments...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--secondary-text)' }}>
            <CheckCircle size={40} color="#10b981" style={{ marginBottom: '0.75rem', opacity: 0.8 }} />
            <p>No allocated cases matching the current filters.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Application Number</th>
                  <th>Establishment</th>
                  <th>Instrument Details</th>
                  <th>Scheduled Date & Time</th>
                  <th>Inspection Premises</th>
                  <th>Testing Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 600, color: '#38bdf8' }}>
                      {a.application?.applicationNumber || 'N/A'}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{a.application?.business?.businessName || 'Business Establishment'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)' }}>
                        {a.application?.business?.ownerName} • {a.application?.business?.mobile}
                      </div>
                    </td>
                    <td>
                      <div><strong>{a.application?.instrument?.customId}</strong></div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--secondary-text)' }}>
                        {a.application?.instrument?.instrumentType?.name || a.application?.instrument?.manufacturer} ({a.application?.instrument?.capacity} {a.application?.instrument?.capacityUnit})
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#06b6d4' }}>
                        Class {a.application?.instrument?.accuracyClass} • S/N: {a.application?.instrument?.serialNumber}
                      </div>
                    </td>
                    <td>
                      <div><Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />{new Date(a.scheduledDate).toLocaleDateString()}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)' }}>{a.scheduledTime || '10:00 AM'}</div>
                    </td>
                    <td style={{ fontSize: '0.85rem', maxWidth: '240px' }}>
                      <MapPin size={14} style={{ display: 'inline', marginRight: '4px', color: '#f59e0b' }} />
                      {a.location}
                    </td>
                    <td>
                      <StatusBadge status={a.application?.status || a.status} />
                    </td>
                    <td>
                      <Link
                        to={`/officer/verification/${a.applicationId}`}
                        className="btn btn-primary btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem' }}
                      >
                        Enter Readings <ArrowRight size={14} />
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
