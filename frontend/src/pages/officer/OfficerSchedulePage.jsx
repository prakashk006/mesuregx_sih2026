import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Calendar, Clock, MapPin, ClipboardCheck, ArrowRight } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';

export default function OfficerSchedulePage() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSchedule() {
      try {
        const res = await api.get('/assignments');
        setAssignments(res.data?.data?.assignments || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSchedule();
  }, []);

  return (
    <div className="page-body">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', color: '#0f172a' }}>Inspection Schedule</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Calendar queue of assigned field verification visits and testing appointments
        </p>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <h3>Loading Inspection Schedule...</h3>
        </div>
      ) : assignments.length === 0 ? (
        <div className="card empty-state">
          <Calendar className="empty-icon" />
          <h3 style={{ fontSize: '1.2rem', color: '#0f172a' }}>No scheduled inspections</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Check the application review queue to schedule upcoming verification visits.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Scheduled Date & Time</th>
                <th>Application ID</th>
                <th>Establishment</th>
                <th>Instrument</th>
                <th>Inspection Location</th>
                <th>Instructions</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((assign) => (
                <tr key={assign.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>
                      {new Date(assign.scheduledDate).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600 }}>
                      <Clock size={12} style={{ display: 'inline' }} /> {assign.scheduledTime || '10:00 AM'}
                    </div>
                  </td>
                  <td>
                    <strong style={{ color: '#1e3a8a' }}>
                      {assign.application?.applicationNumber}
                    </strong>
                  </td>
                  <td>
                    <strong>{assign.application?.business?.businessName}</strong>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Owner: {assign.application?.business?.ownerName} ({assign.application?.business?.mobile})
                    </div>
                  </td>
                  <td>
                    <strong>{assign.application?.instrument?.customId}</strong>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {assign.application?.instrument?.instrumentType?.name} ({assign.application?.instrument?.capacity} {assign.application?.instrument?.capacityUnit})
                    </div>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>
                    <MapPin size={12} style={{ display: 'inline', color: '#0891b2' }} /> {assign.location}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#475569', maxWidth: 240 }}>
                    {assign.instructions}
                  </td>
                  <td>
                    <Link
                      to={`/officer/verification/${assign.applicationId}`}
                      className="btn btn-primary btn-sm"
                    >
                      <ClipboardCheck size={14} /> Start Test
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
