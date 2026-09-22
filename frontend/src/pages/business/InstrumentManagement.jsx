import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  Scale,
  Plus,
  Search,
  Filter,
  Edit2,
  FileCheck,
  Award,
  X,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';

export default function InstrumentManagement() {
  const [instruments, setInstruments] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  const [formData, setFormData] = useState({
    typeId: '',
    customId: '',
    manufacturer: '',
    model: '',
    serialNumber: '',
    capacity: 30,
    capacityUnit: 'kg',
    accuracyClass: 'III',
    purchaseDate: '',
    installationLocation: '',
    description: '',
  });

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [instRes, typesRes] = await Promise.all([
        api.get('/instruments'),
        api.get('/instruments/types'),
      ]);
      setInstruments(instRes.data?.data?.instruments || []);
      setTypes(typesRes.data?.data?.types || []);
      if (typesRes.data?.data?.types?.length > 0 && !formData.typeId) {
        setFormData((prev) => ({ ...prev, typeId: typesRes.data.data.types[0].id }));
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      typeId: types[0]?.id || '',
      customId: '',
      manufacturer: '',
      model: '',
      serialNumber: '',
      capacity: 30,
      capacityUnit: 'kg',
      accuracyClass: 'III',
      purchaseDate: '',
      installationLocation: 'Main Counter Desk',
      description: '',
    });
    setModalError('');
    setShowModal(true);
  };

  const openEditModal = (inst) => {
    setIsEditing(true);
    setCurrentId(inst.id);
    setFormData({
      typeId: inst.typeId,
      customId: inst.customId,
      manufacturer: inst.manufacturer,
      model: inst.model,
      serialNumber: inst.serialNumber,
      capacity: inst.capacity,
      capacityUnit: inst.capacityUnit,
      accuracyClass: inst.accuracyClass,
      purchaseDate: inst.purchaseDate ? inst.purchaseDate.slice(0, 10) : '',
      installationLocation: inst.installationLocation,
      description: inst.description || '',
    });
    setModalError('');
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setModalError('');

    try {
      if (isEditing) {
        await api.put(`/instruments/${currentId}`, formData);
      } else {
        await api.post('/instruments', formData);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to save instrument.');
    } finally {
      setFormLoading(false);
    }
  };

  const filteredInstruments = instruments.filter((inst) => {
    const matchesSearch =
      !search ||
      inst.customId.toLowerCase().includes(search.toLowerCase()) ||
      inst.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
      inst.manufacturer.toLowerCase().includes(search.toLowerCase()) ||
      inst.model.toLowerCase().includes(search.toLowerCase());

    const matchesType = selectedType === 'ALL' || inst.typeId === selectedType;
    const matchesStatus = selectedStatus === 'ALL' || inst.status === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="page-body">
      {/* Header */}
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
          <h1 style={{ fontSize: '1.75rem', color: '#0f172a' }}>Measuring Instruments</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Manage commercial weights, scales, dispensers, and metrology testing records
          </p>
        </div>

        <button onClick={openCreateModal} className="btn btn-primary">
          <Plus size={16} /> Register New Instrument
        </button>
      </div>

      {/* Filters Bar */}
      <div
        className="card"
        style={{
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by ID, Serial, Make, or Model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.4rem' }}
          />
          <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
        </div>

        <div style={{ minWidth: 200 }}>
          <select
            className="form-select"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="ALL">All Instrument Types</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ minWidth: 160 }}>
          <select
            className="form-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="VERIFIED">Verified</option>
            <option value="PENDING_VERIFICATION">Pending Verification</option>
            <option value="EXPIRED">Expired</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <h3>Loading Instruments...</h3>
        </div>
      ) : filteredInstruments.length === 0 ? (
        <div className="card empty-state">
          <Scale className="empty-icon" />
          <h3 style={{ fontSize: '1.2rem', color: '#0f172a' }}>No measuring instruments found</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem', marginBottom: '1.5rem' }}>
            Register your first weighing machine or commercial measuring unit to begin verification.
          </p>
          <button onClick={openCreateModal} className="btn btn-primary">
            <Plus size={16} /> Register First Instrument
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Instrument ID</th>
                <th>Type</th>
                <th>Make & Model</th>
                <th>Capacity</th>
                <th>Location</th>
                <th>Status</th>
                <th>Latest Certificate</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInstruments.map((inst) => (
                <tr key={inst.id}>
                  <td>
                    <strong style={{ color: '#38bdf8' }}>{inst.customId}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)' }}>
                      S/N: {inst.serialNumber}
                    </div>
                  </td>
                  <td>{inst.instrumentType}</td>
                  <td>
                    {inst.manufacturer} {inst.model}
                  </td>
                  <td>
                    <strong>
                      {inst.capacity} {inst.capacityUnit}
                    </strong>{' '}
                    <span style={{ fontSize: '0.75rem', color: 'var(--secondary-text)' }}>
                      (Class {inst.accuracyClass})
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{inst.installationLocation}</td>
                  <td>
                    <StatusBadge status={inst.status} />
                  </td>
                  <td>
                    {inst.latestCertificate ? (
                      <div>
                        <Link
                          to={`/verify/${inst.latestCertificate.certificateNumber}`}
                          style={{ color: '#06b6d4', fontWeight: 600, fontSize: '0.85rem' }}
                        >
                          {inst.latestCertificate.certificateNumber}
                        </Link>
                        <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)' }}>
                          Exp: {new Date(inst.latestCertificate.expiryDate).toLocaleDateString()}
                        </div>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--secondary-text)' }}>None</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <Link
                        to={`/business/applications/new?instrumentId=${inst.id}`}
                        className="btn btn-primary btn-sm"
                        title="Apply Verification"
                      >
                        <FileCheck size={14} /> Apply
                      </Link>
                      <button
                        onClick={() => openEditModal(inst)}
                        className="btn btn-outline btn-sm"
                        title="Edit Details"
                      >
                        <Edit2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Registration / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>
                {isEditing ? `Edit Instrument (${formData.customId})` : 'Register Measuring Instrument'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-outline btn-sm"
                style={{ border: 'none', padding: '0.35rem' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="modal-body">
                {modalError && (
                  <div
                    style={{
                      padding: '0.75rem',
                      background: 'rgba(239, 68, 68, 0.16)',
                      color: '#f87171',
                      border: '1px solid rgba(239, 68, 68, 0.35)',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <AlertCircle size={16} /> {modalError}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Instrument Type *</label>
                    <select
                      className="form-select"
                      value={formData.typeId}
                      onChange={(e) => setFormData({ ...formData, typeId: e.target.value })}
                      required
                    >
                      {types.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Custom Instrument ID (Optional)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. WX-1001 (Auto-generated if empty)"
                      value={formData.customId}
                      onChange={(e) => setFormData({ ...formData, customId: e.target.value })}
                      disabled={isEditing}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Manufacturer / Brand *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Essae-Teraoka Ltd"
                      value={formData.manufacturer}
                      onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Model Name / Number *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. DS-215 Commercial"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Serial Number *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. ES-2024-98711"
                      value={formData.serialNumber}
                      onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Capacity *</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      placeholder="e.g. 30"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Unit</label>
                    <select
                      className="form-select"
                      value={formData.capacityUnit}
                      onChange={(e) => setFormData({ ...formData, capacityUnit: e.target.value })}
                    >
                      <option value="kg">kg (Kilograms)</option>
                      <option value="g">g (Grams)</option>
                      <option value="L">L (Litres)</option>
                      <option value="m">m (Meters)</option>
                    </select>
                  </div>

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
                </div>

                <div className="form-group">
                  <label className="form-label">Installation / Operating Location *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Main Billing Desk Counter 1"
                    value={formData.installationLocation}
                    onChange={(e) => setFormData({ ...formData, installationLocation: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description / Remarks</label>
                  <textarea
                    className="form-textarea"
                    rows="2"
                    placeholder="Additional notes, dual display details, usage notes..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-outline"
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={formLoading}>
                  {formLoading ? 'Saving...' : isEditing ? 'Update Instrument' : 'Register Instrument'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
