import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, Plus, Search, CheckCircle, X, ShieldAlert } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';

export default function AdminOfficersPage() {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    district: 'Coimbatore',
    designation: 'Inspector of Legal Metrology',
    badgeNumber: '',
    password: 'Officer@123',
  });
  const [formLoading, setFormLoading] = useState(false);

  const fetchOfficers = async () => {
    try {
      const res = await api.get('/admin/officers');
      setOfficers(res.data?.data?.officers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await api.post('/admin/officers', formData);
      setShowModal(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        district: 'Coimbatore',
        designation: 'Inspector of Legal Metrology',
        badgeNumber: '',
        password: 'Officer@123',
      });
      fetchOfficers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add officer.');
    } finally {
      setFormLoading(false);
    }
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
          <h1 style={{ fontSize: '1.75rem', color: '#0f172a' }}>Legal Metrology Officers</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Roster of certified field inspectors, jurisdictional districts, and verification records
          </p>
        </div>

        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={16} /> Add Inspection Officer
        </button>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <h3>Loading Officers...</h3>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Officer Code</th>
                <th>Name</th>
                <th>Designation</th>
                <th>District Jurisdiction</th>
                <th>Contact</th>
                <th>Verifications Conducted</th>
                <th>Certificates Issued</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {officers.map((off) => (
                <tr key={off.id}>
                  <td>
                    <strong style={{ color: '#1e3a8a' }}>{off.officerCode}</strong>
                  </td>
                  <td>
                    <strong>{off.name}</strong>
                    {off.badgeNumber && (
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Badge: {off.badgeNumber}
                      </div>
                    )}
                  </td>
                  <td>{off.designation}</td>
                  <td>
                    <span
                      style={{
                        padding: '0.2rem 0.5rem',
                        background: '#eff6ff',
                        color: '#1d4ed8',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                      }}
                    >
                      {off.district}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>
                    <div>{off.email}</div>
                    <div style={{ color: '#64748b' }}>{off.phone}</div>
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 700 }}>
                    {off._count?.verifications || 0}
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 700 }}>
                    {off._count?.certificates || 0}
                  </td>
                  <td>
                    <StatusBadge status={off.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Officer Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Enroll Legal Metrology Officer</h3>
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-outline btn-sm"
                style={{ border: 'none' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Inspector R. Natarajan"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="officer@dept.gov.in"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="+91 98422 00000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">District Jurisdiction *</label>
                    <select
                      className="form-select"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      required
                    >
                      <option value="Coimbatore">Coimbatore</option>
                      <option value="Chennai">Chennai</option>
                      <option value="Tiruppur">Tiruppur</option>
                      <option value="Madurai">Madurai</option>
                      <option value="Salem">Salem</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Designation</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Badge Number (Optional)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="LM-TN-042"
                      value={formData.badgeNumber}
                      onChange={(e) => setFormData({ ...formData, badgeNumber: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Initial Password</label>
                    <input
                      type="password"
                      className="form-input"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={formLoading}>
                  {formLoading ? 'Enrolling...' : 'Enroll Officer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
