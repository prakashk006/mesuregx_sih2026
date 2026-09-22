import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  CreditCard,
  CheckCircle,
  Clock,
  Download,
  Printer,
  FileText,
  Search,
  ChevronRight,
  X,
  ShieldCheck,
  Building,
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';

export default function BusinessPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/payments', {
        params: { search: search || undefined },
      });
      setPayments(res.data?.data?.payments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPayments();
  };

  const totalPaid = payments
    .filter((p) => p.status === 'PAID')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

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
          <h1 style={{ fontSize: '1.75rem', color: '#ffffff' }}>Fee Payments & Receipts</h1>
          <p style={{ color: 'var(--secondary-text)', fontSize: '0.9rem' }}>
            Official Legal Metrology government verification charges, fee receipts, and transaction records
          </p>
        </div>

        <Link to="/business/applications" className="btn btn-navy">
          <FileText size={16} /> View Applications
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="stat-grid" style={{ marginBottom: '2rem' }}>
        <div className="card stat-card">
          <div className="stat-header">
            <div className="stat-title">Total Verified Fees Paid</div>
            <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80' }}>
              <CreditCard size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#4ade80' }}>₹{totalPaid.toFixed(2)}</div>
          <div className="stat-subtitle">Across {payments.length} verified applications</div>
        </div>

        <div className="card stat-card">
          <div className="stat-header">
            <div className="stat-title">Fee Receipts Issued</div>
            <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
              <FileText size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#06b6d4' }}>{payments.length}</div>
          <div className="stat-subtitle">Tamper-evident digital receipts</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search by Payment #, Receipt #, App #, or Transaction Ref..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
          </div>
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>
      </div>

      {/* Payments Table */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <h3>Loading Payments...</h3>
        </div>
      ) : payments.length === 0 ? (
        <div className="card empty-state">
          <CreditCard className="empty-icon" />
          <h3 style={{ fontSize: '1.2rem', color: '#ffffff' }}>No payment records found</h3>
          <p style={{ color: 'var(--secondary-text)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            When you submit an application or pay verification fees, official receipts will be archived here.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Receipt / Payment #</th>
                <th>Application</th>
                <th>Instrument</th>
                <th>Fee Purpose</th>
                <th>Payment Mode</th>
                <th>Amount</th>
                <th>Date Paid</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong style={{ color: '#06b6d4' }}>{p.receiptNumber}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)' }}>{p.paymentNumber}</div>
                  </td>
                  <td>
                    <Link
                      to={`/business/applications`}
                      style={{ color: '#ffffff', fontWeight: 600 }}
                    >
                      {p.application?.applicationNumber || 'N/A'}
                    </Link>
                  </td>
                  <td>
                    <div style={{ color: '#ffffff', fontWeight: 600 }}>{p.application?.instrument?.customId || 'Standard'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)' }}>
                      {p.application?.instrument?.instrumentType?.name || 'Weighing Scale'}
                    </div>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{p.feeType}</td>
                  <td>
                    <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.08)', borderRadius: '4px' }}>
                      {p.paymentMethod}
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: '#4ade80', fontSize: '0.95rem' }}>₹{p.amount.toFixed(2)}</strong>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--secondary-text)' }}>
                    {p.paidAt ? new Date(p.paidAt).toLocaleDateString() : 'Pending'}
                  </td>
                  <td>
                    <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: '999px', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', fontWeight: 700 }}>
                      ✓ PAID
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPayment(p);
                        setShowReceiptModal(true);
                      }}
                      className="btn btn-outline btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      <Printer size={13} /> Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Official Receipt Modal */}
      {showReceiptModal && selectedPayment && (
        <div className="modal-overlay" onClick={() => setShowReceiptModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 580 }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={20} style={{ color: '#06b6d4' }} />
                <h3 style={{ fontSize: '1.2rem', margin: 0, color: '#ffffff' }}>Government Metrology Receipt</h3>
              </div>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="btn btn-outline btn-sm"
                style={{ border: 'none' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" id="printable-receipt" style={{ padding: '1.5rem', background: 'var(--glass-subtle)', borderRadius: '12px' }}>
              <div style={{ textAlign: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.8rem', color: '#06b6d4', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                  DEPARTMENT OF LEGAL METROLOGY
                </div>
                <h2 style={{ fontSize: '1.4rem', color: '#ffffff', margin: '0.25rem 0' }}>Official Verification Fee Receipt</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--secondary-text)' }}>
                  Verification Fee Assessment & Payment Confirmation
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                <div>
                  <div style={{ color: 'var(--secondary-text)' }}>Receipt Number</div>
                  <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '1rem' }}>{selectedPayment.receiptNumber}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--secondary-text)' }}>Payment Reference</div>
                  <div style={{ fontWeight: 700, color: '#06b6d4' }}>{selectedPayment.transactionRef}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--secondary-text)' }}>Application ID</div>
                  <div style={{ fontWeight: 700, color: '#ffffff' }}>{selectedPayment.application?.applicationNumber}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--secondary-text)' }}>Payment Date & Time</div>
                  <div style={{ color: '#ffffff' }}>{new Date(selectedPayment.paidAt).toLocaleString()}</div>
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '1rem', marginBottom: '1.25rem', border: '1px solid var(--glass-border)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--secondary-text)', marginBottom: '0.25rem' }}>Establishment Details</div>
                <div style={{ fontWeight: 700, color: '#ffffff' }}>{selectedPayment.business?.businessName}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--secondary-text)' }}>Owner: {selectedPayment.business?.ownerName} | {selectedPayment.business?.district}</div>
              </div>

              <table style={{ width: '100%', marginBottom: '1.25rem', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--secondary-text)', textAlign: 'left' }}>
                    <th style={{ padding: '0.5rem 0' }}>Description</th>
                    <th style={{ padding: '0.5rem 0', textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '0.6rem 0', color: '#ffffff' }}>
                      {selectedPayment.feeType} — {selectedPayment.application?.instrument?.customId} ({selectedPayment.application?.instrument?.instrumentType?.name})
                    </td>
                    <td style={{ padding: '0.6rem 0', textAlign: 'right', fontWeight: 700, color: '#ffffff' }}>
                      ₹{selectedPayment.amount.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.75rem 0', fontWeight: 800, color: '#ffffff', fontSize: '1rem' }}>Total Amount Paid</td>
                    <td style={{ padding: '0.75rem 0', textAlign: 'right', fontWeight: 800, color: '#4ade80', fontSize: '1.1rem' }}>
                      ₹{selectedPayment.amount.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8', borderTop: '1px solid var(--glass-border)', paddingTop: '0.75rem' }}>
                Digital system generated receipt. Retain this confirmation for legal metrology inspection audit.
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => window.print()}
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Printer size={16} /> Print Receipt
              </button>
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="btn btn-outline"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
