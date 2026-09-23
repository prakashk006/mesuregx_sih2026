import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  ShieldAlert,
  AlertTriangle,
  FileCheck,
  CheckCircle,
  Clock,
  Eye,
  RefreshCw,
  MapPin,
  Calendar,
  Building,
  Scale,
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';

export default function BusinessEnforcementPage() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCases = async () => {
    try {
      setLoading(true);
      const res = await api.get('/enforcement');
      setCases(res.data?.data?.cases || []);
    } catch (err) {
      console.error('Failed to load business compliance records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, []);

  return (
    <div className="page-body" style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem' }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, #064E3B 0%, #0F766E 100%)',
          padding: '1.75rem 2rem',
          borderRadius: '16px',
          color: '#FFFFFF',
        }}
      >
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', opacity: 0.9 }}>
            LEGAL METROLOGY COMPLIANCE NOTICES
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0.25rem 0' }}>
            Enforcement & Statutory Inquiries
          </h1>
          <p style={{ margin: 0, opacity: 0.85, fontSize: '0.85rem' }}>
            Review official notices, show-cause communications, and re-verification mandates issued by the Department.
          </p>
        </div>

        <button
          onClick={loadCases}
          className="btn btn-outline"
          style={{ color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <RefreshCw size={32} className="spin-animate" style={{ color: '#0F766E', margin: '0 auto 0.75rem' }} />
          <h3>Checking Department Records...</h3>
        </div>
      ) : cases.length === 0 ? (
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '4rem 2rem',
            textAlign: 'center',
            border: '1px solid #E2E8F0',
          }}
        >
          <CheckCircle size={48} style={{ color: '#10B981', margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#064E3B', margin: '0 0 0.5rem' }}>
            Full Compliance: No Active Infractions
          </h2>
          <p style={{ color: '#64748B', maxWidth: '500px', margin: '0 auto' }}>
            Your business and registered measuring instruments currently have zero pending enforcement notices, show-cause inquiries, or statutory violations.
          </p>
        </div>
      ) : (
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
            boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#064E3B' }}>
              Statutory Inquiries & Compliance Dossiers ({cases.length})
            </h3>
          </div>

          <table className="table" style={{ margin: 0, width: '100%', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F1F5F9', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>CASE ID</th>
                <th style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>VIOLATION REASON</th>
                <th style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>PRIORITY</th>
                <th style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>CURRENT STATUS</th>
                <th style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>INSPECTING OFFICER</th>
                <th style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>NOTICE DATE</th>
                <th style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: 700, color: '#475569', textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '1rem', fontWeight: 700, color: '#064E3B' }}>{c.caseNumber}</td>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{c.violationType}</td>
                  <td style={{ padding: '1rem' }}>
                    <StatusBadge status={c.priority?.toUpperCase()} size="sm" />
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <StatusBadge status={c.status} size="sm" />
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#475569' }}>
                    {c.officer?.name || 'Department Inspector'}
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#64748B' }}>
                    {new Date(c.detectedDate).toLocaleDateString('en-IN')}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <Link
                      to={`/officer/enforcement/${c.id}`}
                      className="btn btn-sm btn-outline"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <Eye size={14} />
                      <span>View Notice</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
