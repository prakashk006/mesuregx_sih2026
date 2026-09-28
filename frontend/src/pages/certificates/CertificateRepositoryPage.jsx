import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Award,
  Search,
  Filter,
  History,
  ExternalLink,
  Printer,
  Download,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Scale,
  Building,
  RefreshCw,
  Layers,
  LayoutGrid,
  List,
  X,
  FileCheck,
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import DigitalCertificateModal from '../../components/DigitalCertificateModal';
import CertificateHistoryModal from '../../components/CertificateHistoryModal';

export default function CertificateRepositoryPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [certificates, setCertificates] = useState([]);
  const [instrumentTypes, setInstrumentTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Search & Filter State
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [verificationTypeFilter, setVerificationTypeFilter] = useState('ALL');
  const [authorityFilter, setAuthorityFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'EXPIRING_SOON' | 'HISTORICAL'
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'

  // Modals
  const [selectedCert, setSelectedCert] = useState(null);
  const [showCertModal, setShowCertModal] = useState(false);

  const [historyTarget, setHistoryTarget] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Revocation Modal (Officer/Admin)
  const [revokeCert, setRevokeCert] = useState(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [revoking, setRevoking] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  // Fetch Instrument Types for filter
  useEffect(() => {
    async function loadTypes() {
      try {
        const res = await api.get('/instruments/types');
        setInstrumentTypes(res.data?.data?.types || []);
      } catch (e) {
        // ignore
      }
    }
    loadTypes();
  }, []);

  // Fetch Certificates with Server-side Query Parameters
  const fetchCertificates = async () => {
    setLoading(true);
    setActionSuccess('');
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (typeFilter !== 'ALL') params.instrumentType = typeFilter;
      if (verificationTypeFilter !== 'ALL') params.verificationType = verificationTypeFilter;
      if (authorityFilter !== 'ALL') params.authority = authorityFilter;

      // Status mapping based on activeTab or dropdown
      if (activeTab === 'ACTIVE') {
        params.status = 'ACTIVE';
      } else if (activeTab === 'EXPIRING_SOON') {
        params.status = 'EXPIRING_SOON';
      } else if (activeTab === 'HISTORICAL') {
        params.status = 'HISTORICAL';
      } else if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }

      const res = await api.get('/certificates', { params });
      const certs = res.data?.data?.certificates || [];
      setCertificates(certs);
      setTotalCount(res.data?.data?.total || certs.length);
    } catch (err) {
      console.error('Failed to load certificates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, [statusFilter, typeFilter, verificationTypeFilter, authorityFilter, activeTab]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCertificates();
  };

  const handleOpenCertificate = (cert) => {
    setSelectedCert(cert);
    setShowCertModal(true);
  };

  const handleOpenHistory = (cert) => {
    setHistoryTarget({
      certificateId: cert.id,
      instrumentId: cert.instrument?.id,
    });
    setShowHistoryModal(true);
  };

  const handleRevokeSubmit = async (e) => {
    e.preventDefault();
    if (!revokeReason.trim() || !revokeCert) return;

    setRevoking(true);
    try {
      await api.post(`/certificates/${revokeCert.id}/revoke`, { reason: revokeReason.trim() });
      setActionSuccess(`Certificate ${revokeCert.certificateNumber} revoked successfully.`);
      setRevokeCert(null);
      setRevokeReason('');
      fetchCertificates();
    } catch (err) {
      alert(err.response?.data?.message || 'Revocation failed.');
    } finally {
      setRevoking(false);
    }
  };

  // Quick Stat Counts
  const activeCount = certificates.filter((c) => c.status === 'VALID' && c.isCurrent).length;
  const expiringCount = certificates.filter((c) => c.status === 'EXPIRING_SOON').length;
  const expiredCount = certificates.filter((c) => c.status === 'EXPIRED').length;
  const historicalCount = certificates.filter((c) => c.status === 'SUPERSEDED' || (!c.isCurrent && c.status !== 'REVOKED')).length;

  const isBusinessOwner = user?.role === 'BUSINESS_OWNER';
  const isOfficerOrAdmin = user?.role === 'OFFICER' || user?.role === 'ADMIN';

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.25rem' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #064E3B, #0F766E)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 2px 10px rgba(6, 78, 59, 0.25)',
              }}
            >
              <Award size={20} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {isBusinessOwner ? 'My Verification Certificates' : 'Digital Certificate Repository'}
            </h1>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
            Official Legal Metrology verification certificates repository with tamper-evident QR ledger and succession history
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            type="button"
            onClick={fetchCertificates}
            className="btn btn-outline btn-sm"
            title="Refresh repository"
          >
            <RefreshCw size={14} /> Refresh
          </button>

          {/* View Mode Toggle */}
          <div style={{ background: '#f1f5f9', padding: '3px', borderRadius: '8px', display: 'flex', gap: '2px' }}>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              style={{
                background: viewMode === 'table' ? '#ffffff' : 'transparent',
                border: 'none',
                padding: '0.35rem 0.6rem',
                borderRadius: '6px',
                cursor: 'pointer',
                color: viewMode === 'table' ? '#064E3B' : '#64748b',
                boxShadow: viewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Table View"
            >
              <List size={16} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              style={{
                background: viewMode === 'cards' ? '#ffffff' : 'transparent',
                border: 'none',
                padding: '0.35rem 0.6rem',
                borderRadius: '6px',
                cursor: 'pointer',
                color: viewMode === 'cards' ? '#064E3B' : '#64748b',
                boxShadow: viewMode === 'cards' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Card View"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      </div>

      {actionSuccess && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            background: '#d1fae5',
            color: '#065f46',
            border: '1px solid #a7f3d0',
            borderRadius: '10px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem',
          }}
        >
          <CheckCircle size={18} /> {actionSuccess}
        </div>
      )}

      {/* KPI Stats Strip */}
      <div className="stat-grid" style={{ marginBottom: '1.5rem' }}>
        <div
          className="stat-card"
          style={{ cursor: 'pointer', borderColor: activeTab === 'ALL' ? '#064E3B' : undefined }}
          onClick={() => setActiveTab('ALL')}
        >
          <div>
            <div className="stat-val">{totalCount}</div>
            <div className="stat-label">Total Records</div>
          </div>
          <div className="stat-icon" style={{ background: '#dbeafe', color: '#1e40af' }}>
            <Layers size={24} />
          </div>
        </div>

        <div
          className="stat-card"
          style={{ cursor: 'pointer', borderColor: activeTab === 'ACTIVE' ? '#10B981' : undefined }}
          onClick={() => setActiveTab('ACTIVE')}
        >
          <div>
            <div className="stat-val" style={{ color: '#059669' }}>
              {activeCount}
            </div>
            <div className="stat-label">Current Active</div>
          </div>
          <div className="stat-icon" style={{ background: '#d1fae5', color: '#065f46' }}>
            <CheckCircle size={24} />
          </div>
        </div>

        <div
          className="stat-card"
          style={{ cursor: 'pointer', borderColor: activeTab === 'EXPIRING_SOON' ? '#D97706' : undefined }}
          onClick={() => setActiveTab('EXPIRING_SOON')}
        >
          <div>
            <div className="stat-val" style={{ color: '#d97706' }}>
              {expiringCount}
            </div>
            <div className="stat-label">Expiring Soon</div>
          </div>
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#92400e' }}>
            <Clock size={24} />
          </div>
        </div>

        <div
          className="stat-card"
          style={{ cursor: 'pointer', borderColor: activeTab === 'HISTORICAL' ? '#64748B' : undefined }}
          onClick={() => setActiveTab('HISTORICAL')}
        >
          <div>
            <div className="stat-val" style={{ color: '#475569' }}>
              {historicalCount}
            </div>
            <div className="stat-label">Historical / Superseded</div>
          </div>
          <div className="stat-icon" style={{ background: '#f1f5f9', color: '#475569' }}>
            <History size={24} />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        className="card"
        style={{
          padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem',
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Universal Search Input */}
          <div style={{ flex: 1, minWidth: 260, position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search by Certificate ID, Instrument ID, Application ID, Business..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.4rem' }}
            />
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
          </div>

          {/* Status Filter */}
          <div style={{ minWidth: 160 }}>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setActiveTab('ALL');
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="VALID">Active / Valid</option>
              <option value="EXPIRING_SOON">Expiring Soon</option>
              <option value="EXPIRED">Expired</option>
              <option value="SUPERSEDED">Superseded / Historical</option>
              <option value="REVOKED">Revoked</option>
            </select>
          </div>

          {/* Instrument Type Filter */}
          <div style={{ minWidth: 180 }}>
            <select
              className="form-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="ALL">All Instrument Types</option>
              {instrumentTypes.map((t) => (
                <option key={t.id} value={t.code}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Verification Type Filter */}
          <div style={{ minWidth: 170 }}>
            <select
              className="form-select"
              value={verificationTypeFilter}
              onChange={(e) => setVerificationTypeFilter(e.target.value)}
            >
              <option value="ALL">All Verification Types</option>
              <option value="Initial Verification">Initial Verification</option>
              <option value="Periodic Verification">Periodic Verification</option>
              <option value="Re-verification">Re-verification</option>
              <option value="Special Verification">Special Verification</option>
            </select>
          </div>

          {/* Authority Filter: LMO / GATC */}
          <div style={{ minWidth: 150 }}>
            <select
              className="form-select"
              value={authorityFilter}
              onChange={(e) => setAuthorityFilter(e.target.value)}
            >
              <option value="ALL">All Authorities</option>
              <option value="LMO">LMO (Legal Metrology Officer)</option>
              <option value="GATC">GATC (Approved Test Lab)</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary">
            <Search size={14} /> Search
          </button>
        </form>

        {/* Filter Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            borderTop: '1px solid #f1f5f9',
            marginTop: '1rem',
            paddingTop: '0.85rem',
            overflowX: 'auto',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`btn btn-sm ${activeTab === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
          >
            All Certificates ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ACTIVE')}
            className={`btn btn-sm ${activeTab === 'ACTIVE' ? 'btn-primary' : 'btn-outline'}`}
          >
            Current Active ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('EXPIRING_SOON')}
            className={`btn btn-sm ${activeTab === 'EXPIRING_SOON' ? 'btn-primary' : 'btn-outline'}`}
          >
            Expiring Soon ({expiringCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('HISTORICAL')}
            className={`btn btn-sm ${activeTab === 'HISTORICAL' ? 'btn-primary' : 'btn-outline'}`}
          >
            Historical Archives ({historicalCount})
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div className="brand-badge" style={{ margin: '0 auto 1rem', width: 44, height: 44 }}>
            M
          </div>
          <h3 style={{ fontSize: '1.25rem', color: '#0f172a' }}>Loading Certificate Repository...</h3>
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
            Querying digital ledger for authenticated verification certificates
          </p>
        </div>
      ) : certificates.length === 0 ? (
        <div className="card empty-state">
          <Award className="empty-icon" />
          <h3 style={{ fontSize: '1.25rem', color: '#0f172a' }}>No certificates found</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.35rem', maxWidth: 480, margin: '0.35rem auto 1.5rem' }}>
            {search || statusFilter !== 'ALL' || typeFilter !== 'ALL' || authorityFilter !== 'ALL'
              ? 'No certificates match the selected search criteria or status filter. Try clearing filters.'
              : 'Official legal metrology certificates will appear here once an inspection officer completes verification testing and issues certification.'}
          </p>
          {(search || statusFilter !== 'ALL' || typeFilter !== 'ALL' || authorityFilter !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setStatusFilter('ALL');
                setTypeFilter('ALL');
                setVerificationTypeFilter('ALL');
                setAuthorityFilter('ALL');
                setActiveTab('ALL');
              }}
              className="btn btn-outline"
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Certificate ID</th>
                <th>Instrument ID</th>
                <th>Application ID</th>
                <th>Business / Establishment</th>
                <th>Type / Capacity</th>
                <th>Authority</th>
                <th>Issue Date</th>
                <th>Valid Until</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {certificates.map((cert) => (
                <tr key={cert.id} style={{ background: cert.status === 'SUPERSEDED' ? '#fcfcfc' : '#ffffff' }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <strong style={{ color: '#064E3B' }}>{cert.certificateNumber}</strong>
                      {cert.isCurrent && (
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            background: '#d1fae5',
                            color: '#065f46',
                            padding: '0.1rem 0.35rem',
                            borderRadius: '3px',
                          }}
                        >
                          CURRENT
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      {cert.application?.applicationType || 'Periodic Verification'}
                    </div>
                  </td>

                  <td>
                    <strong>{cert.instrument?.customId}</strong>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      S/N: {cert.instrument?.serialNumber || 'N/A'}
                    </div>
                  </td>

                  <td>
                    <span style={{ fontSize: '0.85rem', color: '#334155' }}>
                      {cert.application?.applicationNumber || 'APP-OFFICIAL'}
                    </span>
                  </td>

                  <td>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0f172a' }}>
                      {cert.business?.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {cert.business?.ownerName} • {cert.business?.district || cert.business?.city}
                    </div>
                  </td>

                  <td>
                    <div style={{ fontSize: '0.85rem' }}>{cert.instrument?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {cert.instrument?.capacity} (Class {cert.instrument?.accuracyClass})
                    </div>
                  </td>

                  <td>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#064E3B' }}>
                      {cert.issuedByType === 'GATC' ? 'GATC Lab' : 'LMO'}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', maxWidth: 160, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {cert.authority}
                    </div>
                  </td>

                  <td style={{ fontSize: '0.82rem' }}>
                    {new Date(cert.issueDate).toLocaleDateString()}
                  </td>

                  <td>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: cert.status === 'EXPIRED' ? '#dc2626' : '#059669' }}>
                      {new Date(cert.expiryDate).toLocaleDateString()}
                    </div>
                  </td>

                  <td>
                    <StatusBadge status={cert.status} />
                  </td>

                  <td>
                    <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenCertificate(cert)}
                        className="btn btn-navy btn-sm"
                        title="View Official Certificate"
                      >
                        <Award size={13} /> View
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenHistory(cert)}
                        className="btn btn-outline btn-sm"
                        title="View Full Instrument Certificate History"
                      >
                        <History size={13} /> History
                      </button>

                      <Link
                        to={`/verify/${cert.certificateNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline btn-sm"
                        title="Public QR Verification Page"
                      >
                        <ExternalLink size={13} />
                      </Link>

                      {(user?.role === 'BUSINESS_OWNER' || cert.status === 'EXPIRED' || cert.status === 'EXPIRING_SOON') && (
                        <Link
                          to={`/business/applications/new?instrumentId=${cert.instrumentId || cert.instrument?.id}&applicationType=REVERIFICATION&prevCert=${cert.certificateNumber}`}
                          className="btn btn-outline btn-sm"
                          style={{ color: '#059669', borderColor: '#a7f3d0' }}
                          title="Apply for Periodic Re-verification"
                        >
                          <RefreshCw size={13} /> Re-verify
                        </Link>
                      )}

                      {isOfficerOrAdmin && cert.status !== 'REVOKED' && (
                        <button
                          type="button"
                          onClick={() => setRevokeCert(cert)}
                          className="btn btn-outline btn-sm"
                          style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                          title="Revoke Certificate"
                        >
                          <ShieldAlert size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* CARD GRID VIEW */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="card"
              style={{
                padding: '1.5rem',
                borderLeft: cert.isCurrent ? '4px solid #10B981' : '4px solid #94a3b8',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'block' }}>
                      {cert.application?.applicationType || 'Verification Certificate'}
                    </span>
                    <strong style={{ fontSize: '1.1rem', color: '#064E3B' }}>{cert.certificateNumber}</strong>
                  </div>
                  <StatusBadge status={cert.status} />
                </div>

                <div style={{ fontSize: '0.85rem', color: '#334155', marginBottom: '1rem', lineHeight: 1.6 }}>
                  <div>
                    <strong>Instrument: </strong>
                    <span style={{ color: '#0f172a' }}>{cert.instrument?.customId}</span> — {cert.instrument?.name}
                  </div>
                  <div>
                    <strong>Establishment: </strong>
                    {cert.business?.name}
                  </div>
                  <div>
                    <strong>Authority: </strong>
                    <span style={{ color: '#064E3B', fontWeight: 600 }}>{cert.authority}</span>
                  </div>
                </div>

                <div
                  style={{
                    background: '#f8fafc',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.8rem',
                    marginBottom: '1rem',
                  }}
                >
                  <div>
                    <span style={{ color: '#64748b' }}>Issued: </span>
                    <strong>{new Date(cert.issueDate).toLocaleDateString()}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Expires: </span>
                    <strong style={{ color: cert.status === 'EXPIRED' ? '#dc2626' : '#059669' }}>
                      {new Date(cert.expiryDate).toLocaleDateString()}
                    </strong>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.85rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => handleOpenCertificate(cert)}
                  className="btn btn-navy btn-sm"
                  style={{ flex: 1 }}
                >
                  <Award size={13} /> View
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenHistory(cert)}
                  className="btn btn-outline btn-sm"
                  style={{ flex: 1 }}
                >
                  <History size={13} /> History
                </button>
                <Link
                  to={`/verify/${cert.certificateNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                  title="Verify QR"
                >
                  <ExternalLink size={13} />
                </Link>
                {(user?.role === 'BUSINESS_OWNER' || cert.status === 'EXPIRED' || cert.status === 'EXPIRING_SOON') && (
                  <Link
                    to={`/business/applications/new?instrumentId=${cert.instrumentId || cert.instrument?.id}&applicationType=REVERIFICATION&prevCert=${cert.certificateNumber}`}
                    className="btn btn-outline btn-sm"
                    style={{ color: '#059669', borderColor: '#a7f3d0', width: '100%', marginTop: '0.35rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                    title="Apply for Periodic Re-verification"
                  >
                    <RefreshCw size={13} /> Apply for Re-verification
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Digital Certificate Viewer Modal */}
      <DigitalCertificateModal
        certificate={selectedCert}
        isOpen={showCertModal}
        onClose={() => setShowCertModal(false)}
        onViewHistory={(cert) => {
          handleOpenHistory(cert);
        }}
      />

      {/* Certificate History & Lifecycle Modal */}
      <CertificateHistoryModal
        certificateId={historyTarget?.certificateId}
        instrumentId={historyTarget?.instrumentId}
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        onOpenCertificate={(c) => {
          setSelectedCert(c);
          setShowCertModal(true);
        }}
      />

      {/* Revocation Confirmation Modal */}
      {revokeCert && (
        <div className="modal-overlay" onClick={() => setRevokeCert(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', color: '#dc2626', margin: 0 }}>
                Revoke Certificate {revokeCert.certificateNumber}
              </h3>
              <button
                type="button"
                onClick={() => setRevokeCert(null)}
                className="btn btn-outline btn-sm"
                style={{ border: 'none' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRevokeSubmit}>
              <div className="modal-body">
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem', lineHeight: 1.5 }}>
                  Revoking this certificate immediately updates its status to REVOKED in the public metrology ledger. State the statutory reason below:
                </p>

                <div className="form-group">
                  <label className="form-label">Revocation Reason *</label>
                  <textarea
                    className="form-textarea"
                    rows="3"
                    placeholder="e.g. Lead seal broken; unauthorized recalibration observed during routine inspection."
                    value={revokeReason}
                    onChange={(e) => setRevokeReason(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setRevokeCert(null)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-danger" disabled={revoking}>
                  {revoking ? 'Revoking...' : 'Confirm Revocation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
