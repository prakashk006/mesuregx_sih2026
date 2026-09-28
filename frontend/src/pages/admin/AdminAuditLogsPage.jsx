import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { ShieldAlert, Search, Filter, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/audit-logs', {
        params: {
          search,
          action: actionFilter,
          page,
          limit: 25,
        },
      });
      setLogs(res.data?.data?.logs || []);
      setPagination(res.data?.data?.pagination || { total: 0, totalPages: 1 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
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
          <h1 style={{ fontSize: '1.75rem', color: '#0f172a' }}>Security & Compliance Audit Trail</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Cryptographically timestamped, immutable event log of all system actions, field inspections, and certificate issuances
          </p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div
        className="card"
        style={{
          padding: '1rem 1.25rem',
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
            placeholder="Search audit descriptions, entity IDs, or actors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.4rem' }}
          />
          <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
        </form>

        <div style={{ minWidth: 200 }}>
          <select
            className="form-select"
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="ALL">All Audit Actions</option>
            <option value="BUSINESS_REGISTERED">Business Registered</option>
            <option value="INSTRUMENT_CREATED">Instrument Registered</option>
            <option value="APPLICATION_SUBMITTED">Application Submitted</option>
            <option value="OFFICER_ASSIGNED">Officer Assigned</option>
            <option value="VERIFICATION_STARTED">Verification Started</option>
            <option value="MEASUREMENT_SUBMITTED">Measurement Submitted</option>
            <option value="APPLICATION_APPROVED">Application Approved</option>
            <option value="APPLICATION_REJECTED">Application Rejected</option>
            <option value="CERTIFICATE_ISSUED">Certificate Issued</option>
            <option value="CERTIFICATE_REVOKED">Certificate Revoked</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <h3>Loading Audit Trail...</h3>
        </div>
      ) : logs.length === 0 ? (
        <div className="card empty-state">
          <ShieldAlert className="empty-icon" />
          <h3 style={{ fontSize: '1.2rem', color: '#0f172a' }}>No audit records found</h3>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor / User</th>
                <th>Action</th>
                <th>Entity Target</th>
                <th>Description</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                    <div style={{ fontWeight: 600 }}>
                      {new Date(log.createdAt).toLocaleDateString()}
                    </div>
                    <div style={{ color: '#64748b' }}>
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                      {log.user?.name || 'System Auto'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {log.userRole || 'SYSTEM'}
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        fontFamily: 'monospace',
                        background: 'rgba(6, 182, 212, 0.15)',
                        color: '#22d3ee',
                        border: '1px solid rgba(6, 182, 212, 0.3)',
                      }}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>
                    <strong>{log.entity}</strong>
                    {log.entityId && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)', fontFamily: 'monospace' }}>
                        {log.entityId.slice(0, 16)}...
                      </div>
                    )}
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.85)', maxWidth: 360 }}>
                    {log.description}
                  </td>
                  <td style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>
                    {log.ipAddress || '127.0.0.1'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
            Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} audit records)
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
