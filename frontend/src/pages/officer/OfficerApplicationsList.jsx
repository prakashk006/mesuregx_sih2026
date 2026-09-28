import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  FileText,
  Search,
  Filter,
  UserCheck,
  Calendar,
  CheckCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';

export default function OfficerApplicationsList() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 15,
      };
      if (search) params.search = search;
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (districtFilter !== 'ALL') params.district = districtFilter;

      const res = await api.get('/applications', { params });
      setApplications(res.data?.data?.applications || []);
      setPagination(res.data?.data?.pagination || { total: 0, totalPages: 1 });
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [page, statusFilter, districtFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchApplications();
  };

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
          <h1 style={{ fontSize: '1.75rem', color: '#ffffff' }}>Inspection Applications</h1>
          <p style={{ color: 'var(--secondary-text)', fontSize: '0.9rem' }}>
            Review submitted metrology verification requests, assign officers, and launch field testing
          </p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div
        className="card"
        style={{
          padding: '1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ flex: 1, minWidth: 260, position: 'relative' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by App ID, Business Name, Instrument ID, or Serial..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.4rem' }}
          />
          <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
        </form>

        <div style={{ minWidth: 180 }}>
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="ALL">All Application Statuses</option>
            <option value="SUBMITTED">Submitted (New)</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="FIELD_VERIFICATION">Field Verification</option>
            <option value="OFFICER_REVIEW">Officer Review</option>
            <option value="CERTIFICATE_ISSUED">Certificate Issued</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <div style={{ minWidth: 160 }}>
          <select
            className="form-select"
            value={districtFilter}
            onChange={(e) => {
              setDistrictFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="ALL">All Districts</option>
            <option value="Coimbatore">Coimbatore</option>
            <option value="Chennai">Chennai</option>
            <option value="Tiruppur">Tiruppur</option>
            <option value="Madurai">Madurai</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <h3>Loading Applications...</h3>
        </div>
      ) : applications.length === 0 ? (
        <div className="card empty-state">
          <FileText className="empty-icon" />
          <h3 style={{ fontSize: '1.2rem', color: '#0f172a' }}>No matching applications found</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Try adjusting your search criteria or district filter.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="table-container desktop-only-view">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Application ID</th>
                  <th>Business Establishment</th>
                  <th>Instrument</th>
                  <th>Verification Type</th>
                  <th>Submitted Date</th>
                  <th>Preferred Date</th>
                  <th>Status</th>
                  <th>Assigned Officer</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <strong style={{ color: '#064E3B' }}>{app.applicationNumber}</strong>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{app.business?.businessName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {app.business?.district} ({app.business?.ownerName})
                      </div>
                    </td>
                    <td>
                      <strong>{app.instrument?.customId}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {app.instrument?.instrumentType?.name} ({app.instrument?.capacity} {app.instrument?.capacityUnit})
                      </div>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{app.applicationType}</td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {app.preferredDate ? new Date(app.preferredDate).toLocaleDateString() : 'Immediate'}
                    </td>
                    <td>
                      <StatusBadge status={app.status} />
                    </td>
                    <td>
                      {app.assignment?.officer ? (
                        <div style={{ fontSize: '0.85rem' }}>
                          <div style={{ fontWeight: 600 }}>{app.assignment.officer.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            {app.assignment.officer.officerCode}
                          </div>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: '#dc2626', fontWeight: 600 }}>
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <Link
                          to={`/officer/applications/${app.id}`}
                          className="btn btn-outline btn-sm"
                          title="Review Details & Assign Officer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
                        >
                          <UserCheck size={14} /> Review / Assign
                        </Link>
                        <Link
                          to={`/officer/verification/${app.id}`}
                          className="btn btn-primary btn-sm"
                          title="Field Testing"
                        >
                          Field Test
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Card View */}
          <div className="mobile-only-view">
            {applications.map((app) => (
              <div key={app.id} className="mobile-card-item">
                <div className="mobile-card-row">
                  <strong style={{ color: '#064E3B', fontSize: '1rem' }}>{app.applicationNumber}</strong>
                  <StatusBadge status={app.status} />
                </div>

                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                  🏢 {app.business?.businessName} ({app.business?.district})
                </div>

                <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                  ⚖️ {app.instrument?.customId} ({app.instrument?.instrumentType?.name})
                </div>

                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  📅 Submitted: {new Date(app.createdAt).toLocaleDateString()}
                </div>

                <div style={{ fontSize: '0.82rem', background: '#f8fafc', padding: '0.5rem', borderRadius: '6px', marginTop: '0.25rem' }}>
                  👤 Assigned: {app.assignment?.officer ? `${app.assignment.officer.name} (${app.assignment.officer.officerCode})` : '⚠️ Unassigned'}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <Link
                    to={`/officer/applications/${app.id}`}
                    className="btn btn-outline btn-sm"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    <UserCheck size={14} /> Review / Assign
                  </Link>
                  <Link
                    to={`/officer/verification/${app.id}`}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    Field Test
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Pagination Footer */}
      {pagination.totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '1.5rem',
          }}
        >
          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn btn-outline btn-sm"
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="btn btn-outline btn-sm"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
