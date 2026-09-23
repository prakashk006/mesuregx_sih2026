import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import {
  Building2,
  ShieldCheck,
  Calendar,
  MapPin,
  Mail,
  Phone,
  User,
  Award,
  Save,
  CheckCircle,
  FlaskConical,
  FileText,
} from 'lucide-react';

export default function GatcProfilePage() {
  const { user } = useAuth();
  const [gatc, setGatc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Form fields
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/gatc/profile');
      if (res.data?.success && res.data.data.gatc) {
        const g = res.data.data.gatc;
        setGatc(g);
        setContactPerson(g.contactPerson || '');
        setPhone(g.phone || '');
        setAddress(g.address || '');
        setCity(g.city || '');
        setDistrict(g.district || '');
        setState(g.state || '');
        setPincode(g.pincode || '');
      }
    } catch (err) {
      console.error('Failed to load GATC profile:', err);
      setMessage({ text: 'Failed to load GATC profile.', type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/gatc/profile', {
        contactPerson,
        phone,
        address,
        city,
        district,
        state,
        pincode,
      });
      if (res.data?.success) {
        setMessage({ text: 'Profile updated successfully.', type: 'success' });
        setGatc(res.data.data.gatc);
      }
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to update profile.', type: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--secondary-text)' }}>
        Loading centre profile...
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{
          width: 52,
          height: 52,
          borderRadius: 12,
          background: 'linear-gradient(135deg, #0F766E 0%, #064E3B 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: '0 4px 14px rgba(15, 118, 110, 0.4)',
        }}>
          <FlaskConical size={26} />
        </div>
        <div>
          <div style={{ fontSize: '0.8rem', color: '#0F766E', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Government Approved Test Centre
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
            {gatc?.name || 'Test Centre Profile'}
          </h1>
        </div>
      </div>

      {message.text && (
        <div style={{
          padding: '0.85rem 1.25rem',
          borderRadius: 8,
          marginBottom: '1.5rem',
          fontSize: '0.9rem',
          background: message.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          color: message.type === 'success' ? '#34d399' : '#f87171',
          border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
        }}>
          {message.text}
        </div>
      )}

      {/* Statutory Accreditation Card (Read-only verified details) */}
      <div className="card" style={{ padding: '1.75rem', marginBottom: '1.75rem', borderLeft: '4px solid #0F766E' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={18} color="#0F766E" />
              <span>Statutory Accreditation & Authorization</span>
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--secondary-text)', margin: '0.2rem 0 0' }}>
              Issued by Legal Metrology Directorate under Legal Metrology Act, 2009
            </p>
          </div>
          <StatusBadge status={gatc?.status} size="lg" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)', textTransform: 'uppercase', fontWeight: 600 }}>
              GATC Identifier
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#38bdf8', marginTop: '0.25rem' }}>
              {gatc?.gatcCode}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)', textTransform: 'uppercase', fontWeight: 600 }}>
              Authorization Certificate No
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff', marginTop: '0.25rem' }}>
              {gatc?.authorizationNo}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)', textTransform: 'uppercase', fontWeight: 600 }}>
              Authorization Validity
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#10B981', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Calendar size={14} />
              <span>{gatc?.validTill ? new Date(gatc.validTill).toLocaleDateString() : 'Permanent'}</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)', textTransform: 'uppercase', fontWeight: 600 }}>
              Operating Jurisdiction
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff', marginTop: '0.25rem' }}>
              {gatc?.district}, {gatc?.state}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.35rem' }}>
            Authorized Testing Classes
          </div>
          <div style={{ fontSize: '0.85rem', color: '#e2e8f0', background: 'rgba(255,255,255,0.03)', padding: '0.6rem 0.8rem', borderRadius: 6 }}>
            {gatc?.categories || 'Non-Automatic Weighing Instruments, Fuel Dispensers, Weighbridges'}
          </div>
        </div>
      </div>

      {/* Operational Contact & Address Form */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#ffffff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Building2 size={18} color="#0F766E" />
          <span>Operational Contact & Physical Address</span>
        </h3>

        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Authorized Contact Person</label>
              <input
                type="text"
                className="form-input"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Official Contact Phone</label>
              <input
                type="text"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Centre Street Address / Industrial Estate</label>
            <input
              type="text"
              className="form-input"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">City / Town</label>
              <input
                type="text"
                className="form-input"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">District</label>
              <input
                type="text"
                className="form-input"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">State</label>
              <input
                type="text"
                className="form-input"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">PIN Code</label>
              <input
                type="text"
                className="form-input"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              style={{ background: '#0F766E', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Save size={16} />
              <span>{saving ? 'Updating...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
