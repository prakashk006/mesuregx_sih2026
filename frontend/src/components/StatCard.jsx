import React from 'react';

export default function StatCard({ title, value, icon, color = 'blue', change = null }) {
  const colorMap = {
    blue: { bg: '#DBEAFE', text: '#1D4ED8', border: '1px solid rgba(37, 99, 235, 0.25)' },
    green: { bg: '#D1FAE5', text: '#065F46', border: '1px solid rgba(16, 185, 129, 0.25)' },
    amber: { bg: '#FEF3C7', text: '#B45309', border: '1px solid rgba(217, 119, 6, 0.25)' },
    saffron: { bg: '#FFEDD5', text: '#C2410C', border: '1px solid rgba(234, 88, 12, 0.25)' },
    purple: { bg: '#EDE9FE', text: '#6D28D9', border: '1px solid rgba(109, 40, 217, 0.25)' },
    red: { bg: '#FEE2E2', text: '#B91C1C', border: '1px solid rgba(220, 38, 38, 0.25)' },
    cyan: { bg: '#CCFBF1', text: '#0F766E', border: '1px solid rgba(15, 118, 110, 0.25)' },
    teal: { bg: '#CCFBF1', text: '#064E3B', border: '1px solid rgba(6, 78, 59, 0.25)' },
  };

  const currentTheme = colorMap[color] || colorMap.blue;

  return (
    <div className="stat-card">
      <div>
        <div className="stat-val">{value}</div>
        <div className="stat-label">{title}</div>
        {change && (
          <div style={{ fontSize: '0.75rem', marginTop: '0.35rem', color: '#64748B' }}>
            {change}
          </div>
        )}
      </div>
      <div
        className="stat-icon"
        style={{ backgroundColor: currentTheme.bg, color: currentTheme.text, border: currentTheme.border }}
      >
        {icon}
      </div>
    </div>
  );
}
