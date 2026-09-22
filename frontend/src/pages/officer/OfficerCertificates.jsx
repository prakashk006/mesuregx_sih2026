import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Award,
  Search,
  ShieldAlert,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  X,
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import DigitalCertificateModal from '../../components/DigitalCertificateModal';

export default function OfficerCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [selectedCert, setSelectedCert] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Revocation Modal
  const [revokeCertId, setRevokeCertId] = useState(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [revoking, setRevoking] = useState(false);

  const fetchCertificates = async () => {
    try {
      const res = await api.get('/certificates');
      setCertificates(res.data?.data?.certificates || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleRevokeSubmit = async (e) => {
    e.preventDefault();
    if (!revokeReason.trim() || !revokeCertId) return;

    setRevoking(true);
    try {
      await api.post(`/certificates/${revokeCertId}/revoke`, { reason: revokeReason });
      setRevokeCertId(null);
      setRevokeReason('');
      fetchCertificates();
    } catch (err) {
      alert(err.response?.data?.message || 'Revocation failed.');
    } finally {
      setRevoking(false);
    }
  };

  const filtered = certificates.filter((c) => {
    const matchSearch =
      !search ||
      c.certificateNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.business?.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.instrument?.customId?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

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
          <h1 style={{ fontSize: '1.75rem', color: '#0f172a' }}>Certificate Registry</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Official ledger of active, expiring, and revoked legal metrology certificates
          </p>
        </div>
      </div>

      {/* Filter / Search */}
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
        <div style={{ flex: 1, minWidth: 260, position: 'relative' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by Certificate ID, Establishment, Instrument..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.4rem' }}
          />
          <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
        </div>

        <div style={{ minWidth: 180 }}>
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="VALID">Valid</option>
            <option value="EXPIRING_SOON">Expiring Soon</option>
            <option value="EXPIRED">Expired</option>
            <option value="REVOKED">Revoked</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <h3>Loading Certificate Registry...</h3>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card empty-state">
          <Award className="empty-icon" />
          <h3 style={{ fontSize: '1.2rem', color: '#0f172a' }}>No certificates found</h3>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Certificate Number</th>
                <th>Establishment</th>
                <th>Instrument</th>
                <th>Issue Date</th>
                <th>Valid Until</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((cert) => (
                <tr key={cert.id}>
                  <td>
                    <strong style={{ color: '#1e3a8a' }}>{cert.certificateNumber}</strong>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{cert.business?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {cert.business?.ownerName}
                    </div>
                  </td>
                  <td>
                    <strong>{cert.instrument?.customId}</strong>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {cert.instrument?.name} ({cert.instrument?.capacity})
                    </div>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>
                    {new Date(cert.issueDate).toLocaleDateString()}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                      {new Date(cert.expiryDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={cert.status} />
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        onClick={() => {
                          setSelectedCert(cert);
                          setShowModal(true);
                        }}
                        className="btn btn-navy btn-sm"
                        title="View Certificate"
                      >
                        <Award size={14} /> View
                      </button>
                      <Link
                        to={`/verify/${cert.certificateNumber}`}
                        className="btn btn-outline btn-sm"
                        title="Public Verification"
                      >
                        <ExternalLink size={14} />
                      </Link>
                      {cert.status !== 'REVOKED' && (
                        <button
                          onClick={() => setRevokeCertId(cert.id)}
                          className="btn btn-outline btn-sm"
                          style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                          title="Revoke Certificate"
                        >
                          <ShieldAlert size={14} /> Revoke
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Certificate Modal */}
      <DigitalCertificateModal
        certificate={selectedCert}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />

      {/* Revocation Confirmation Modal */}
      {revokeCertId && (
        <div className="modal-overlay" onClick={() => setRevokeCertId(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', color: '#dc2626', margin: 0 }}>
                Revoke Metrology Certificate
              </h3>
              <button
                onClick={() => setRevokeCertId(null)}
                className="btn btn-outline btn-sm"
                style={{ border: 'none' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRevokeSubmit}>
              <div className="modal-body">
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
                  Revoking a certificate immediately renders it invalid in the public ledger. Please state the legal metrology defect or tampering justification.
                </p>

                <div className="form-group">
                  <label className="form-label">Revocation Reason *</label>
                  <textarea
                    className="form-textarea"
                    rows="3"
                    placeholder="e.g. Broken lead seal detected during surprise inspection; load cell recalibrated without authorization."
                    value={revokeReason}
                    onChange={(e) => setRevokeReason(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setRevokeCertId(null)}
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
