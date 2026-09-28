import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    mobileNumber: '',
    businessAddress: '',
    city: 'Coimbatore',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    pincode: '641012',
    businessType: 'Retail Store',
    gstNumber: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register(formData);
      navigate('/login?registered=1');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please review inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 68px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1rem',
        background: 'transparent',
      }}
    >
      <div className="card" style={{ maxWidth: 680, width: '100%', padding: '2.5rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            className="brand-badge"
            style={{ margin: '0 auto 0.75rem', width: 44, height: 44, fontSize: '1.25rem' }}
          >
            M
          </div>
          <h2 style={{ fontSize: '1.6rem', color: '#ffffff' }}>Business Owner Registration</h2>
          <p style={{ color: 'var(--secondary-text)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
            Register your trade establishment for digital Legal Metrology verification
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '0.75rem',
              background: 'rgba(239, 68, 68, 0.16)',
              color: '#f87171',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Business Name *</label>
              <input
                type="text"
                name="businessName"
                className="form-input"
                placeholder="e.g. Sri Lakshmi Stores"
                value={formData.businessName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Owner / Authorized Name *</label>
              <input
                type="text"
                name="ownerName"
                className="form-input"
                placeholder="e.g. K. Ramanathan"
                value={formData.ownerName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="contact@business.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mobile Number *</label>
              <input
                type="tel"
                name="mobileNumber"
                className="form-input"
                placeholder="+91 98765 43210"
                value={formData.mobileNumber}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Business Address *</label>
            <input
              type="text"
              name="businessAddress"
              className="form-input"
              placeholder="e.g. 42 Cross Cut Road, Gandhipuram"
              value={formData.businessAddress}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">City *</label>
              <input
                type="text"
                name="city"
                className="form-input"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">District *</label>
              <input
                type="text"
                name="district"
                className="form-input"
                value={formData.district}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">State *</label>
              <input
                type="text"
                name="state"
                className="form-input"
                value={formData.state}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Pincode *</label>
              <input
                type="text"
                name="pincode"
                className="form-input"
                value={formData.pincode}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Business Type *</label>
              <select
                name="businessType"
                className="form-select"
                value={formData.businessType}
                onChange={handleChange}
              >
                <option value="Retail Grocery & Provisions">Retail Grocery & Provisions</option>
                <option value="Supermarket">Supermarket</option>
                <option value="Petroleum Retail Outlet">Petroleum Retail Outlet</option>
                <option value="Agricultural Wholesale / Mandi">Agricultural Wholesale / Mandi</option>
                <option value="Textile & Garment Manufacturing">Textile & Garment Manufacturing</option>
                <option value="Jewellery & Precious Metals">Jewellery & Precious Metals</option>
                <option value="Pharmacy & Chemical Lab">Pharmacy & Chemical Lab</option>
                <option value="Other Commercial Trade">Other Commercial Trade</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">GST Number (Optional)</label>
              <input
                type="text"
                name="gstNumber"
                className="form-input"
                placeholder="33AAAAA0000A1Z5"
                value={formData.gstNumber}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Password * (Min 6 chars)</label>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-input"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Register Business'} <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--secondary-text)' }}>
          Already have a business account?{' '}
          <Link to="/login" style={{ color: '#06b6d4', fontWeight: 600 }}>
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
