import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Building2, Save, CheckCircle, AlertCircle } from 'lucide-react';

export default function BusinessProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await api.get('/business/profile');
        setProfile(res.data?.data?.business);
      } catch (err) {
        setError('Failed to fetch business profile.');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
    setMessage('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const res = await api.put('/business/profile', profile);
      setProfile(res.data?.data?.business);
      setMessage('Business profile details updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-body" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <h3>Loading Profile...</h3>
      </div>
    );
  }

  return (
    <div className="page-body" style={{ maxWidth: 840 }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', color: '#0f172a' }}>Business Profile</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Manage your trade establishment contact details and legal metrology registration
        </p>
      </div>

      {message && (
        <div
          style={{
            padding: '0.85rem 1rem',
            background: 'rgba(34, 197, 94, 0.16)',
            color: '#4ade80',
            border: '1px solid rgba(34, 197, 94, 0.35)',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <CheckCircle size={18} /> {message}
        </div>
      )}

      {error && (
        <div
          style={{
            padding: '0.85rem 1rem',
            background: 'rgba(239, 68, 68, 0.16)',
            color: '#f87171',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Business Name</label>
              <input
                type="text"
                name="businessName"
                className="form-input"
                value={profile?.businessName || ''}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Owner / Authorized Representative</label>
              <input
                type="text"
                name="ownerName"
                className="form-input"
                value={profile?.ownerName || ''}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Login ID)</label>
              <input
                type="email"
                className="form-input"
                value={profile?.email || ''}
                disabled
                style={{ background: 'rgba(255, 255, 255, 0.03)', opacity: 0.6, cursor: 'not-allowed' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mobile Contact Number</label>
              <input
                type="tel"
                name="mobile"
                className="form-input"
                value={profile?.mobile || ''}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Registered Premises Address</label>
            <input
              type="text"
              name="address"
              className="form-input"
              value={profile?.address || ''}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                name="city"
                className="form-input"
                value={profile?.city || ''}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">District</label>
              <input
                type="text"
                name="district"
                className="form-input"
                value={profile?.district || ''}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">State</label>
              <input
                type="text"
                name="state"
                className="form-input"
                value={profile?.state || ''}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Pincode</label>
              <input
                type="text"
                name="pincode"
                className="form-input"
                value={profile?.pincode || ''}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Business Type</label>
              <select
                name="businessType"
                className="form-select"
                value={profile?.businessType || 'Retail Store'}
                onChange={handleChange}
              >
                <option value="Retail Grocery & Provisions">Retail Grocery & Provisions</option>
                <option value="Supermarket">Supermarket</option>
                <option value="Petroleum Retail Outlets">Petroleum Retail Outlets</option>
                <option value="Agricultural Wholesale">Agricultural Wholesale</option>
                <option value="Textile Manufacturing">Textile Manufacturing</option>
                <option value="Other Commercial Trade">Other Commercial Trade</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">GST Number</label>
              <input
                type="text"
                name="gstNumber"
                className="form-input"
                value={profile?.gstNumber || ''}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Save size={16} /> {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
