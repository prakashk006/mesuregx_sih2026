import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Bell, CheckCheck, ExternalLink, Clock } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data?.data?.notifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    try {
      await api.put('/notifications/all/read');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-body" style={{ maxWidth: 780 }}>
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
          <h1 style={{ fontSize: '1.75rem', color: '#ffffff' }}>System Notifications</h1>
          <p style={{ color: 'var(--secondary-text)', fontSize: '0.9rem' }}>
            Alerts on verification scheduling, field inspections, and certificate issuances
          </p>
        </div>

        <button onClick={markAllRead} className="btn btn-outline btn-sm">
          <CheckCheck size={16} /> Mark All as Read
        </button>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <h3>Loading Notifications...</h3>
        </div>
      ) : notifications.length === 0 ? (
        <div className="card empty-state">
          <Bell className="empty-icon" />
          <h3 style={{ fontSize: '1.2rem', color: '#ffffff' }}>No notifications found</h3>
          <p style={{ color: 'var(--secondary-text)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            You will receive updates when applications or inspections progress.
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {notifications.map((n) => (
            <div
              key={n.id}
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--glass-border)',
                background: n.isRead ? 'transparent' : 'rgba(6, 182, 212, 0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '1rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff' }}>
                    {n.title}
                  </span>
                  {!n.isRead && (
                    <span
                      style={{
                        background: '#ef4444',
                        color: 'white',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '0.1rem 0.4rem',
                        borderRadius: '999px',
                      }}
                    >
                      NEW
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.5 }}>{n.message}</p>
                {n.link && (
                  <Link
                    to={n.link}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontSize: '0.8rem',
                      color: '#06b6d4',
                      fontWeight: 600,
                      marginTop: '0.5rem',
                    }}
                  >
                    View target details <ExternalLink size={12} />
                  </Link>
                )}
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--secondary-text)', whiteSpace: 'nowrap' }}>
                {new Date(n.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
