import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  CreditCard,
  DollarSign,
  Search,
  Filter,
  Printer,
  X,
  ShieldCheck,
  Building,
} from 'lucide-react';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedPayment, setSelectedPayment] = useState(null);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/payments', {
        params: {
          search: search || undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
        },
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
  }, [statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPayments();
  };

  const totalRevenue = payments
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
          <h1 style={{ fontSize: '1.75rem', color: '#ffffff' }}>State Revenue & Fee Reconciliation</h1>
          <p style={{ color: 'var(--secondary-text)', fontSize: '0.9rem' }}>
            Central audit of legal metrology verification fees, digital receipts, and treasury reconciliation
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="stat-grid" style={{ marginBottom: '2rem' }}>
        <div className="card stat-card">
          <div className="stat-header">
            <div className="stat-title">Total Revenue Collected</div>
            <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80' }}>
              <CreditCard size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#4ade80' }}>₹{totalRevenue.toFixed(2)}</div>
          <div className="stat-subtitle">Across {payments.length} transactions</div>
        </div>

        <div className="card stat-card">
          <div className="stat-header">
            <div className="stat-title">Fee Receipts Issued</div>
            <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
              <ShieldCheck size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: '#06b6d4' }}>{payments.length}</div>
          <div className="stat-subtitle">Official treasury receipts</div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <form onSubmit={handleSearch} style={{ flex: 1, minWidth: 260, position: 'relative' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by Payment #, Receipt #, Establishment, or Ref..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
          <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
        </form>

        <select
          className="form-select"
          style={{ width: 180 }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="PAID">Paid</option>
          <option value="PENDING">Pending</option>
          <option value="WAIVED">Waived</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <h3>Loading Transactions...</h3>
        </div>
      ) : payments.length === 0 ? (
        <div className="card empty-state">
          <CreditCard className="empty-icon" />
          <h3 style={{ fontSize: '1.2rem', color: '#ffffff' }}>No transaction records found</h3>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Receipt #</th>
                <th>Establishment</th>
                <th>Application</th>
                <th>Fee Type</th>
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
                    <div style={{ fontWeight: 700, color: '#ffffff' }}>{p.business?.businessName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)' }}>{p.business?.district}</div>
                  </td>
                  <td>
                    <span style={{ color: '#ffffff', fontWeight: 600 }}>{p.application?.applicationNumber}</span>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{p.feeType}</td>
                  <td>
                    <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.08)', borderRadius: '4px' }}>
                      {p.paymentMethod}
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: '#4ade80' }}>₹{p.amount.toFixed(2)}</strong>
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
                      onClick={() => setSelectedPayment(p)}
                      className="btn btn-outline btn-sm"
                    >
                      <Printer size={13} style={{ marginRight: 4 }} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Official Receipt Modal */}
      {selectedPayment && (
        <div className="modal-overlay" onClick={() => setSelectedPayment(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', margin: 0, color: '#ffffff' }}>Treasury Fee Receipt</h3>
              <button onClick={() => setSelectedPayment(null)} className="btn btn-outline btn-sm" style={{ border: 'none' }}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: '1.25rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.8rem', color: '#06b6d4', textTransform: 'uppercase', fontWeight: 700 }}>
                  LEGAL METROLOGY STATE TREASURY
                </div>
                <h3 style={{ margin: '0.25rem 0', color: '#ffffff' }}>{selectedPayment.receiptNumber}</h3>
                <div style={{ color: 'var(--secondary-text)', fontSize: '0.8rem' }}>
                  Ref: {selectedPayment.transactionRef}
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.04)', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.85rem', lineHeight: 1.8 }}>
                <div><strong style={{ color: 'var(--secondary-text)' }}>Establishment:</strong> <span style={{ color: '#ffffff' }}>{selectedPayment.business?.businessName}</span></div>
                <div><strong style={{ color: 'var(--secondary-text)' }}>Owner / Contact:</strong> <span style={{ color: '#ffffff' }}>{selectedPayment.business?.ownerName} ({selectedPayment.business?.mobile})</span></div>
                <div><strong style={{ color: 'var(--secondary-text)' }}>Application ID:</strong> <span style={{ color: '#ffffff' }}>{selectedPayment.application?.applicationNumber}</span></div>
                <div><strong style={{ color: 'var(--secondary-text)' }}>Fee Purpose:</strong> <span style={{ color: '#ffffff' }}>{selectedPayment.feeType}</span></div>
                <div><strong style={{ color: 'var(--secondary-text)' }}>Amount Verified:</strong> <span style={{ color: '#4ade80', fontWeight: 700, fontSize: '1rem' }}>₹{selectedPayment.amount.toFixed(2)}</span></div>
                <div><strong style={{ color: 'var(--secondary-text)' }}>Payment Timestamp:</strong> <span style={{ color: '#ffffff' }}>{new Date(selectedPayment.paidAt).toLocaleString()}</span></div>
              </div>

              <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--secondary-text)' }}>
                Certified Legal Metrology payment verification.
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={() => window.print()} className="btn btn-primary">
                <Printer size={16} style={{ marginRight: 4 }} /> Print
              </button>
              <button onClick={() => setSelectedPayment(null)} className="btn btn-outline">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
