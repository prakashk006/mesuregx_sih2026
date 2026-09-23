import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, AlertCircle, ArrowRight, ShieldCheck, FlaskConical } from 'lucide-react';

export default function RegisterPage() {
  const [regType, setRegType] = useState('BUSINESS'); // 'BUSINESS' or 'GATC'

  // Business form state
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

  // GATC form state
  const [gatcData, setGatcData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    city: 'Coimbatore',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    pincode: '641014',
    authorizationNo: '',
    categories: 'Non-Automatic Weighing Instruments, Flow Meters, Fuel Dispensers',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register, registerGatc } = useAuth();
  const navigate = useNavigate();

  const handleBusinessChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleGatcChange = (e) => {
    setGatcData({ ...gatcData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleBusinessSubmit = async (e) => {
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

  const handleGatcSubmit = async (e) => {
    e.preventDefault();
    if (gatcData.password !== gatcData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (gatcData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await registerGatc(gatcData);
      navigate('/login?registered_gatc=1');
    } catch (err) {
      setError(err.response?.data?.message || 'GATC registration failed. Please review inputs.');
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
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            className="brand-badge"
            style={{ margin: '0 auto 0.75rem', width: 44, height: 44, fontSize: '1.25rem' }}
          >
            M
          </div>
          <h2 style={{ fontSize: '1.6rem', color: '#ffffff' }}>Stakeholder Registration</h2>
          <p style={{ color: 'var(--secondary-text)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
            MESUREGX Legal Metrology Verification Network
          </p>

          {/* Registration Type Toggle Tabs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.5rem',
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '0.35rem',
            borderRadius: 8,
            marginTop: '1.25rem',
          }}>
            <button
              type="button"
              onClick={() => { setRegType('BUSINESS'); setError(''); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                padding: '0.6rem',
                borderRadius: 6,
                border: 'none',
                background: regType === 'BUSINESS' ? '#2563EB' : 'transparent',
                color: regType === 'BUSINESS' ? '#ffffff' : 'var(--secondary-text)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Building2 size={16} />
              <span>Business / Trade Owner</span>
            </button>

            <button
              type="button"
              onClick={() => { setRegType('GATC'); setError(''); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                padding: '0.6rem',
                borderRadius: 6,
                border: 'none',
                background: regType === 'GATC' ? '#0F766E' : 'transparent',
                color: regType === 'GATC' ? '#ffffff' : 'var(--secondary-text)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <FlaskConical size={16} />
              <span>Test Centre (GATC)</span>
            </button>
          </div>
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

        {/* REGISTRATION FORM: BUSINESS */}
        {regType === 'BUSINESS' && (
          <form onSubmit={handleBusinessSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Establishment / Trade Name *</label>
                <input
                  type="text"
                  name="businessName"
                  className="form-input"
                  placeholder="e.g. Sri Lakshmi Supermarket"
                  value={formData.businessName}
                  onChange={handleBusinessChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Proprietor / Owner Name *</label>
                <input
                  type="text"
                  name="ownerName"
                  className="form-input"
                  placeholder="e.g. K. Ramanathan"
                  value={formData.ownerName}
                  onChange={handleBusinessChange}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="owner@business.com"
                  value={formData.email}
                  onChange={handleBusinessChange}
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
                  onChange={handleBusinessChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Business Premises Address *</label>
              <input
                type="text"
                name="businessAddress"
                className="form-input"
                placeholder="Shop No, Street, Landmark"
                value={formData.businessAddress}
                onChange={handleBusinessChange}
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
                  onChange={handleBusinessChange}
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
                  onChange={handleBusinessChange}
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
                  onChange={handleBusinessChange}
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
                  onChange={handleBusinessChange}
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
                  onChange={handleBusinessChange}
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
                  onChange={handleBusinessChange}
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
                  onChange={handleBusinessChange}
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
                  onChange={handleBusinessChange}
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
        )}

        {/* REGISTRATION FORM: GATC */}
        {regType === 'GATC' && (
          <form onSubmit={handleGatcSubmit}>
            <div style={{
              padding: '0.85rem 1rem',
              background: 'rgba(15, 118, 110, 0.15)',
              border: '1px solid rgba(15, 118, 110, 0.3)',
              borderRadius: 8,
              fontSize: '0.85rem',
              color: '#2dd4bf',
              marginBottom: '1.25rem',
            }}>
              <strong>Government Approved Test Centre Application:</strong> Registration requires technical authorization approval by the Legal Metrology Directorate before receiving testing allocations.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Test Centre / Laboratory Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="e.g. Apex Legal Metrology Standards Lab"
                  value={gatcData.name}
                  onChange={handleGatcChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Authorized Lab Director / Contact *</label>
                <input
                  type="text"
                  name="contactPerson"
                  className="form-input"
                  placeholder="e.g. Dr. S. K. Ramanathan"
                  value={gatcData.contactPerson}
                  onChange={handleGatcChange}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Official Email Address *</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="lab@testcentre.demo"
                  value={gatcData.email}
                  onChange={handleGatcChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Official Contact Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  placeholder="+91 94421 88001"
                  value={gatcData.phone}
                  onChange={handleGatcChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Statutory Authorization / NABL Accreditation No *</label>
              <input
                type="text"
                name="authorizationNo"
                className="form-input"
                placeholder="e.g. GATC-AUTH-2026-TN-099"
                value={gatcData.authorizationNo}
                onChange={handleGatcChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Physical Laboratory / Testing Facility Address *</label>
              <input
                type="text"
                name="address"
                className="form-input"
                placeholder="Industrial Estate, Plot No, Street"
                value={gatcData.address}
                onChange={handleGatcChange}
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
                  value={gatcData.city}
                  onChange={handleGatcChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">District *</label>
                <input
                  type="text"
                  name="district"
                  className="form-input"
                  value={gatcData.district}
                  onChange={handleGatcChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">State *</label>
                <input
                  type="text"
                  name="state"
                  className="form-input"
                  value={gatcData.state}
                  onChange={handleGatcChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Pincode *</label>
                <input
                  type="text"
                  name="pincode"
                  className="form-input"
                  value={gatcData.pincode}
                  onChange={handleGatcChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Authorized Instrument Testing Scope</label>
              <input
                type="text"
                name="categories"
                className="form-input"
                value={gatcData.categories}
                onChange={handleGatcChange}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Password * (Min 6 chars)</label>
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={gatcData.password}
                  onChange={handleGatcChange}
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
                  value={gatcData.confirmPassword}
                  onChange={handleGatcChange}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '1rem', background: '#0F766E' }}
              disabled={loading}
            >
              {loading ? 'Submitting Registration...' : 'Register Test Centre (GATC)'} <ArrowRight size={18} />
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--secondary-text)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#06b6d4', fontWeight: 600 }}>
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
