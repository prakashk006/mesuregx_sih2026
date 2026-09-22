import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Award, QrCode, Search, ExternalLink, ShieldCheck, Printer } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import DigitalCertificateModal from '../../components/DigitalCertificateModal';

export default function BusinessCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [selectedCert, setSelectedCert] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchCertificates = async () => {
    try {
      const res = await api.get('/certificates');
      setCertificates(res.data?.data?.certificates || []);
    } catch (err) {
      console.error('Fetch certificates error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const openCert = (cert) => {
    setSelectedCert(cert);
    setShowModal(true);
  };

  const filtered = certificates.filter((c) => {
    const matchSearch =
      !search ||
      c.certificateNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.instrument?.customId?.toLowerCase().includes(search.toLowerCase()) ||
      c.instrument?.serialNumber?.toLowerCase().includes(search.toLowerCase());
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
          <h1 style={{ fontSize: '1.75rem', color: '#0f172a' }}>Digital Certificates</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Official Legal Metrology digital verification certificates with tamper-evident QR validation
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
            placeholder="Search by Certificate Number, Instrument ID..."
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
            <option value="ALL">All Certificates</option>
            <option value="VALID">Valid</option>
            <option value="EXPIRING_SOON">Expiring Soon</option>
            <option value="EXPIRED">Expired</option>
            <option value="REVOKED">Revoked</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <h3>Loading Certificates...</h3>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card empty-state">
          <Award className="empty-icon" />
          <h3 style={{ fontSize: '1.2rem', color: '#0f172a' }}>No verification certificates issued</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Certificates will appear here once an inspection officer completes field testing and approves your instrument.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Certificate Number</th>
                <th>Instrument</th>
                <th>Capacity / Class</th>
                <th>Issue Date</th>
                <th>Valid Until</th>
                <th>Status</th>
                <th>Verifying Officer</th>
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
                    <strong>{cert.instrument?.customId}</strong>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {cert.instrument?.name}
                    </div>
                  </td>
                  <td>
                    {cert.instrument?.capacity}{' '}
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      (Class {cert.instrument?.accuracyClass})
                    </span>
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
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{cert.officer?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {cert.officer?.code}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        onClick={() => openCert(cert)}
                        className="btn btn-navy btn-sm"
                        title="View Official Certificate"
                      >
                        <Award size={14} /> View
                      </button>
                      <Link
                        to={`/verify/${cert.certificateNumber}`}
                        className="btn btn-outline btn-sm"
                        title="Public QR Verification Page"
                      >
                        <ExternalLink size={14} />
                      </Link>
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
    </div>
  );
}
