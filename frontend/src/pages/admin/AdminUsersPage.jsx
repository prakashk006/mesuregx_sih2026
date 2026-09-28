import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, Search, CheckCircle, XCircle, ShieldCheck } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users', {
        params: { search, role: roleFilter },
      });
      setUsers(res.data?.data?.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const toggleStatus = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/toggle-status`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Status toggle failed.');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
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
          <h1 style={{ fontSize: '1.75rem', color: '#0f172a' }}>User Account Management</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Inspect registered stakeholders, roles, verification officers, and activate/deactivate accounts
          </p>
        </div>
      </div>

      {/* Filter / Search Bar */}
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
        <form onSubmit={handleSearch} style={{ flex: 1, minWidth: 260, position: 'relative' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.4rem' }}
          />
          <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
        </form>

        <div style={{ minWidth: 180 }}>
          <select
            className="form-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">All Roles</option>
            <option value="BUSINESS_OWNER">Business Owners</option>
            <option value="OFFICER">Legal Metrology Officers</option>
            <option value="ADMIN">Administrators</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <h3>Loading User Accounts...</h3>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>User / Name</th>
                <th>Email Address</th>
                <th>Role</th>
                <th>Affiliation / District</th>
                <th>Status</th>
                <th>Registered Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <strong>{u.name}</strong>
                    {u.phone && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{u.phone}</div>}
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span
                      style={{
                        padding: '0.2rem 0.55rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background:
                          u.role === 'ADMIN'
                            ? '#fef3c7'
                            : u.role === 'OFFICER'
                            ? '#eff6ff'
                            : '#ecfdf5',
                        color:
                          u.role === 'ADMIN'
                            ? '#b45309'
                            : u.role === 'OFFICER'
                            ? '#1d4ed8'
                            : '#065f46',
                      }}
                    >
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>
                    {u.business ? (
                      <div>
                        {u.business.businessName} ({u.business.district})
                      </div>
                    ) : u.officer ? (
                      <div>
                        {u.officer.officerCode} — {u.officer.district}
                      </div>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>HQ Administration</span>
                    )}
                  </td>
                  <td>
                    <StatusBadge status={u.status} />
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <button
                      onClick={() => toggleStatus(u.id)}
                      className="btn btn-outline btn-sm"
                      style={{
                        color: u.status === 'ACTIVE' ? '#dc2626' : '#059669',
                        borderColor: u.status === 'ACTIVE' ? '#fca5a5' : '#86efac',
                      }}
                    >
                      {u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                    </button>
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
