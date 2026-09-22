import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!email || !password) {
      setError('Please provide email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await login(email, password);
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (user.role === 'OFFICER') {
        navigate('/officer/dashboard');
      } else {
        navigate('/business/dashboard');
      }
    } catch (err) {
      if (!err.response) {
        setError('Unable to reach authentication server. Please ensure the backend API server is running on port 5000.');
      } else {
        setError(err.response?.data?.message || 'Login failed. Please verify your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 68px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        background: 'transparent',
      }}
    >
      <div className="card" style={{ maxWidth: 440, width: '100%', padding: '2.5rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            className="brand-badge"
            style={{ margin: '0 auto 0.75rem', width: 44, height: 44, fontSize: '1.25rem' }}
          >
            M
          </div>
          <h2 style={{ fontSize: '1.6rem', color: '#ffffff' }}>Sign In to MESUREGX</h2>
          <p style={{ color: 'var(--secondary-text)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
            Legal Metrology Verification & Certification
          </p>
        </div>

        {searchParams.get('registered') && (
          <div
            style={{
              padding: '0.75rem',
              background: 'rgba(34, 197, 94, 0.16)',
              color: '#4ade80',
              border: '1px solid rgba(34, 197, 94, 0.35)',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <ShieldCheck size={16} /> Registration successful! Please log in below.
          </div>
        )}

        {searchParams.get('session_expired') && (
          <div
            style={{
              padding: '0.75rem',
              background: 'rgba(245, 158, 11, 0.16)',
              color: '#fbbf24',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              borderRadius: '8px',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
            }}
          >
            Session expired. Please log in again to continue.
          </div>
        )}

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

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                placeholder="name@business.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ paddingLeft: '2.5rem' }}
              />
              <Mail
                size={16}
                style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingLeft: '2.5rem' }}
              />
              <Lock
                size={16}
                style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={16} />
          </button>
        </form>

        {/* Quick Demo Fill Buttons */}
        <div style={{ marginTop: '1.75rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.25rem' }}>
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--secondary-text)',
              textTransform: 'uppercase',
              marginBottom: '0.5rem',
              textAlign: 'center',
            }}
          >
            ⚡ Quick Demo Auto-Fill
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.75rem' }}
              onClick={() => fillDemoAccount('business@mesuregx.demo', 'Business@123')}
            >
              Business
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.75rem' }}
              onClick={() => fillDemoAccount('officer@mesuregx.demo', 'Officer@123')}
            >
              Officer
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.75rem' }}
              onClick={() => fillDemoAccount('admin@mesuregx.demo', 'Admin@123')}
            >
              Admin
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--secondary-text)' }}>
          New business establishment?{' '}
          <Link to="/register" style={{ color: '#06b6d4', fontWeight: 600 }}>
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
