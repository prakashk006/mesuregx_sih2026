import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Sliders, Plus, CheckCircle, AlertTriangle, X, ShieldAlert } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';

export default function AdminRulesPage() {
  const [rules, setRules] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [formData, setFormData] = useState({
    instrumentTypeId: '',
    accuracyClass: 'III',
    capacityMin: 0,
    capacityMax: 50,
    allowedErrorPercent: 0.3,
    allowedErrorAbsolute: 0.03,
    validityMonths: 12,
  });

  const fetchRules = async () => {
    try {
      const [rulesRes, typesRes] = await Promise.all([
        api.get('/admin/rules'),
        api.get('/instruments/types'),
      ]);
      setRules(rulesRes.data?.data?.rules || []);
      const tList = typesRes.data?.data?.types || [];
      setTypes(tList);
      if (tList.length > 0 && !formData.instrumentTypeId) {
        setFormData((prev) => ({ ...prev, instrumentTypeId: tList[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const toggleRule = async (ruleId) => {
    try {
      await api.put(`/admin/rules/${ruleId}/toggle`);
      fetchRules();
    } catch (err) {
      alert('Failed to toggle rule.');
    }
  };

  const handleCreateRule = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await api.post('/admin/rules', formData);
      setShowModal(false);
      fetchRules();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create rule.');
    } finally {
      setFormLoading(false);
    }
  };

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
          <h1 style={{ fontSize: '1.75rem', color: '#0f172a' }}>Verification Rule Engine Limits</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Configurable Maximum Permissible Error (MPE) thresholds and certificate validity periods
          </p>
        </div>

        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={16} /> New Tolerance Rule
        </button>
      </div>

      <div
        style={{
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '10px',
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          fontSize: '0.85rem',
          color: '#1e40af',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <Sliders size={20} />
        <div>
          <strong>Legal Metrology Standard Model:</strong> Active rules below define the Maximum Permissible Error
          evaluated by the Python FastAPI engine for Class I, II, III commercial weighing machines and liquid fuel dispensers.
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <h3>Loading Verification Rules...</h3>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Instrument Type</th>
                <th>Accuracy Class</th>
                <th>Capacity Range</th>
                <th>Allowed Error (Percent)</th>
                <th>Allowed Error (Absolute)</th>
                <th>Validity Period</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong>{r.instrumentType?.name}</strong>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {r.instrumentType?.code}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: '#1e3a8a' }}>Class {r.accuracyClass}</span>
                  </td>
                  <td>
                    {r.capacityMin} – {r.capacityMax} units
                  </td>
                  <td>
                    {r.allowedErrorPercent ? `${r.allowedErrorPercent}%` : 'Standard MPE'}
                  </td>
                  <td>
                    {r.allowedErrorAbsolute ? `±${r.allowedErrorAbsolute}` : 'Dynamic ratio'}
                  </td>
                  <td>
                    <strong>{r.validityMonths} months</strong>
                  </td>
                  <td>
                    <StatusBadge status={r.isActive ? 'ACTIVE' : 'INACTIVE'} />
                  </td>
                  <td>
                    <button
                      onClick={() => toggleRule(r.id)}
                      className="btn btn-outline btn-sm"
                      style={{
                        color: r.isActive ? '#dc2626' : '#059669',
                        borderColor: r.isActive ? '#fca5a5' : '#86efac',
                      }}
                    >
                      {r.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Rule Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Create Verification Rule</h3>
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-outline btn-sm"
                style={{ border: 'none' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateRule}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Instrument Type *</label>
                  <select
                    className="form-select"
                    value={formData.instrumentTypeId}
                    onChange={(e) => setFormData({ ...formData, instrumentTypeId: e.target.value })}
                    required
                  >
                    {types.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Accuracy Class</label>
                    <select
                      className="form-select"
                      value={formData.accuracyClass}
                      onChange={(e) => setFormData({ ...formData, accuracyClass: e.target.value })}
                    >
                      <option value="I">Class I (Special Accuracy)</option>
                      <option value="II">Class II (High Accuracy)</option>
                      <option value="III">Class III (Medium Commercial)</option>
                      <option value="IIII">Class IIII (Ordinary Industrial)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Validity Period (Months)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.validityMonths}
                      onChange={(e) => setFormData({ ...formData, validityMonths: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Capacity Min</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-input"
                      value={formData.capacityMin}
                      onChange={(e) => setFormData({ ...formData, capacityMin: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Capacity Max</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-input"
                      value={formData.capacityMax}
                      onChange={(e) => setFormData({ ...formData, capacityMax: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Allowed Error (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      placeholder="e.g. 0.3"
                      value={formData.allowedErrorPercent}
                      onChange={(e) => setFormData({ ...formData, allowedErrorPercent: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Allowed Error (Absolute)</label>
                    <input
                      type="number"
                      step="0.001"
                      className="form-input"
                      placeholder="e.g. 0.03"
                      value={formData.allowedErrorAbsolute}
                      onChange={(e) => setFormData({ ...formData, allowedErrorAbsolute: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={formLoading}>
                  {formLoading ? 'Saving...' : 'Save Tolerance Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
