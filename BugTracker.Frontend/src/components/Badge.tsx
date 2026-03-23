import React from 'react';

const colors: Record<string, { bg: string; color: string }> = {
  Low:        { bg: '#052e16', color: '#4ade80' },
  Medium:     { bg: '#422006', color: '#fb923c' },
  High:       { bg: '#450a0a', color: '#f87171' },
  Open:       { bg: '#172554', color: '#60a5fa' },
  InProgress: { bg: '#312e81', color: '#a5b4fc' },
  Resolved:   { bg: '#052e16', color: '#4ade80' },
  Closed:     { bg: '#1c1c1c', color: '#888' },
};

const Badge: React.FC<{ label: string }> = ({ label }) => {
  const style = colors[label] ?? { bg: '#1e1e2e', color: '#aaa' };
  return (
    <span style={{
      background: style.bg,
      color: style.color,
      padding: '3px 10px',
      borderRadius: '20px',
      fontSize: '0.72rem',
      fontWeight: 600,
      letterSpacing: '0.04em',
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  );
};

export default Badge;
