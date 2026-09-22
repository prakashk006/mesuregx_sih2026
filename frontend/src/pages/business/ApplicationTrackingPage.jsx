import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';
import {
  FileText,
  Search,
  CheckCircle,
  AlertTriangle,
  Award,
  ExternalLink,
  Calendar,
  Clock,
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import DigitalCertificateModal from '../../components/DigitalCertificateModal';

export default function ApplicationTrackingPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchParams] = useSearchParams();

  // Certificate Modal View
  const [selectedCert, setSelectedCert] = useState(null);
  const [showCertModal, setShowCertModal] = useState(false);

  const fetchApplications = async () => {
    try {
      const res = await api.get('/applications');
      setApplications(res.data?.data?.applications || []);
    } catch (err) {
      console.error('Fetch applications error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const openCertModal = async (certId) => {
    try {
      const res = await api.get(`/certificates/${certId}`);
      setSelectedCert(res.data?.data?.certificate);
      setShowCertModal(true);
    } catch (err) {
      alert('Failed to load certificate details.');
    }
  };

  const filtered = applications.filter((app) => {
    const matchSearch =
      !search ||
      app.applicationNumber.toLowerCase().includes(search.toLowerCase()) ||
      app.instrument?.customId?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || app.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const submittedAppNum = searchParams.get('submitted');

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
          <h1 style={{ fontSize: '1.75rem', color: '#0f172a' }}>Verification Applications</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Track application lifecycle, scheduled inspections, officer reviews, and issued certificates
          </p>
        </div>

        <Link to="/business/applications/new" className="btn btn-primary">
          <FileText size={16} /> New Application
        </Link>
      </div>

      {submittedAppNum && (
        <div
          style={{
            padding: '1rem 1.25rem',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            borderRadius: '10px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <CheckCircle size={22} color="#059669" />
          <div>
            <strong>Application {submittedAppNum} Submitted!</strong> Your verification request is under
            review by the Legal Metrology department. An officer will be assigned shortly.
          </div>
        </div>
      )}

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
        <div style={{ flex: 1, minWidth: 260, position: 'relative' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by Application Number or Instrument ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.4rem' }}
          />
          <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
        </div>

        <div style={{ minWidth: 200 }}>
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Application Statuses</option>
            <option value="SUBMITTED">Submitted / In Review</option>
            <option value="ASSIGNED">Officer Assigned</option>
            <option value="SCHEDULED">Inspection Scheduled</option>
            <option value="FIELD_VERIFICATION">Field Verification</option>
            <option value="OFFICER_REVIEW">Officer Review</option>
            <option value="CERTIFICATE_ISSUED">Certificate Issued</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <h3>Loading Applications...</h3>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card empty-state">
          <FileText className="empty-icon" />
          <h3 style={{ fontSize: '1.2rem', color: '#0f172a' }}>No applications found</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem', marginBottom: '1.5rem' }}>
            Submit an application to start the legal metrology verification process.
          </p>
          <Link to="/business/applications/new" className="btn btn-primary">
            Apply Now
          </Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Application ID</th>
                <th>Instrument</th>
                <th>Application Type</th>
                <th>Submission Date</th>
                <th>Assigned Officer</th>
                <th>Scheduled Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((app) => (
                <tr key={app.id}>
                  <td>
                    <strong style={{ color: '#1e3a8a' }}>{app.applicationNumber}</strong>
                  </td>
                  <td>
                    <strong>{app.instrument?.customId}</strong>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {app.instrument?.instrumentType?.name}
                    </div>
                  </td>
                  <td>{app.applicationType}</td>
                  <td style={{ fontSize: '0.85rem' }}>
                    {new Date(app.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    {app.assignment?.officer ? (
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                          {app.assignment.officer.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {app.assignment.officer.officerCode}
                        </div>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Pending Assignment</span>
                    )}
                  </td>
                  <td>
                    {app.assignment?.scheduledDate ? (
                      <div style={{ fontSize: '0.85rem', color: '#0f172a' }}>
                        {new Date(app.assignment.scheduledDate).toLocaleDateString()}
                        {app.assignment.scheduledTime && (
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {app.assignment.scheduledTime}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Not Scheduled</span>
                    )}
                  </td>
                  <td>
                    <StatusBadge status={app.status} />
                    {app.status === 'REJECTED' && app.rejectionReason && (
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: '#dc2626',
                          marginTop: '0.25rem',
                          maxWidth: 220,
                        }}
                      >
                        <strong>Reason:</strong> {app.rejectionReason}
                      </div>
                    )}
                  </td>
                  <td>
                    {app.certificate ? (
                      <button
                        onClick={() => openCertModal(app.certificate.id)}
                        className="btn btn-navy btn-sm"
                        title="View Certificate"
                      >
                        <Award size={14} /> Certificate
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>In Progress</span>
                    )}
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
        isOpen={showCertModal}
        onClose={() => setShowCertModal(false)}
      />
    </div>
  );
}
