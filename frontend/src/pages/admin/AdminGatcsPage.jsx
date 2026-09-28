import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Building2,
  ShieldCheck,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Calendar,
  Phone,
  Mail,
  MapPin,
  X,
} from 'lucide-react';

export default function AdminGatcsPage() {
  const [gatcs, setGatcs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    gatcCode: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    pincode: '',
    authorizationNo: '',
    validTill: '',
    categories: 'Non-Automatic Weighing Instruments, Fuel Dispensers, Platform Scales',
    password: 'Gatc@123',
  });

  const fetchGatcs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/gatcs');
      setGatcs(res.data?.data?.gatcs || []);
    } catch (err) {
      setError('Failed to fetch GATC facilities.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGatcs();
  }, []);

  const handleToggleStatus = async (id) => {
    try {
      await api.put(`/admin/gatcs/${id}/toggle`);
      fetchGatcs();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update accreditation status.');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/admin/gatcs', formData);
      setShowAddModal(false);
      setFormData({
        name: '',
        gatcCode: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        district: 'Coimbatore',
        state: 'Tamil Nadu',
        pincode: '',
        authorizationNo: '',
        validTill: '',
        categories: 'Non-Automatic Weighing Instruments, Fuel Dispensers, Platform Scales',
        password: 'Gatc@123',
      });
      fetchGatcs();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to onboard GATC facility.');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = gatcs.filter((g) => {
    const s = search.toLowerCase();
    return (
      !search ||
      g.name?.toLowerCase().includes(s) ||
      g.gatcCode?.toLowerCase().includes(s) ||
      g.authorizationNo?.toLowerCase().includes(s) ||
      g.district?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="page-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700 }}>Authorized Test Centres (GATC)</h2>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--secondary-text)', fontSize: '0.88rem' }}>
            Government-notified private & public laboratories authorized for verification testing under Legal Metrology Rules.
          </p>
        </div>
        <button
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={18} /> Accredit New GATC Facility
        </button>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.15)', color: '#f87171', borderRadius: '8px', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary-text)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Search by facility name, GATC code, authorization number, or district..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* GATC Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--secondary-text)' }}>
          Loading GATC facilities...
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--secondary-text)' }}>
          <Building2 size={40} color="#06b6d4" style={{ marginBottom: '0.75rem', opacity: 0.8 }} />
          <p>No authorized GATC laboratories found.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
          {filtered.map((g) => {
            const isActive = g.status === 'ACTIVE';
            return (
              <div key={g.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          background: 'rgba(6, 182, 212, 0.15)',
                          color: '#06b6d4',
                          border: '1px solid rgba(6, 182, 212, 0.3)',
                          textTransform: 'uppercase',
                        }}
                      >
                        {g.gatcCode}
                      </span>
                      <h3 style={{ margin: '0.5rem 0 0.2rem', fontSize: '1.15rem', fontWeight: 700 }}>
                        {g.name}
                      </h3>
                    </div>
                    <span
                      style={{
                        padding: '0.25rem 0.6rem',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: isActive ? '#10b981' : '#f87171',
                        border: `1px solid ${isActive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                      }}
                    >
                      {g.status}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--secondary-text)', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <div><strong>Authorization:</strong> {g.authorizationNo}</div>
                    <div><Calendar size={13} style={{ display: 'inline', marginRight: '4px' }} /><strong>Valid Till:</strong> {new Date(g.validTill).toLocaleDateString()}</div>
                    <div><MapPin size={13} style={{ display: 'inline', marginRight: '4px' }} />{g.address}, {g.city} ({g.district})</div>
                    <div><Mail size={13} style={{ display: 'inline', marginRight: '4px' }} />{g.email} • {g.phone}</div>
                  </div>

                  <div style={{ padding: '0.75rem', background: 'var(--glass-subtle)', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '1rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--primary-text)', marginBottom: '0.25rem' }}>Approved Categories:</div>
                    <div style={{ color: 'var(--secondary-text)' }}>{g.categories}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '0.85rem' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--secondary-text)' }}>
                    Assignments: <strong>{g._count?.assignments || 0}</strong> • Verified: <strong>{g._count?.certificates || 0}</strong>
                  </div>
                  <button
                    className={`btn btn-sm ${isActive ? 'btn-outline' : 'btn-primary'}`}
                    style={{ fontSize: '0.75rem' }}
                    onClick={() => handleToggleStatus(g.id)}
                  >
                    {isActive ? 'Suspend Authorization' : 'Activate Authorization'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add GATC Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>Onboard Authorized GATC Facility</h3>
              <button className="btn-icon" onClick={() => setShowAddModal(false)}><X size={20} /></button>
            </div>

            <form onSubmit={handleCreate}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Facility Legal Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Apex Calibration Labs Pvt Ltd"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">GATC Identifier Code *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. GATC-TN-002"
                    value={formData.gatcCode}
                    onChange={(e) => setFormData({ ...formData, gatcCode: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Authorization Order No *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. GATC-AUTH-2026-TN-042"
                    value={formData.authorizationNo}
                    onChange={(e) => setFormData({ ...formData, authorizationNo: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Person Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Dr. K. Soundararajan"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Official Email (Login) *</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="lab@gatc.demo"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="+91 98422 00000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">District *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Accreditation Valid Till</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.validTill}
                    onChange={(e) => setFormData({ ...formData, validTill: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Approved Verification Categories</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.categories}
                  onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Accrediting...' : 'Save & Issue Accreditation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
