import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, Search, X, Camera, ShieldCheck, ArrowRight } from 'lucide-react';

export default function QRScannerModal({ isOpen, onClose }) {
  const [certInput, setCertInput] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLookup = (code) => {
    const target = (code || certInput).trim().toUpperCase();
    if (!target) {
      setError('Please enter a certificate number.');
      return;
    }
    onClose();
    navigate(`/verify/${target}`);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '8px',
                background: 'rgba(37, 99, 235, 0.18)',
                color: '#60a5fa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <QrCode size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Certificate Verification</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--secondary-text)', margin: 0 }}>
                Scan QR or enter official Certificate ID
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-outline btn-sm" style={{ border: 'none', padding: '0.35rem' }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div style={{ padding: '0.65rem 0.85rem', background: 'rgba(239, 68, 68, 0.16)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.35)', borderRadius: 8, fontSize: '0.85rem', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Enter Certificate Number</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. CERT-2026-000001"
                value={certInput}
                onChange={(e) => {
                  setCertInput(e.target.value);
                  setError('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                autoFocus
              />
              <button onClick={() => handleLookup()} className="btn btn-primary">
                <Search size={16} /> Verify
              </button>
            </div>
          </div>

          <div
            style={{
              padding: '1.5rem',
              borderRadius: '12px',
              border: '2px dashed rgba(255, 255, 255, 0.2)',
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.04)',
              marginBottom: '1.25rem',
            }}
          >
            <Camera size={36} style={{ color: '#06b6d4', margin: '0 auto 0.5rem' }} />
            <h4 style={{ fontSize: '0.95rem', color: '#ffffff' }}>Camera QR Scanner</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--secondary-text)', marginTop: '0.25rem' }}>
              Point device camera at the printed physical instrument certificate QR code
            </p>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ marginTop: '0.75rem' }}
              onClick={() => handleLookup('CERT-2026-000001')}
            >
              Simulate Camera QR Detection
            </button>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Quick Demo Samples
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => handleLookup('CERT-2026-000001')}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.75rem' }}
              >
                <ShieldCheck size={12} style={{ color: '#10b981' }} /> CERT-2026-000001 (Valid)
              </button>
              <button
                type="button"
                onClick={() => handleLookup('CERT-2025-000098')}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.75rem' }}
              >
                CERT-2025-000098 (Expiring Soon)
              </button>
              <button
                type="button"
                onClick={() => handleLookup('CERT-2024-000045')}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.75rem' }}
              >
                CERT-2024-000045 (Expired)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
